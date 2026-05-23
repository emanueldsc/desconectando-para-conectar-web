import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AdminRaffleApiService } from '../../../shared/services/admin-raffle-api.service';
import { CreateRafflePayload, DrawRafflePayload, DrawRaffleResult, RaffleCampaign } from './raffle.models';

@Injectable({ providedIn: 'root' })
export class RaffleStore {
  private readonly raffleApi = inject(AdminRaffleApiService);
  private readonly rafflesState = signal<RaffleCampaign[]>([]);

  readonly raffles = computed(() => this.rafflesState());

  create(payload: CreateRafflePayload): Observable<RaffleCampaign> {
    return this.raffleApi.createRaffle(payload).pipe(
      tap((created) => {
        this.rafflesState.update((current) => [created, ...current]);
      })
    );
  }

  update(id: number, payload: CreateRafflePayload): Observable<RaffleCampaign> {
    return this.raffleApi.updateRaffle(id, payload).pipe(
      tap((updated) => {
        this.rafflesState.update((items) =>
          items.map((raffle) => (raffle.id === id ? updated : raffle))
        );
      })
    );
  }

  remove(id: number): Observable<void> {
    return this.raffleApi.deleteRaffle(id).pipe(
      tap(() => {
        this.rafflesState.update((items) => items.filter((raffle) => raffle.id !== id));
      })
    );
  }

  loadFromBackend(): Observable<RaffleCampaign[]> {
    return this.raffleApi.getRaffles().pipe(
      tap((raffles) => {
        this.rafflesState.set(raffles);
      })
    );
  }

  requestDrawFromBackend(id: number, payload: DrawRafflePayload): Observable<DrawRaffleResult> {
    return this.raffleApi.drawRaffle(id, payload);
  }

  activate(id: number): Observable<RaffleCampaign> {
    return this.raffleApi.activateRaffle(id).pipe(
      tap((updated) => {
        this.rafflesState.update((items) =>
          items.map((raffle) => (raffle.id === id ? updated : raffle))
        );
      })
    );
  }

  confirmReservedPayment(id: number, number: number, reservationCode?: string): Observable<RaffleCampaign> {
    return this.raffleApi.confirmReservedNumber(id, number, { reservationCode }).pipe(
      tap((updated) => {
        this.rafflesState.update((items) =>
          items.map((raffle) => (raffle.id === id ? updated : raffle))
        );
      })
    );
  }

  updateReservationTimeout(id: number, reservationTimeoutMinutes: number): Observable<RaffleCampaign> {
    return this.raffleApi.updateReservationTimeout(id, { reservationTimeoutMinutes }).pipe(
      tap((updated) => {
        this.rafflesState.update((items) =>
          items.map((raffle) => (raffle.id === id ? updated : raffle))
        );
      })
    );
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
          extractionNumber: result.extractionNumber,
        };
      })
    );
  }
}
