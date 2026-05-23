import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AdminDonationsApiService } from '../../../shared/services/admin-donations-api.service';
import { DonationCreateModal } from './components/donation-create-modal/donation-create-modal';
import { Donation, DonationCreatePayload, DonationFilter, DonationStatus, PaymentMethod } from './donations.models';

@Component({
  selector: 'donations',
  imports: [MatIconModule, CurrencyPipe, DonationCreateModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './donations.html',
  styleUrl: './donations.scss',
})
export class Donations implements OnInit {
  private readonly api = inject(AdminDonationsApiService);

  protected readonly donations = signal<Donation[]>([]);
  protected readonly query = signal('');
  protected readonly filter = signal<DonationFilter>('all');
  protected readonly dateFrom = signal('');
  protected readonly dateTo = signal('');
  protected readonly isModalOpen = signal(false);
  protected readonly editingDonation = signal<Donation | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  protected readonly totalRaised = computed(() =>
    this.donations().reduce((sum, donation) => sum + donation.amount, 0)
  );

  protected readonly activeDonors = computed(() => {
    const uniqueDonors = new Set(this.donations().map((donation) => donation.donorName.toLowerCase().trim()));
    return uniqueDonors.size;
  });

  protected readonly pendingTotal = computed(() =>
    this.donations()
      .filter((donation) => donation.status === 'pending')
      .reduce((sum, donation) => sum + donation.amount, 0)
  );

  protected readonly filteredDonations = computed(() => {
    const search = this.query().toLowerCase().trim();
    const activeFilter = this.filter();
    const from = this.dateFrom();
    const to = this.dateTo();

    return this.donations().filter((donation) => {
      const matchesSearch =
        !search ||
        donation.donorName.toLowerCase().includes(search) ||
        this.paymentLabel(donation.paymentMethod).toLowerCase().includes(search);
      const matchesFilter = activeFilter === 'all' || donation.status === activeFilter;
      const matchesFrom = !from || donation.date >= from;
      const matchesTo = !to || donation.date <= to;
      return matchesSearch && matchesFilter && matchesFrom && matchesTo;
    });
  });

  protected readonly hasDateFilter = computed(() => !!(this.dateFrom() || this.dateTo()));

  protected readonly hasResults = computed(() => this.filteredDonations().length > 0);

  ngOnInit(): void {
    this.loadDonations();
  }

  private loadDonations(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.api.getDonations().subscribe({
      next: (response) => {
        const mapped: Donation[] = response.data.map((d) => ({
          id: d.id,
          donorName: d.donorName,
          amount: d.amount,
          date: d.date,
          paymentMethod: d.paymentMethod as PaymentMethod,
          status: d.status as DonationStatus,
          notes: d.notes,
          canEdit: d.canEdit,
        }));
        this.donations.set(mapped);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Não foi possível carregar as doações. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  protected setQuery(value: string): void {
    this.query.set(value);
  }

  protected onQueryInput(event: Event): void {
    this.setQuery((event.target as HTMLInputElement).value);
  }

  protected setFilter(value: DonationFilter): void {
    this.filter.set(value);
  }

  protected onDateFromInput(event: Event): void {
    this.dateFrom.set((event.target as HTMLInputElement).value);
  }

  protected onDateToInput(event: Event): void {
    this.dateTo.set((event.target as HTMLInputElement).value);
  }

  protected clearDateFilter(): void {
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  protected openCreateModal(): void {
    this.editingDonation.set(null);
    this.saveError.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(donation: Donation): void {
    this.editingDonation.set(donation);
    this.saveError.set(null);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.editingDonation.set(null);
    this.saveError.set(null);
  }

  protected saveDonation(payload: DonationCreatePayload): void {
    this.saving.set(true);
    this.saveError.set(null);

    const editing = this.editingDonation();
    const apiPayload = {
      donorName: payload.donorName,
      amount: payload.amount,
      date: payload.date,
      paymentMethod: payload.paymentMethod,
      isConfirmed: payload.isConfirmed,
      notes: payload.notes ?? null,
    };

    const call$ = editing
      ? this.api.updateDonation(editing.id, apiPayload)
      : this.api.createDonation(apiPayload);

    call$.subscribe({
      next: (response) => {
        this.saving.set(false);
        if (!response.success) {
          this.saveError.set(response.message ?? 'Erro ao salvar doação.');
          return;
        }
        this.closeModal();
        this.loadDonations();
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Não foi possível salvar. Verifique a conexão e tente novamente.');
      },
    });
  }

  protected deleteDonation(donation: Donation): void {
    if (!donation.canEdit) return;
    if (!confirm(`Excluir a doação de ${donation.donorName}?`)) return;

    this.deletingId.set(donation.id);

    this.api.deleteDonation(donation.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadDonations();
      },
      error: () => {
        this.deletingId.set(null);
      },
    });
  }

  protected formatDate(dateIso: string): string {
    const date = new Date(`${dateIso}T00:00:00`);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
      .format(date)
      .replace('.', '');
  }

  protected paymentLabel(payment: PaymentMethod): string {
    if (payment === 'pix') return 'PIX';
    if (payment === 'card') return 'Cartao';
    if (payment === 'boleto') return 'Boleto';
    return 'Dinheiro';
  }

  protected statusLabel(status: DonationStatus): string {
    return status === 'confirmed' ? 'Confirmado' : 'Pendente';
  }

  protected initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'D';
    const second = parts[1]?.[0] ?? '';
    return `${first}${second}`.toUpperCase();
  }
}
