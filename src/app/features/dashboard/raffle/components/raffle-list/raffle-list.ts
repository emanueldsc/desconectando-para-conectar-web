import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RaffleCampaign, RaffleStatus } from '../../raffle.models';

@Component({
  selector: 'dashboard-raffle-list',
  imports: [MatIconModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './raffle-list.html',
  styleUrl: './raffle-list.scss',
})
export class RaffleList {
  readonly raffles = input.required<readonly RaffleCampaign[]>();
  readonly search = input.required<string>();
  readonly filter = input.required<RaffleStatus | 'all'>();

  readonly searchChange = output<string>();
  readonly filterChange = output<RaffleStatus | 'all'>();
  readonly create = output<void>();
  readonly edit = output<number>();
  readonly delete = output<number>();
  readonly draw = output<number>();

  protected readonly filtered = computed(() => {
    const text = this.search().toLowerCase().trim();
    const status = this.filter();

    return this.raffles().filter((raffle) => {
      const matchesSearch = !text || raffle.title.toLowerCase().includes(text);
      const matchesFilter = status === 'all' || raffle.status === status;
      return matchesSearch && matchesFilter;
    });
  });

  protected readonly totalRaised = computed(() =>
    this.raffles().reduce((sum, raffle) => sum + raffle.soldTickets * raffle.ticketPrice, 0)
  );

  protected progress(raffle: RaffleCampaign): number {
    const total = raffle.rangeEnd - raffle.rangeStart + 1;
    if (total <= 0) return 0;
    return Math.min(100, Math.round((raffle.soldTickets / total) * 100));
  }

  protected statusLabel(status: RaffleStatus): string {
    if (status === 'active') return 'Ativa';
    if (status === 'closed') return 'Concluida';
    return 'Rascunho';
  }

  protected statusClass(status: RaffleStatus): string {
    if (status === 'active') return 'raffle-list__status--active';
    if (status === 'closed') return 'raffle-list__status--closed';
    return 'raffle-list__status--draft';
  }

  protected canDraw(raffle: RaffleCampaign): boolean {
    const total = raffle.rangeEnd - raffle.rangeStart + 1;
    return raffle.status === 'active' && raffle.soldTickets >= total;
  }

  protected onSearch(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }
}
