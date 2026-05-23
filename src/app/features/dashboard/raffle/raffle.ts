import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RaffleCreateForm } from './components/raffle-create-form/raffle-create-form';
import { RaffleDetails } from './components/raffle-details/raffle-details';
import { RaffleDrawConfirm } from './components/raffle-draw-confirm/raffle-draw-confirm';
import { RaffleEmptyState } from './components/raffle-empty-state/raffle-empty-state';
import { RaffleList } from './components/raffle-list/raffle-list';
import { CreateRafflePayload, DrawRafflePayload, RaffleStatus } from './raffle.models';
import { RaffleStore } from './raffle.store';

type RaffleView = 'empty' | 'list' | 'create' | 'details';

@Component({
  selector: 'raffle',
  imports: [RaffleEmptyState, RaffleList, RaffleCreateForm, RaffleDrawConfirm, RaffleDetails],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './raffle.html',
  styleUrl: './raffle.scss',
})
export class Raffle {
  private readonly raffleStore = inject(RaffleStore);

  protected readonly raffles = this.raffleStore.raffles;
  protected readonly view = signal<RaffleView>('list');
  protected readonly search = signal('');
  protected readonly filter = signal<RaffleStatus | 'all'>('all');
  protected readonly editingId = signal<number | null>(null);
  protected readonly detailsId = signal<number | null>(null);
  protected readonly drawId = signal<number | null>(null);
  protected readonly deleteId = signal<number | null>(null);
  protected readonly drawError = signal<string | null>(null);
  protected readonly isDrawing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly isActivating = signal(false);
  protected readonly isUpdatingTimeout = signal(false);
  protected readonly isConfirmingPayment = signal(false);

  protected readonly editingRaffle = computed(() => {
    const id = this.editingId();
    if (id === null) return null;
    return this.raffles().find((raffle) => raffle.id === id) ?? null;
  });

  protected readonly drawRaffle = computed(() => {
    const id = this.drawId();
    if (id === null) return null;
    return this.raffles().find((raffle) => raffle.id === id) ?? null;
  });

  protected readonly detailsRaffle = computed(() => {
    const id = this.detailsId();
    if (id === null) return null;
    return this.raffles().find((raffle) => raffle.id === id) ?? null;
  });

  protected readonly hasRaffles = computed(() => this.raffles().length > 0);

  public constructor() {
    this.loadRaffles();
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.detailsId.set(null);
    this.view.set('create');
  }

  protected openEdit(id: number): void {
    this.editingId.set(id);
    this.detailsId.set(null);
    this.view.set('create');
  }

  protected openDetails(id: number): void {
    this.detailsId.set(id);
    this.view.set('details');
  }

  protected backToList(): void {
    this.view.set(this.hasRaffles() ? 'list' : 'empty');
    this.editingId.set(null);
    this.detailsId.set(null);
  }

  protected async saveRaffle(payload: CreateRafflePayload): Promise<void> {
    const editingId = this.editingId();

    this.isSaving.set(true);
    this.drawError.set(null);

    try {
      if (editingId !== null) {
        await firstValueFrom(this.raffleStore.update(editingId, payload));
      } else {
        await firstValueFrom(this.raffleStore.create(payload));
      }

      this.backToList();
    } catch {
      this.drawError.set('Nao foi possivel salvar a rifa no backend.');
    } finally {
      this.isSaving.set(false);
    }
  }

  protected requestDelete(id: number): void {
    this.deleteId.set(id);
  }

  protected cancelDelete(): void {
    this.deleteId.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const id = this.deleteId();
    if (id === null) {
      return;
    }

    this.isDeleting.set(true);
    this.drawError.set(null);

    try {
      await firstValueFrom(this.raffleStore.remove(id));
      this.deleteId.set(null);

      if (this.raffles().length === 0) {
        this.view.set('empty');
        this.detailsId.set(null);
        return;
      }

      if (this.view() === 'details') {
        this.view.set('list');
        this.detailsId.set(null);
      }
    } catch {
      this.drawError.set('Nao foi possivel excluir a rifa no backend.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  protected openDraw(id: number): void {
    this.drawId.set(id);
    this.drawError.set(null);
  }

  protected async activateRaffle(id: number): Promise<void> {
    this.isActivating.set(true);
    this.drawError.set(null);

    try {
      await firstValueFrom(this.raffleStore.activate(id));
    } catch {
      this.drawError.set('Nao foi possivel ativar a rifa no backend.');
    } finally {
      this.isActivating.set(false);
    }
  }

  protected async confirmReservedPayment(payload: { raffleId: number; number: number; reservationCode?: string }): Promise<void> {
    this.isConfirmingPayment.set(true);
    this.drawError.set(null);

    try {
      await firstValueFrom(
        this.raffleStore.confirmReservedPayment(payload.raffleId, payload.number, payload.reservationCode)
      );
    } catch {
      this.drawError.set('Nao foi possivel confirmar o pagamento deste ponto reservado.');
    } finally {
      this.isConfirmingPayment.set(false);
    }
  }

  protected async updateReservationTimeout(payload: { raffleId: number; reservationTimeoutMinutes: number }): Promise<void> {
    this.isUpdatingTimeout.set(true);
    this.drawError.set(null);

    try {
      await firstValueFrom(
        this.raffleStore.updateReservationTimeout(payload.raffleId, payload.reservationTimeoutMinutes)
      );
    } catch {
      this.drawError.set('Nao foi possivel atualizar o tempo de reserva da rifa.');
    } finally {
      this.isUpdatingTimeout.set(false);
    }
  }

  protected closeDraw(): void {
    this.drawId.set(null);
    this.drawError.set(null);
  }

  protected async confirmDraw(payload: DrawRafflePayload): Promise<void> {
    const id = this.drawId();
    if (id === null) return;

    this.isDrawing.set(true);
    this.drawError.set(null);

    try {
      const result = await firstValueFrom(this.raffleStore.requestDrawFromBackend(id, payload));
      this.raffleStore.applyDrawResult(id, result);
      this.closeDraw();
      this.view.set('list');
    } catch {
      this.drawError.set('Nao foi possivel concluir o sorteio. Verifique o numero informado.');
    } finally {
      this.isDrawing.set(false);
    }
  }

  private async loadRaffles(): Promise<void> {
    try {
      await firstValueFrom(this.raffleStore.loadFromBackend());
      this.view.set(this.hasRaffles() ? 'list' : 'empty');
    } catch {
      this.drawError.set('Nao foi possivel carregar as rifas do backend.');
      this.view.set(this.hasRaffles() ? 'list' : 'empty');
    }
  }
}
