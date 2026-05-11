import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface DashboardCard {
  title: string;
  icon: string;
  value: string;
  subtitle: string;
  accent: 'green' | 'orange';
  trendIcon?: string;
  progress?: number;
  target?: string;
}

@Component({
  selector: 'general',
  imports: [MatIconModule],
  templateUrl: './general.html',
  styleUrl: './general.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class General {
  protected readonly cards: readonly DashboardCard[] = [
    {
      title: 'Total Arrecadado',
      icon: 'payments',
      value: 'R$ 14.520',
      subtitle: '+12% este mes',
      accent: 'green',
      trendIcon: 'trending_up',
    },
    {
      title: 'Rifas Ativas',
      icon: 'local_activity',
      value: '08',
      subtitle: 'Sendo 3 em encerramento',
      accent: 'orange',
    },
    {
      title: 'Usuarios',
      icon: 'group',
      value: '1.245',
      subtitle: '+45 esta semana',
      accent: 'green',
      trendIcon: 'person_add',
    },
    {
      title: 'Meta Mensal',
      icon: 'flag',
      value: '75%',
      subtitle: '',
      accent: 'orange',
      progress: 75,
      target: 'R$ 20k',
    },
  ];
}
