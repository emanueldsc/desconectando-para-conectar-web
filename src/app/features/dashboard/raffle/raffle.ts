import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminUsersApiService } from '../../../shared/services/admin-users-api.service';
import { RaffleCreateForm } from './components/raffle-create-form/raffle-create-form';
import { RaffleDetails } from './components/raffle-details/raffle-details';
import { RaffleDrawConfirm } from './components/raffle-draw-confirm/raffle-draw-confirm';
import { RaffleEmptyState } from './components/raffle-empty-state/raffle-empty-state';
import { RaffleList } from './components/raffle-list/raffle-list';
import { CreateRafflePayload, DrawRafflePayload, RaffleBuyerOption, RaffleStatus } from './raffle.models';
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
  private readonly adminUsersApi = inject(AdminUsersApiService);

  protected readonly raffles = this.raffleStore.raffles;
  protected readonly view = signal<RaffleView>('list');
  protected readonly search = signal('');
  protected readonly filter = signal<RaffleStatus | 'all'>('all');
  protected readonly editingId = signal<number | null>(null);
  protected readonly detailsId = signal<number | null>(null);
  protected readonly drawId = signal<number | null>(null);
  protected readonly deleteId = signal<number | null>(null);
  protected readonly drawError = signal<string | null>(null);
  protected readonly buyerOptions = signal<RaffleBuyerOption[]>([]);
  protected readonly isDrawing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly isActivating = signal(false);
  protected readonly isUpdatingTimeout = signal(false);
  protected readonly isConfirmingPayment = signal(false);
  protected readonly isMarkingSold = signal(false);

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
    this.loadBuyerOptions();
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
    } catch (error: unknown) {
      this.drawError.set(this.resolveSaveErrorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private resolveSaveErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Nao foi possivel salvar a rifa no backend.';
    }

    if (error.status === 422) {
      const backendMessage = this.readValidationMessage(error.error);
      return backendMessage ?? 'Dados invalidos. Revise os campos da rifa e tente novamente.';
    }

    if (error.status === 401) {
      return 'Sessao expirada. Faca login novamente.';
    }

    if (error.status === 403) {
      return 'Usuario sem permissao para gerenciar rifas.';
    }

    return 'Nao foi possivel salvar a rifa no backend.';
  }

  private readValidationMessage(errorBody: unknown): string | null {
    if (!this.isRecord(errorBody)) {
      return null;
    }

    const fieldErrors = errorBody['errors'];
    if (this.isRecord(fieldErrors)) {
      for (const value of Object.values(fieldErrors)) {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
          return value[0];
        }
      }
    }

    const message = errorBody['message'];
    return typeof message === 'string' && message.trim().length > 0 ? message : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
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

  protected async markNumberAsSold(payload: {
    raffleId: number;
    number: number;
    buyerUserId?: number;
    buyerName?: string;
    buyerPhone?: string;
  }): Promise<void> {
    this.isMarkingSold.set(true);
    this.drawError.set(null);

    try {
      await firstValueFrom(
        this.raffleStore.markNumberAsSold(payload.raffleId, payload.number, {
          buyerUserId: payload.buyerUserId,
          buyerName: payload.buyerName,
          buyerPhone: payload.buyerPhone,
        })
      );
    } catch {
      this.drawError.set('Nao foi possivel marcar o ponto como vendido.');
    } finally {
      this.isMarkingSold.set(false);
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

  private async loadBuyerOptions(): Promise<void> {
    try {
      const response = await firstValueFrom(this.adminUsersApi.getUsers());
      const buyers = response.data
        .filter((user) => user.role === 'buyer' && user.status === 'active')
        .map((user) => ({
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
        }));

      this.buyerOptions.set(buyers);
    } catch {
      this.buyerOptions.set([]);
    }
  }
}
