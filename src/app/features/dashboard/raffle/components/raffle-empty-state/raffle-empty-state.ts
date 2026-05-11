import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dashboard-raffle-empty-state',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './raffle-empty-state.html',
  styleUrl: './raffle-empty-state.scss',
})
export class RaffleEmptyState {
  protected readonly create = output<void>();
}
