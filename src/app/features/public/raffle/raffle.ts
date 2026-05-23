import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, finalize, firstValueFrom, map, of } from 'rxjs';
import {
    RaffleDetailResponse,
    RaffleListItem,
    RaffleNumber
} from '../../../shared/models/api-contracts.models';
import { PublicRaffleApiService } from '../../../shared/services/public-raffle-api.service';

interface RaffleDetailData {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  drawDate: string | null;
  extractionNumber?: number | null;
  ticketPrice: number;
  status: 'active' | 'coming' | 'finished';
  reservationTimeoutMinutes: number;
  numbers: RaffleNumber[];
  progress: number;
  total: number;
  sold: number;
  winnerInfo?: {
    name: string | null;
    winnerNumber: number;
    drawDate?: string;
  };
}

interface PendingReservation {
  number: number;
  reservationCode: string;
  reservedUntil: string;
  receiptFile: File | null;
  sendingReceipt: boolean;
}

interface AuthUserStorage {
  role?: string;
}

@Component({
  selector: 'app-raffle',
  imports: [DecimalPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./raffle.scss'],
  templateUrl: './raffle.html'
})
export class Raffle {
  private readonly raffleApi = inject(PublicRaffleApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeRaffles = signal<RaffleListItem[]>([]);
  readonly finishedRaffles = signal<RaffleListItem[]>([]);
  readonly finishedRafflesPage = signal(1);
  readonly finishedRafflesPages = signal(1);
  readonly finishedExtractionNumberInput = signal('');
  readonly finishedExtractionNumberFilter = signal('');
  readonly currentRaffleIndex = signal(0);
  readonly selectedRaffle = signal<RaffleDetailData | null>(null);
  readonly selectedNumbers = signal<number[]>([]);
  readonly pendingReservations = signal<PendingReservation[]>([]);
  readonly actionMessage = signal<string | null>(null);
  readonly memberLoginModalMessage = signal<string | null>(null);
  readonly submittingReservation = signal(false);

  readonly hasMultipleRaffles = computed(() => this.activeRaffles().length > 1);
  readonly hasFinishedRaffles = computed(() => this.finishedRaffles().length > 0);

  public constructor() {
    this.loadRaffles();
  }

  isSelected(num: number): boolean {
    return this.selectedNumbers().includes(num);
  }

  openRaffle(item: RaffleListItem, index?: number): void {
    this.actionMessage.set(null);
    this.selectedNumbers.set([]);
    this.pendingReservations.set([]);

    if (index !== undefined) {
      this.currentRaffleIndex.set(index);
    }

    this.raffleApi
      .getRaffleByIdOrSlug(item.slug)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((detail) => this.mapFromDetail(detail)),
        catchError(() => of(this.mapFromListItem(item)))
      )
      .subscribe({
        next: (detail) => {
          this.selectedRaffle.set(detail);
        },
        error: () => {
          this.error.set('Nao foi possivel carregar a rifa selecionada.');
        },
      });
  }

  previousRaffle(): void {
    const items = this.activeRaffles();

    if (items.length <= 1) {
      return;
    }

    const nextIndex = (this.currentRaffleIndex() - 1 + items.length) % items.length;
    this.openRaffle(items[nextIndex], nextIndex);
  }

  nextRaffle(): void {
    const items = this.activeRaffles();

    if (items.length <= 1) {
      return;
    }

    const nextIndex = (this.currentRaffleIndex() + 1) % items.length;
    this.openRaffle(items[nextIndex], nextIndex);
  }

  updateFinishedSearchInput(value: string): void {
    this.finishedExtractionNumberInput.set(value);
  }

  searchFinishedByExtractionNumber(): void {
    this.finishedExtractionNumberFilter.set(this.finishedExtractionNumberInput().trim());
    void this.loadFinishedRaffles(1);
  }

  previousFinishedPage(): void {
    const page = this.finishedRafflesPage();
    if (page <= 1) {
      return;
    }

    void this.loadFinishedRaffles(page - 1);
  }

  nextFinishedPage(): void {
    const page = this.finishedRafflesPage();
    const pages = this.finishedRafflesPages();

    if (page >= pages) {
      return;
    }

    void this.loadFinishedRaffles(page + 1);
  }

  toggleNumber(n: RaffleNumber): void {
    if (n.status !== 'available') {
      return;
    }

    const current = this.selectedNumbers();

    if (current.includes(n.number)) {
      this.selectedNumbers.set(current.filter((value) => value !== n.number));
      return;
    }

    this.selectedNumbers.set([...current, n.number]);
  }

  onReceiptSelected(number: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (!file) {
      input.value = '';
      return;
    }

    this.pendingReservations.update((reservations) =>
      reservations.map((reservation) =>
        reservation.number === number
          ? {
              ...reservation,
              receiptFile: file,
            }
          : reservation
      )
    );

    input.value = '';
  }

  async reserveSelectedNumbers(): Promise<void> {
    const raffle = this.selectedRaffle();
    const numbers = this.selectedNumbers();

    if (!raffle || numbers.length === 0 || raffle.status !== 'active') {
      return;
    }

    if (!this.isMemberAuthenticated()) {
      this.openMemberLoginModal('Para reservar pontos, faça login na área de membro.');
      return;
    }

    this.submittingReservation.set(true);
    this.actionMessage.set(null);

    const reserved: PendingReservation[] = [];
    let failed = 0;

    for (const number of numbers) {
      try {
        const response = await firstValueFrom(this.raffleApi.reserveNumber(raffle.id, number, {}));

        reserved.push({
          number,
          reservationCode: response.data.reservationCode,
          reservedUntil: response.data.reservedUntil,
          receiptFile: null,
          sendingReceipt: false,
        });
      } catch {
        failed++;
      }
    }

    this.submittingReservation.set(false);

    if (reserved.length > 0) {
      this.pendingReservations.set(reserved);
      this.selectedNumbers.set([]);
      this.actionMessage.set(
        failed > 0
          ? 'Alguns pontos foram reservados e outros nao estavam mais disponiveis.'
          : 'Pontos reservados. Agora envie o comprovante de cada ponto reservado.'
      );
      this.refreshSelectedRaffle();
      return;
    }

    this.actionMessage.set('Nao foi possivel reservar os pontos selecionados.');
  }

  sendReceipt(number: number): void {
    const raffle = this.selectedRaffle();
    const reservation = this.pendingReservations().find((entry) => entry.number === number);

    if (!raffle || !reservation || !reservation.receiptFile || reservation.sendingReceipt) {
      return;
    }

    if (!this.isMemberAuthenticated()) {
      this.openMemberLoginModal('Para concluir a compra, faça login na área de membro.');
      return;
    }

    this.pendingReservations.update((reservations) =>
      reservations.map((entry) =>
        entry.number === number
          ? {
              ...entry,
              sendingReceipt: true,
            }
          : entry
      )
    );

    this.actionMessage.set(null);

    this.raffleApi
      .uploadReservationReceipt(raffle.id, number, reservation.reservationCode, reservation.receiptFile)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pendingReservations.update((reservations) =>
            reservations.map((entry) =>
              entry.number === number
                ? {
                    ...entry,
                    sendingReceipt: false,
                  }
                : entry
            )
          );
        })
      )
      .subscribe({
        next: () => {
          this.pendingReservations.update((reservations) =>
            reservations.filter((entry) => entry.number !== number)
          );

          this.actionMessage.set('Comprovante enviado com sucesso. Aguarde a confirmação do administrador.');
          this.refreshSelectedRaffle();
        },
        error: () => {
          this.actionMessage.set('Nao foi possivel enviar o comprovante deste ponto.');
        },
      });
  }

  private loadRaffles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.raffleApi
      .getRaffleList({ limit: 50, status: 'active', sort: 'newest' })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((response) => response.data)
      )
      .subscribe({
        next: (raffles) => {
          this.activeRaffles.set(raffles);

          if (raffles.length === 0) {
            this.error.set('Nenhuma rifa disponivel no momento.');
            this.loading.set(false);
          } else {
            this.currentRaffleIndex.set(0);
            const firstToOpen = raffles[0] ?? null;

            if (firstToOpen) {
              this.openRaffle(firstToOpen, 0);
            }

            this.loading.set(false);
          }

          void this.loadFinishedRaffles(1);
        },
        error: () => {
          this.error.set('Nao foi possivel carregar os dados das rifas.');
          this.loading.set(false);
        }
      });
  }

  private async loadFinishedRaffles(page: number): Promise<void> {
    const parsedExtractionNumber = Number(this.finishedExtractionNumberFilter().trim());

    try {
      const response = await firstValueFrom(
        this.raffleApi.getRaffleList({
          limit: 10,
          page,
          status: 'finished',
          includeOld: true,
          sort: 'newest',
          extractionNumber: Number.isFinite(parsedExtractionNumber) && parsedExtractionNumber > 0
            ? Math.floor(parsedExtractionNumber)
            : undefined,
        })
      );

      this.finishedRaffles.set(response.data);
      this.finishedRafflesPage.set(response.pagination.page);
      this.finishedRafflesPages.set(response.pagination.pages);
    } catch {
      this.finishedRaffles.set([]);
      this.finishedRafflesPage.set(1);
      this.finishedRafflesPages.set(1);
    }
  }

  private refreshSelectedRaffle(): void {
    const selected = this.selectedRaffle();

    if (!selected) {
      return;
    }

    this.raffleApi
      .getRaffleByIdOrSlug(selected.slug)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((detail) => this.mapFromDetail(detail)),
      )
      .subscribe({
        next: (detail) => {
          this.selectedRaffle.set(detail);
        },
      });
  }

  private mapFromDetail(raffle: RaffleDetailResponse): RaffleDetailData {
    return {
      id: raffle.id,
      slug: raffle.slug,
      title: raffle.title,
      description: raffle.description,
      image: raffle.image,
      drawDate: raffle.drawDate,
      extractionNumber: raffle.extractionNumber,
      ticketPrice: raffle.ticketPrice,
      status: raffle.status,
      reservationTimeoutMinutes: raffle.reservationTimeoutMinutes ?? 30,
      numbers: raffle.numbers,
      progress: raffle.progress,
      total: raffle.ticketsAvailable,
      sold: raffle.ticketsSold,
      winnerInfo: raffle.winnerInfo
        ? {
            name: raffle.winnerInfo.name,
            winnerNumber: raffle.winnerInfo.winnerNumber,
            drawDate: raffle.winnerInfo.drawDate,
          }
        : undefined,
    };
  }

  private mapFromListItem(raffle: RaffleListItem): RaffleDetailData {
    return {
      id: raffle.id,
      slug: raffle.slug,
      title: raffle.title,
      description: raffle.description,
      image: raffle.image,
      drawDate: raffle.drawDate,
      extractionNumber: raffle.extractionNumber,
      ticketPrice: raffle.ticketPrice,
      status: raffle.status,
      reservationTimeoutMinutes: raffle.reservationTimeoutMinutes ?? 30,
      numbers: this.generateFallbackNumbers(raffle.ticketsAvailable, raffle.ticketsSold),
      progress: raffle.progress,
      total: raffle.ticketsAvailable,
      sold: raffle.ticketsSold,
    };
  }

  private generateFallbackNumbers(total: number, sold: number): RaffleNumber[] {
    const safeTotal = Math.min(Math.max(total, 1), 250);
    const safeSold = Math.min(Math.max(sold, 0), safeTotal);

    return Array.from({ length: safeTotal }, (_, index) => ({
      number: index + 1,
      status: index < safeSold ? 'occupied' : 'available'
    }));
  }

  private isMemberAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
    const rawUser = localStorage.getItem('auth_user') ?? sessionStorage.getItem('auth_user');

    if (!token || !rawUser) {
      return false;
    }

    try {
      const user = JSON.parse(rawUser) as AuthUserStorage;
      return user.role === 'buyer';
    } catch {
      return false;
    }
  }

  closeMemberLoginModal(): void {
    this.memberLoginModalMessage.set(null);
  }

  goToLogin(): void {
    this.closeMemberLoginModal();
    void this.router.navigate(['/login']);
  }

  private openMemberLoginModal(message: string): void {
    this.memberLoginModalMessage.set(message);
  }
}
