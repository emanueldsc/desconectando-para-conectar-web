import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RaffleCreateForm } from './components/raffle-create-form/raffle-create-form';
import { RaffleDetails } from './components/raffle-details/raffle-details';
import { RaffleDrawConfirm } from './components/raffle-draw-confirm/raffle-draw-confirm';
import { RaffleEmptyState } from './components/raffle-empty-state/raffle-empty-state';
import { RaffleList } from './components/raffle-list/raffle-list';
import { CreateRafflePayload, RaffleStatus } from './raffle.models';
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
  protected readonly drawError = signal<string | null>(null);
  protected readonly isDrawing = signal(false);

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

  protected saveRaffle(payload: CreateRafflePayload): void {
    const editingId = this.editingId();

    if (editingId !== null) {
      this.raffleStore.update(editingId, payload);
    } else {
      this.raffleStore.create(payload);
    }

    this.backToList();
  }

  protected deleteRaffle(id: number): void {
    this.raffleStore.remove(id);
    if (this.raffles().length === 0) {
      this.view.set('empty');
      this.detailsId.set(null);
      return;
    }

    if (this.view() === 'details') {
      this.view.set('list');
      this.detailsId.set(null);
    }
  }

  protected openDraw(id: number): void {
    this.drawId.set(id);
    this.drawError.set(null);
  }

  protected closeDraw(): void {
    this.drawId.set(null);
    this.drawError.set(null);
  }

  protected async confirmDraw(): Promise<void> {
    const id = this.drawId();
    if (id === null) return;

    this.isDrawing.set(true);
    this.drawError.set(null);

    try {
      const result = await firstValueFrom(this.raffleStore.requestDrawFromBackend(id));
      this.raffleStore.applyDrawResult(id, result);
      this.closeDraw();
      this.view.set('list');
    } catch {
      this.drawError.set('Nao foi possivel concluir o sorteio. Tente novamente com o backend disponível.');
    } finally {
      this.isDrawing.set(false);
    }
  }
}
