import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { MemberApiService, MemberDonation } from '../../../shared/services/member-api.service';
import { MemberGreeting } from './components/member-greeting/member-greeting';
import { MemberImpactStats } from './components/member-impact-stats/member-impact-stats';
import { MemberOpportunity } from './components/member-opportunity/member-opportunity';
import { MemberRaffles } from './components/member-raffles/member-raffles';
import { MemberSideMenu } from './components/member-side-menu/member-side-menu';
import { MemberRaffle, ParticipationOpportunity } from './member-area.models';

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
  protected readonly userName = signal('');
  protected readonly stats = signal({ totalDonated: '', livesImpacted: 0 });
  protected readonly raffles = signal<MemberRaffle[]>([]);
  protected readonly donations = signal<MemberDonation[]>([]);
  protected readonly opportunity = signal<ParticipationOpportunity | null>(null);

  constructor(private readonly memberApi: MemberApiService) {
    // Buscar rifas do membro
    effect(() => {
      this.memberApi.getMemberRaffles().subscribe({
        next: (raffles) => this.raffles.set(raffles),
      });
      this.memberApi.getMemberDonations().subscribe({
        next: (donations) => {
          this.donations.set(donations);
          // Exemplo: calcular total doado e vidas impactadas
          const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount), 0);
          this.stats.set({
            totalDonated: totalDonated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            livesImpacted: Math.max(1, Math.floor(totalDonated / 20)), // Exemplo: 1 vida a cada R$20
          });
        },
      });
      // Oportunidade pode ser buscada de outro endpoint futuramente
      this.opportunity.set({
        title: 'Reforma da Escola Municipal',
        description: 'Ajude a reformar o telhado da escola antes da epoca de chuvas. Cada numero faz a diferenca!',
        progress: 65,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZXfe2WIg_8gWNEThGhFgcbzakbOmCHbbZGTDrDruFA_3FmIk3L81M-lHfN_7gtgwpMgUx_NLEfJsNwpPNx7BRgJtysOspti5vHFZhbT63zbyLlVJC_3mrWGcH9QXiW4IWr2TH1eGQpq4B9OvSoAUzUoZ4Cd5F2mN0uh-BILaT42XkXTs2ctKQTFSw_u5CV3oci2Vo_8hbZxNqDQ64RbKQHjd5ALBvPI_WOdKKR__NCmrQ0-yz0mNCLGM3hSLNUtXMp7sMOvWKmYGl',
      });
      // Nome do usuário pode vir de outro endpoint futuramente
      this.userName.set('Membro');
    });
  }
}
