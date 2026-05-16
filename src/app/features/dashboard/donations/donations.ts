import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DonationCreateModal } from './components/donation-create-modal/donation-create-modal';
import { Donation, DonationCreatePayload, DonationFilter, DonationStatus, PaymentMethod } from './donations.models';

const INITIAL_DONATIONS: readonly Donation[] = [
  {
    id: 1,
    donorName: 'Maria das Gracas',
    amount: 150,
    date: '2023-10-12',
    paymentMethod: 'pix',
    status: 'confirmed',
  },
  {
    id: 2,
    donorName: 'Joao Severino',
    amount: 50,
    date: '2023-10-11',
    paymentMethod: 'boleto',
    status: 'pending',
  },
  {
    id: 3,
    donorName: 'Ana Lucia',
    amount: 200,
    date: '2023-10-10',
    paymentMethod: 'card',
    status: 'confirmed',
  },
];

@Component({
  selector: 'donations',
  imports: [MatIconModule, CurrencyPipe, DonationCreateModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './donations.html',
  styleUrl: './donations.scss',
})
export class Donations {
  protected readonly donations = signal<Donation[]>([...INITIAL_DONATIONS]);
  protected readonly query = signal('');
  protected readonly filter = signal<DonationFilter>('all');
  protected readonly isModalOpen = signal(false);

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

    return this.donations().filter((donation) => {
      const matchesSearch =
        !search ||
        donation.donorName.toLowerCase().includes(search) ||
        this.paymentLabel(donation.paymentMethod).toLowerCase().includes(search);
      const matchesFilter = activeFilter === 'all' || donation.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  });

  protected readonly hasResults = computed(() => this.filteredDonations().length > 0);

  protected setQuery(value: string): void {
    this.query.set(value);
  }

  protected onQueryInput(event: Event): void {
    this.setQuery((event.target as HTMLInputElement).value);
  }

  protected setFilter(value: DonationFilter): void {
    this.filter.set(value);
  }

  protected openModal(): void {
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected saveDonation(payload: DonationCreatePayload): void {
    const nextId = Math.max(0, ...this.donations().map((item) => item.id)) + 1;
    const created: Donation = {
      id: nextId,
      donorName: payload.donorName.trim(),
      amount: payload.amount,
      date: payload.date,
      paymentMethod: payload.paymentMethod,
      status: payload.isConfirmed ? 'confirmed' : 'pending',
    };

    this.donations.update((items) => [created, ...items]);
    this.closeModal();
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
