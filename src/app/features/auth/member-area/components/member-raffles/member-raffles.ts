import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MemberRaffle } from '../../member-area.models';

@Component({
  selector: 'auth-member-raffles',
  imports: [MatIconModule, NgOptimizedImage],
  templateUrl: './member-raffles.html',
  styleUrl: './member-raffles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberRaffles {
  readonly raffles = input.required<MemberRaffle[]>();

  protected readonly activeRaffles = computed(() =>
    this.raffles().filter((raffle) => raffle.status === 'active')
  );

  protected readonly completedRaffles = computed(() =>
    this.raffles().filter((raffle) => raffle.status === 'completed')
  );
}
