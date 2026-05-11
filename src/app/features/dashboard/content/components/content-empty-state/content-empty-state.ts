import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dashboard-content-empty-state',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-empty-state.html',
  styleUrl: './content-empty-state.scss',
})
export class ContentEmptyState {
  readonly query = input('');
  readonly create = output<void>();
}
