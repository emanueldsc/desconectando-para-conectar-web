import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';

type RifaStatus = 'em andamento' | 'concluída';

interface Rifa {
  id: number;
  title: string;
  description: string;
  status: RifaStatus;
  pointsSold: number;
  pointsTotal: number;
  pointPrice: number;
}

@Component({
  selector: 'home-rifas-do-bem',
  imports: [CommonModule, RouterLink, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rifas-do-bem.html',
  styleUrl: './rifas-do-bem.scss'
})
export class RifasDoBemComponent {
  protected readonly rifas: Rifa[] = [
    {
      id: 1,
      title: 'Cesta Básica do Sertão',
      description: 'Arrecadação de cestas básicas para famílias em vulnerabilidade do sertão nordestino.',
      status: 'em andamento',
      pointsSold: 3200,
      pointsTotal: 5000,
      pointPrice: 10
    },
    {
      id: 2,
      title: 'Escola do Campo',
      description: 'Material escolar para crianças da zona rural e comunidades rurais.',
      status: 'em andamento',
      pointsSold: 1800,
      pointsTotal: 3000,
      pointPrice: 5
    },
    {
      id: 3,
      title: 'Poço Artesiano',
      description: 'Construção de poço para comunidade sem acesso à água potável.',
      status: 'concluída',
      pointsSold: 12000,
      pointsTotal: 12000,
      pointPrice: 20
    }
  ];

  protected getProgress(rifa: Rifa): number {
    return Math.min(Math.round((rifa.pointsSold / rifa.pointsTotal) * 100), 100);
  }
}
