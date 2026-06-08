import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'auth-member-greeting',
  imports: [CommonModule],
  templateUrl: './member-greeting.html',
  styleUrls: ['./member-greeting.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberGreeting {
  readonly userName = input.required<string>();
}
