import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RaffleCampaign } from '../../raffle.models';

@Component({
  selector: 'dashboard-raffle-draw-confirm',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './raffle-draw-confirm.html',
  styleUrl: './raffle-draw-confirm.scss',
})
export class RaffleDrawConfirm {
  readonly raffle = input.required<RaffleCampaign>();
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected readonly totalTickets = computed(() =>
    this.raffle().rangeEnd - this.raffle().rangeStart + 1
  );
}
