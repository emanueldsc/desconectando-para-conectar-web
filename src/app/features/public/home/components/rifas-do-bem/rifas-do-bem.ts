import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { FeaturedRaffleCard } from '../../../../../shared/models/api-contracts.models';

@Component({
  selector: 'home-rifas-do-bem',
  imports: [CommonModule, RouterLink, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rifas-do-bem.html',
  styleUrl: './rifas-do-bem.scss'
})
export class RifasDoBemComponent {
  readonly rifas = input<FeaturedRaffleCard[]>([]);
  protected readonly rifasParaExibir = computed(() => {
    const rifas = this.rifas();
    const rifasAtivas = rifas.filter((rifa) => rifa.status === 'active');

    if (rifasAtivas.length > 0) {
      return rifasAtivas;
    }

    return rifas.filter((rifa) => rifa.status === 'finished');
  });

  protected getStatusLabel(status: FeaturedRaffleCard['status']): string {
    if (status === 'finished') {
      return 'concluida';
    }

    if (status === 'coming') {
      return 'em breve';
    }

    return 'em andamento';
  }
}
