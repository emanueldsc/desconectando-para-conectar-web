import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
    AdminGeneralApiService,
    AdminGeneralMonthlyHistoryItem,
    GeneralDashboardCard,
} from '../../../shared/services/admin-general-api.service';

@Component({
  selector: 'general',
  imports: [MatIconModule],
  templateUrl: './general.html',
  styleUrl: './general.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class General implements OnInit {
  private readonly generalApi = inject(AdminGeneralApiService);

  protected readonly cards = signal<GeneralDashboardCard[]>([]);
  protected readonly historyLastSixMonths = signal<AdminGeneralMonthlyHistoryItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  public ngOnInit(): void {
    this.loadOverview();
  }

  protected retryLoad(): void {
    this.loadOverview();
  }

  private loadOverview(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.generalApi.getOverview().subscribe({
      next: (response) => {
        this.cards.set(response.data.cards);
        debugger;
        this.historyLastSixMonths.set(response.data.metrics.historyLastSixMonths ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Nao foi possivel carregar os indicadores agora.');
        this.historyLastSixMonths.set([]);
        this.loading.set(false);
      },
    });
  }
}
