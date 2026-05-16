import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ParticipationOpportunity } from '../../member-area.models';

@Component({
  selector: 'auth-member-opportunity',
  imports: [MatIconModule, NgOptimizedImage],
  templateUrl: './member-opportunity.html',
  styleUrl: './member-opportunity.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberOpportunity {
  readonly opportunity = input.required<ParticipationOpportunity>();

  protected readonly progressStyle = computed(() => `width: ${this.opportunity().progress}%`);
}
