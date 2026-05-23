import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MemberApiService, MemberDonation } from '../../../shared/services/member-api.service';
import { PublicRaffleApiService } from '../../../shared/services/public-raffle-api.service';
import { MemberGreeting } from './components/member-greeting/member-greeting';
import { MemberImpactStats } from './components/member-impact-stats/member-impact-stats';
import { MemberOpportunity } from './components/member-opportunity/member-opportunity';
import { MemberRaffles } from './components/member-raffles/member-raffles';
import { MemberSideMenu } from './components/member-side-menu/member-side-menu';
import { MemberOpportunityRaffle, MemberRaffle } from './member-area.models';

@Component({
  selector: 'auth-member-area',
  imports: [
    MemberSideMenu,
    MemberGreeting,
    MemberImpactStats,
    MemberRaffles,
    MemberOpportunity
  ],
  templateUrl: './member-area.html',
  styleUrl: './member-area.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberArea {
  protected readonly userName = signal('Membro');
  protected readonly stats = signal({ totalDonated: '', livesImpacted: 0 });
  protected readonly raffles = signal<MemberRaffle[]>([]);
  protected readonly donations = signal<MemberDonation[]>([]);
  protected readonly activeRaffleOffers = signal<MemberOpportunityRaffle[]>([]);

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly memberApi: MemberApiService,
    private readonly publicRaffleApi: PublicRaffleApiService
  ) {
    this.loadMemberProfile();
    this.loadMemberRaffles();
    this.loadMemberDonations();
    this.loadActiveRaffleOffers();
  }

  private loadMemberProfile(): void {
    this.memberApi.getMemberProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => this.userName.set(profile.name),
        error: () => this.userName.set('Membro'),
      });
  }

  private loadMemberRaffles(): void {
    this.memberApi.getMemberRaffles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (raffles) => this.raffles.set(raffles),
      });
  }

  private loadMemberDonations(): void {
    this.memberApi.getMemberDonations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (donations) => {
          this.donations.set(donations);
          const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount), 0);
          this.stats.set({
            totalDonated: totalDonated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            livesImpacted: Math.max(1, Math.floor(totalDonated / 20)),
          });
        },
      });
  }

  private loadActiveRaffleOffers(): void {
    this.publicRaffleApi.getRaffleList({ status: 'active', sort: 'newest', limit: 8 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((response) => response.data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          slug: item.slug,
          ticketPrice: item.ticketPrice,
          progress: item.progress,
          drawDate: item.drawDate,
          status: item.status,
        })))
      )
      .subscribe({
        next: (offers) => this.activeRaffleOffers.set(offers),
        error: () => this.activeRaffleOffers.set([]),
      });
  }
}
