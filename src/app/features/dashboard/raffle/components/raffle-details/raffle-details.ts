import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RaffleCampaign, RaffleNumberEntry } from '../../raffle.models';

@Component({
  selector: 'dashboard-raffle-details',
  imports: [CurrencyPipe, MatIconModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './raffle-details.html',
  styleUrl: './raffle-details.scss',
})
export class RaffleDetails {
  readonly raffle = input.required<RaffleCampaign>();

  readonly back = output<void>();
  readonly edit = output<number>();
  readonly delete = output<number>();
  readonly activate = output<number>();
  readonly confirmReservedPayment = output<{ raffleId: number; number: number; reservationCode?: string }>();
  readonly updateTimeout = output<{ raffleId: number; reservationTimeoutMinutes: number }>();
  readonly draw = output<number>();

  protected readonly totalTickets = computed(() => this.raffle().rangeEnd - this.raffle().rangeStart + 1);
  protected readonly progress = computed(() => {
    const total = this.totalTickets();
    if (total <= 0) return 0;

    return Math.min(100, Math.round((this.raffle().soldTickets / total) * 100));
  });

  protected readonly canDraw = computed(() =>
    this.raffle().status === 'active'
  );

  protected readonly canActivate = computed(() => this.raffle().status === 'draft');

  protected readonly reservedNumbers = computed(() =>
    (this.raffle().numbers ?? []).filter((numberEntry) => numberEntry.status === 'reserved')
  );

  protected confirmReserved(numberEntry: RaffleNumberEntry): void {
    this.confirmReservedPayment.emit({
      raffleId: this.raffle().id,
      number: numberEntry.number,
      reservationCode: numberEntry.reservationCode,
    });
  }

  protected submitTimeout(event: Event): void {
    const form = event.target as HTMLFormElement;
    const input = form.elements.namedItem('reservationTimeout') as HTMLInputElement | null;
    const parsed = Number(input?.value ?? NaN);

    if (!Number.isFinite(parsed) || parsed < 1) {
      return;
    }

    this.updateTimeout.emit({
      raffleId: this.raffle().id,
      reservationTimeoutMinutes: Math.floor(parsed),
    });
  }
}
