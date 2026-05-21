import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import {
    RaffleDetailResponse,
    RaffleListItem,
    RaffleNumber
} from '../../../shared/models/api-contracts.models';
import { PublicRaffleApiService } from '../../../shared/services/public-raffle-api.service';

interface RaffleDetailData {
  title: string;
  description: string;
  image: string;
  drawDate: string;
  ticketPrice: number;
  numbers: RaffleNumber[];
  progress: number;
  total: number;
  sold: number;
}

@Component({
  selector: 'app-raffle',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./raffle.scss'],
  templateUrl: './raffle.html'
})
export class Raffle {
  private readonly raffleApi = inject(PublicRaffleApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<RaffleDetailData | null>(null);
  readonly selectedNumbers = signal<number[]>([]);

  public constructor() {
    this.loadRaffle();
  }

  isSelected(num: number): boolean {
    return this.selectedNumbers().includes(num);
  }

  toggleNumber(n: RaffleNumber): void {
    if (n.status === 'occupied') {
      return;
    }

    const current = this.selectedNumbers();

    if (current.includes(n.number)) {
      this.selectedNumbers.set(current.filter((value) => value !== n.number));
    } else {
      this.selectedNumbers.set([...current, n.number]);
    }
  }

  private loadRaffle(): void {
    this.loading.set(true);
    this.error.set(null);

    this.raffleApi
      .getRaffleList({ limit: 1, status: 'active', sort: 'newest' })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((response) => {
          const firstRaffle = response.data[0];

          if (!firstRaffle) {
            return of(null);
          }

          return this.raffleApi.getRaffleByIdOrSlug(firstRaffle.slug).pipe(
            map((detail) => this.mapFromDetail(detail)),
            catchError(() => of(this.mapFromListItem(firstRaffle)))
          );
        })
      )
      .subscribe({
        next: (raffle) => {
          if (!raffle) {
            this.error.set('Nenhuma rifa disponivel no momento.');
            this.loading.set(false);
            return;
          }

          this.data.set(raffle);
          this.selectedNumbers.set([]);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Nao foi possivel carregar os dados das rifas.');
          this.loading.set(false);
        }
      });
  }

  private mapFromDetail(raffle: RaffleDetailResponse): RaffleDetailData {
    return {
      title: raffle.title,
      description: raffle.description,
      image: raffle.image,
      drawDate: raffle.drawDate,
      ticketPrice: raffle.ticketPrice,
      numbers: raffle.numbers,
      progress: raffle.progress,
      total: raffle.ticketsAvailable,
      sold: raffle.ticketsSold
    };
  }

  private mapFromListItem(raffle: RaffleListItem): RaffleDetailData {
    return {
      title: raffle.title,
      description: raffle.description,
      image: raffle.image,
      drawDate: raffle.drawDate,
      ticketPrice: raffle.ticketPrice,
      numbers: this.generateFallbackNumbers(raffle.ticketsAvailable, raffle.ticketsSold),
      progress: raffle.progress,
      total: raffle.ticketsAvailable,
      sold: raffle.ticketsSold
    };
  }

  private generateFallbackNumbers(total: number, sold: number): RaffleNumber[] {
    const safeTotal = Math.min(Math.max(total, 1), 120);
    const safeSold = Math.min(Math.max(sold, 0), safeTotal);

    return Array.from({ length: safeTotal }, (_, index) => ({
      number: index + 1,
      status: index < safeSold ? 'occupied' : 'available'
    }));
  }
}
