import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RaffleCampaign } from '../../raffle.models';

@Component({
  selector: 'dashboard-raffle-details',
  imports: [CurrencyPipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './raffle-details.html',
  styleUrl: './raffle-details.scss',
})
export class RaffleDetails {
  readonly raffle = input.required<RaffleCampaign>();

  readonly back = output<void>();
  readonly edit = output<number>();
  readonly delete = output<number>();
  readonly draw = output<number>();

  protected readonly totalTickets = computed(() => this.raffle().rangeEnd - this.raffle().rangeStart + 1);
  protected readonly progress = computed(() => {
    const total = this.totalTickets();
    if (total <= 0) return 0;

    return Math.min(100, Math.round((this.raffle().soldTickets / total) * 100));
  });

  protected readonly canDraw = computed(() =>
    this.raffle().status === 'active' && this.raffle().soldTickets >= this.totalTickets()
  );
}
