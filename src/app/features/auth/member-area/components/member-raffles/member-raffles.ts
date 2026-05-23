import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PublicRaffleApiService } from '../../../../../shared/services/public-raffle-api.service';
import { MemberRaffle } from '../../member-area.models';

@Component({
  selector: 'auth-member-raffles',
  imports: [MatIconModule, NgOptimizedImage],
  templateUrl: './member-raffles.html',
  styleUrls: [
    './member-raffles.scss',
    '../../../../public/raffle/raffle.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberRaffles {
  readonly raffles = input.required<MemberRaffle[]>();
  private readonly api = inject(PublicRaffleApiService);
  selected = null as { raffleId: number; numObj: { number: number; reservationCode?: string; reservationPaymentStatus?: string | null; reservationReceiptUrl?: string | null } } | null;
  protected isDragging = false;

  protected readonly activeRaffles = computed(() =>
    this.raffles().filter((raffle) => raffle.status === 'active')
  );

  protected readonly completedRaffles = computed(() =>
    this.raffles().filter((raffle) => raffle.status === 'completed')
  );

  protected async uploadReceipt(raffleId: number, numberObj: { number: number; reservationCode?: string }, file?: File | null) {
    if (!file || !numberObj?.reservationCode) {
      return;
    }

    try {
      const res: any = await firstValueFrom(this.api.uploadReservationReceipt(raffleId, numberObj.number, numberObj.reservationCode, file));

      if (res && res.data) {
        // update local modal state so UI reflects pending_review and shows receipt
        if (this.selected && this.selected.numObj.number === numberObj.number && this.selected.raffleId === raffleId) {
          this.selected.numObj.reservationPaymentStatus = res.data.paymentStatus ?? res.data.paymentStatus ?? 'pending_review';
          this.selected.numObj.reservationReceiptUrl = res.data.receiptUrl ?? res.data.receiptUrl ?? this.selected.numObj.reservationReceiptUrl;
        }
      }

      alert('Comprovante enviado com sucesso. Aguarde confirmação do administrador.');
    } catch (err) {
      console.error(err);
      alert('Falha ao enviar comprovante. Tente novamente.');
    }
  }

  protected onFileChange(event: Event, raffleId: number, numObj: { number: number; reservationCode?: string }) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file) {
      this.uploadReceipt(raffleId, numObj, file);
      // clear input
      input.value = '';
    }

    this.isDragging = false;
  }

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  protected onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  protected onDrop(event: DragEvent, raffleId: number, numObj: { number: number; reservationCode?: string }) {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0] ?? null;
    if (file) {
      this.uploadReceipt(raffleId, numObj, file);
    }
  }

  protected openModal(raffleId: number, numObj: { number: number; reservationCode?: string; reservationPaymentStatus?: string | null; reservationReceiptUrl?: string | null }) {
    this.selected = { raffleId, numObj };
    this.isDragging = false;
  }

  protected closeModal() {
    this.selected = null;
  }
}
