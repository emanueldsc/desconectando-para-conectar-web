import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
  protected readonly userName = signal('Joao');

  protected readonly stats = signal({
    totalDonated: 'R$ 250,00',
    livesImpacted: 12,
  });

  protected readonly raffles = signal<MemberRaffle[]>([
    {
      id: 1,
      title: 'Cestas Basicas - Comunidade Aurora',
      drawDate: '15/11/2023',
      status: 'active',
      numbers: [42, 17],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAc-nn2lfKuZ0j00ZiXVgtQepm-2tP2xjAKv6WqxzpVIv9VRlrWtZsx1f_ATzUAJfvR5ZM3wvjBnNHpcEhkU-mvqmjIr1qbR2nrR-cr9U-fKDsBMxjMISgospVqEaXnUw-WrxCZQtsbad6Yoy-JnoxCIz-zWHRoS3lKR33FXxF5qa-s1H-zqmp8vk7FIu0JYzvc1qKtEBXH9IW1nu2ufqBRRkRJXByS2PAFXupKp7EawxcQNzS3DzmQSl0wtVxAp-aCMkpQkurOYwyJ',
    },
    {
      id: 2,
      title: 'Construcao Poco Artesiano',
      drawDate: '01/10/2023',
      status: 'completed',
      summary: 'Voce ajudou a bater a meta!',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCAUA9-Zp6Pqyjgp6mMqsAS0qLbjMSrBoK_68jTuG09xDKFmdTIX7Y_5UxpNGFFWKQmhImXfnEyhbGdq8vuowLlVKOjLG9zpOhivqK2unJmRS2lnLLUVjwnzjxvD4u8bNr2ewD-ObnPUX6PUsayVgfPNrr0KmFn_SwLFewc7pl9KNj12_-b4qmjbkWy-ANeP5CfbKAnXRC-stEvh3S4yX8K8ZG_Ja2UGNNc_90V5vbtNHMVe1A8WTGXeYKE-3wyV_ETzoky1PFaGk5M',
    },
  ]);

  protected readonly opportunity = signal<ParticipationOpportunity>({
    title: 'Reforma da Escola Municipal',
    description:
      'Ajude a reformar o telhado da escola antes da epoca de chuvas. Cada numero faz a diferenca!',
    progress: 65,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDZXfe2WIg_8gWNEThGhFgcbzakbOmCHbbZGTDrDruFA_3FmIk3L81M-lHfN_7gtgwpMgUx_NLEfJsNwpPNx7BRgJtysOspti5vHFZhbT63zbyLlVJC_3mrWGcH9QXiW4IWr2TH1eGQpq4B9OvSoAUzUoZ4Cd5F2mN0uh-BILaT42XkXTs2ctKQTFSw_u5CV3oci2Vo_8hbZxNqDQ64RbKQHjd5ALBvPI_WOdKKR__NCmrQ0-yz0mNCLGM3hSLNUtXMp7sMOvWKmYGl',
  });
}
