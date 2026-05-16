import { computed, Injectable, signal } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { CreateRafflePayload, DrawRaffleResult, RaffleCampaign } from './raffle.models';

const INITIAL_RAFFLES: readonly RaffleCampaign[] = [
  {
    id: 1,
    title: 'Cesta de Cafe da Manha Regional',
    description: 'Campanha solidaria para arrecadacao da cooperativa local de artesaos.',
    rangeStart: 1,
    rangeEnd: 200,
    soldTickets: 200,
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

const BACKEND_DRAW_RESULTS: Readonly<Record<number, Omit<DrawRaffleResult, 'processedAt'>>> = {
  1: {
    winnerName: 'Josefa Nascimento',
    winnerNumber: 88,
  },
  2: {
    winnerName: 'Raimundo Alves',
    winnerNumber: 17,
  },
};

@Injectable({ providedIn: 'root' })
export class RaffleStore {
  private readonly rafflesState = signal<RaffleCampaign[]>([...INITIAL_RAFFLES]);

  readonly raffles = computed(() => this.rafflesState());

  create(payload: CreateRafflePayload): RaffleCampaign {
    const items = this.rafflesState();
    const nextId = Math.max(0, ...items.map((item) => item.id)) + 1;
    const created: RaffleCampaign = {
      id: nextId,
      ...payload,
      soldTickets: 0,
      status: 'draft',
    };

    this.rafflesState.update((current) => [created, ...current]);
    return created;
  }

  update(id: number, payload: CreateRafflePayload): void {
    this.rafflesState.update((items) =>
      items.map((raffle) =>
        raffle.id === id
          ? {
              ...raffle,
              ...payload,
            }
          : raffle
      )
    );
  }

  remove(id: number): void {
    this.rafflesState.update((items) => items.filter((raffle) => raffle.id !== id));
  }

  requestDrawFromBackend(id: number): Observable<DrawRaffleResult> {
    const raffle = this.rafflesState().find((item) => item.id === id);
    if (!raffle) {
      return throwError(() => new Error('Rifa nao encontrada para sorteio.'));
    }

    const backendResponse = this.buildBackendResult(raffle);

    return of(backendResponse).pipe(delay(450));
  }

  applyDrawResult(id: number, result: DrawRaffleResult): void {
    this.rafflesState.update((items) =>
      items.map((raffle) => {
        if (raffle.id !== id) return raffle;

        return {
          ...raffle,
          status: 'closed',
          winnerName: result.winnerName,
          winnerNumber: result.winnerNumber,
        };
      })
    );
  }

  private buildBackendResult(raffle: RaffleCampaign): DrawRaffleResult {
    const mapped = BACKEND_DRAW_RESULTS[raffle.id];
    const fallbackNumber = Math.min(raffle.rangeEnd, Math.max(raffle.rangeStart, raffle.soldTickets));

    return {
      winnerName: mapped?.winnerName ?? 'Resultado processado pelo backend',
      winnerNumber: mapped?.winnerNumber ?? fallbackNumber,
      processedAt: new Date().toISOString(),
    };
  }
}
