import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MemberOpportunityRaffle } from '../../member-area.models';

@Component({
  selector: 'auth-member-opportunity',
  imports: [MatIconModule],
  templateUrl: './member-opportunity.html',
  styleUrls: ['./member-opportunity.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberOpportunity {
  readonly offers = input.required<MemberOpportunityRaffle[]>();
  private readonly router = inject(Router);
  protected readonly currentIndex = signal(0);
  protected readonly currentOffer = computed(() => this.offers()[this.currentIndex()] ?? null);
  protected readonly hasMultiple = computed(() => this.offers().length > 1);

  protected readonly progressStyle = computed(() => `width: ${this.currentOffer()?.progress ?? 0}%`);

  protected previousOffer(): void {
    const offers = this.offers();
    if (offers.length <= 1) {
      return;
    }

    const nextIndex = (this.currentIndex() - 1 + offers.length) % offers.length;
    this.currentIndex.set(nextIndex);
  }

  protected nextOffer(): void {
    const offers = this.offers();
    if (offers.length <= 1) {
      return;
    }

    const nextIndex = (this.currentIndex() + 1) % offers.length;
    this.currentIndex.set(nextIndex);
  }

  protected participate(): void {
    const offer = this.currentOffer();
    if (!offer) {
      return;
    }

    void this.router.navigate(['/public/raffles'], {
      queryParams: { raffle: offer.slug },
    });
  }
}
