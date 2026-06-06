import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);
  selected = null as { raffleId: number; numObj: { number: number; reservationCode?: string; reservationPaymentStatus?: string | null; reservationReceiptUrl?: string | null } } | null;
  protected isDragging = false;
  protected selectedReceiptFile: File | null = null;
  protected selectedReceiptFileName: string | null = null;
  protected isUploadingReceipt = false;
  protected uploadStatus: 'idle' | 'file-selected' | 'success' | 'error' = 'idle';
  protected uploadMessage: string | null = null;

  protected readonly activeRaffles = computed(() =>
    this.raffles().filter((raffle) => raffle.status === 'active')
  );

  protected readonly completedRaffles = computed(() =>
    this.raffles().filter((raffle) => raffle.status === 'completed')
  );

  protected async uploadReceipt(raffleId: number, numberObj: { number: number; reservationCode?: string }, file?: File | null): Promise<void> {
    if (!file || !numberObj?.reservationCode) {
      return;
    }

    try {
      this.isUploadingReceipt = true;
      this.uploadMessage = null;
      this.cdr.markForCheck();
      const res = await firstValueFrom(this.api.uploadReservationReceipt(raffleId, numberObj.number, numberObj.reservationCode, file));

      if (res && res.data) {
        // Update local modal state so UI reflects pending_review and external receipt URL.
        if (this.selected && this.selected.numObj.number === numberObj.number && this.selected.raffleId === raffleId) {
          this.selected.numObj.reservationPaymentStatus = res.data.paymentStatus ?? res.data.paymentStatus ?? 'pending_review';
          this.selected.numObj.reservationReceiptUrl = res.data.receiptUrl ?? res.data.receiptUrl ?? this.selected.numObj.reservationReceiptUrl;
        }
      }

      this.uploadStatus = 'success';
      this.uploadMessage = 'Comprovante enviado com sucesso. Aguarde confirmação do administrador.';
      this.selectedReceiptFile = null;
      this.selectedReceiptFileName = null;
      this.isDragging = false;
      this.cdr.markForCheck();
    } catch (err) {
      console.error(err);
      this.uploadStatus = 'error';
      this.uploadMessage = 'Falha ao enviar comprovante. Tente novamente.';
      this.cdr.markForCheck();
    } finally {
      this.isUploadingReceipt = false;
      this.cdr.markForCheck();
    }
  }

  protected onFileChange(event: Event): void {
    if (this.isUploadingReceipt) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.setSelectedReceiptFile(file);
    input.value = '';
    this.isDragging = false;
  }

  protected onDragOver(event: DragEvent): void {
    if (this.isUploadingReceipt) {
      return;
    }

    event.preventDefault();
    this.isDragging = true;
  }

  protected onDragLeave(event: DragEvent): void {
    if (this.isUploadingReceipt) {
      return;
    }

    event.preventDefault();
    this.isDragging = false;
  }

  protected onDrop(event: DragEvent): void {
    if (this.isUploadingReceipt) {
      return;
    }

    event.preventDefault();
    const file = event.dataTransfer?.files?.[0] ?? null;
    this.setSelectedReceiptFile(file);
    this.isDragging = false;
  }

  protected clearSelectedReceiptFile(event: Event): void {
    if (this.isUploadingReceipt) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.selectedReceiptFile = null;
    this.selectedReceiptFileName = null;
    this.uploadStatus = 'idle';
    this.uploadMessage = null;
    this.isDragging = false;
  }

  protected async submitReceiptUpload(): Promise<void> {
    if (!this.selected || !this.selectedReceiptFile || this.isUploadingReceipt) {
      return;
    }

    await this.uploadReceipt(this.selected.raffleId, this.selected.numObj, this.selectedReceiptFile);
  }

  protected openModal(raffleId: number, numObj: { number: number; reservationCode?: string; reservationPaymentStatus?: string | null; reservationReceiptUrl?: string | null }): void {
    this.selected = { raffleId, numObj };
    this.selectedReceiptFile = null;
    this.selectedReceiptFileName = null;
    this.uploadStatus = 'idle';
    this.uploadMessage = null;
    this.isUploadingReceipt = false;
    this.isDragging = false;
  }

  protected closeModal(): void {
    if (this.isUploadingReceipt) {
      return;
    }

    this.selected = null;
    this.selectedReceiptFile = null;
    this.selectedReceiptFileName = null;
    this.uploadStatus = 'idle';
    this.uploadMessage = null;
    this.isUploadingReceipt = false;
    this.isDragging = false;
  }

  private setSelectedReceiptFile(file: File | null): void {
    if (this.isUploadingReceipt) {
      return;
    }

    if (!file) {
      return;
    }

    if (!this.isSupportedReceiptFile(file)) {
      this.selectedReceiptFile = null;
      this.selectedReceiptFileName = null;
      this.uploadStatus = 'error';
      this.uploadMessage = 'Formato inválido. Envie JPG, PNG ou WEBP.';
      return;
    }

    this.selectedReceiptFile = file;
    this.selectedReceiptFileName = file.name;
    this.uploadStatus = 'file-selected';
    this.uploadMessage = null;
  }

  private isSupportedReceiptFile(file: File): boolean {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  }
}
