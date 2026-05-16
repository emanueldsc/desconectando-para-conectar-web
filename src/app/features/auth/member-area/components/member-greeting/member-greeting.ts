import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'auth-member-greeting',
  imports: [NgOptimizedImage],
  templateUrl: './member-greeting.html',
  styleUrl: './member-greeting.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberGreeting {
  readonly userName = input.required<string>();
}
