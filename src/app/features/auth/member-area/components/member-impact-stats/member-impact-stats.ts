import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'auth-member-impact-stats',
  imports: [MatIconModule],
  templateUrl: './member-impact-stats.html',
  styleUrl: './member-impact-stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberImpactStats {
  readonly totalDonated = input.required<string>();
  readonly livesImpacted = input.required<number>();
}
