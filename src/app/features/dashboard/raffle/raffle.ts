import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RaffleCreateForm } from './components/raffle-create-form/raffle-create-form';
import { RaffleDrawConfirm } from './components/raffle-draw-confirm/raffle-draw-confirm';
import { RaffleEmptyState } from './components/raffle-empty-state/raffle-empty-state';
import { RaffleList } from './components/raffle-list/raffle-list';
import { CreateRafflePayload, RaffleCampaign, RaffleStatus } from './raffle.models';

type RaffleView = 'empty' | 'list' | 'create';

const INITIAL_RAFFLES: readonly RaffleCampaign[] = [
  {
    id: 1,
    title: 'Cesta de Cafe da Manha Regional',
    description: 'Campanha solidaria para arrecadacao da cooperativa local de artesaos.',
    rangeStart: 1,
    rangeEnd: 200,
    soldTickets: 150,
    ticketPrice: 10,
    status: 'active',
  },
  {
    id: 2,
    title: 'Violao Autografado',
    description: 'Apoio para oficinas de musica para criancas atendidas pelo projeto.',
    rangeStart: 1,
    rangeEnd: 100,
    soldTickets: 40,
    ticketPrice: 20,
    status: 'draft',
  },
  {
    id: 3,
    title: 'Jantar Nordestino para Dois',
    description: 'Campanha finalizada com ganhador definido e entrega em andamento.',
    rangeStart: 1,
    rangeEnd: 100,
    soldTickets: 100,
    ticketPrice: 17.5,
    status: 'closed',
    winnerName: 'Maria Silva',
    winnerNumber: 42,
  },
];

@Component({
  selector: 'raffle',
  imports: [RaffleEmptyState, RaffleList, RaffleCreateForm, RaffleDrawConfirm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './raffle.html',
  styleUrl: './raffle.scss',
})
export class Raffle {
  protected readonly raffles = signal<RaffleCampaign[]>([...INITIAL_RAFFLES]);
  protected readonly view = signal<RaffleView>('list');
  protected readonly search = signal('');
  protected readonly filter = signal<RaffleStatus | 'all'>('all');
  protected readonly editingId = signal<number | null>(null);
  protected readonly drawId = signal<number | null>(null);

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

  protected readonly hasRaffles = computed(() => this.raffles().length > 0);

  protected openCreate(): void {
    this.editingId.set(null);
    this.view.set('create');
  }

  protected openEdit(id: number): void {
    this.editingId.set(id);
    this.view.set('create');
  }

  protected backToList(): void {
    this.view.set(this.hasRaffles() ? 'list' : 'empty');
    this.editingId.set(null);
  }

  protected saveRaffle(payload: CreateRafflePayload): void {
    const editingId = this.editingId();

    if (editingId !== null) {
      this.raffles.update((items) =>
        items.map((raffle) =>
          raffle.id === editingId
            ? {
                ...raffle,
                ...payload,
              }
            : raffle
        )
      );
    } else {
      this.raffles.update((items) => {
        const nextId = Math.max(0, ...items.map((item) => item.id)) + 1;
        const created: RaffleCampaign = {
          id: nextId,
          ...payload,
          soldTickets: 0,
          status: 'draft',
        };
        return [created, ...items];
      });
    }

    this.backToList();
  }

  protected deleteRaffle(id: number): void {
    this.raffles.update((items) => items.filter((raffle) => raffle.id !== id));
    if (this.raffles().length === 0) {
      this.view.set('empty');
    }
  }

  protected openDraw(id: number): void {
    this.drawId.set(id);
  }

  protected closeDraw(): void {
    this.drawId.set(null);
  }

  protected confirmDraw(): void {
    const id = this.drawId();
    if (id === null) return;

    this.raffles.update((items) =>
      items.map((raffle) => {
        if (raffle.id !== id) return raffle;

        const winner = raffle.rangeStart + Math.floor(Math.random() * (raffle.rangeEnd - raffle.rangeStart + 1));
        return {
          ...raffle,
          status: 'closed',
          winnerName: 'Ganhador Sorteado',
          winnerNumber: winner,
        };
      })
    );

    this.closeDraw();
  }
}
