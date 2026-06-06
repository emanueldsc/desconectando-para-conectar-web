import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { MemberApiService, MemberDonation } from '../../../shared/services/member-api.service';
import { PublicRaffleApiService } from '../../../shared/services/public-raffle-api.service';
import { MemberGreeting } from './components/member-greeting/member-greeting';
import { MemberImpactStats } from './components/member-impact-stats/member-impact-stats';
import { MemberOpportunity } from './components/member-opportunity/member-opportunity';
import { MemberRaffles } from './components/member-raffles/member-raffles';
import { MemberSideMenu } from './components/member-side-menu/member-side-menu';
import { MemberOpportunityRaffle, MemberProfile, MemberRaffle } from './member-area.models';

@Component({
  selector: 'auth-member-area',
  imports: [
    MemberSideMenu,
    MemberGreeting,
    MemberImpactStats,
    MemberRaffles,
    MemberOpportunity
  ,
    ReactiveFormsModule
  ],
  templateUrl: './member-area.html',
  styleUrl: './member-area.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberArea {
  protected readonly userName = signal('Membro');
  protected readonly profile = signal<MemberProfile | null>(null);
  protected readonly stats = signal({ totalDonated: '', livesImpacted: 0 });
  protected readonly raffles = signal<MemberRaffle[]>([]);
  protected readonly donations = signal<MemberDonation[]>([]);
  protected readonly activeRaffleOffers = signal<MemberOpportunityRaffle[]>([]);
  protected readonly showEditProfileModal = signal(false);
  protected readonly savingProfile = signal(false);
  protected readonly profileFeedback = signal<string | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  protected readonly profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    phone: ['', [Validators.maxLength(30)]],
    address: ['', [Validators.maxLength(255)]],
  });

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
        next: (profile) => {
          this.profile.set(profile);
          this.userName.set(profile.name);
          this.patchProfileForm(profile);
        },
        error: () => this.userName.set('Membro'),
      });
  }

  protected openEditProfile(): void {
    const profile = this.profile();

    if (!profile || this.savingProfile()) {
      return;
    }

    this.patchProfileForm(profile);
    this.profileFeedback.set(null);
    this.showEditProfileModal.set(true);
  }

  protected closeEditProfile(): void {
    if (this.savingProfile()) {
      return;
    }

    this.showEditProfileModal.set(false);
    this.profileFeedback.set(null);
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue = this.profileForm.getRawValue();

    this.savingProfile.set(true);
    this.profileFeedback.set(null);

    this.memberApi.updateMemberProfile({
      name: formValue.name.trim(),
      phone: formValue.phone.trim() || undefined,
      address: formValue.address.trim() || undefined,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.userName.set(profile.name);
          this.patchProfileForm(profile);
          this.persistUpdatedAuthUser(profile);
          this.profileFeedback.set('Perfil atualizado com sucesso.');
          this.showEditProfileModal.set(false);
          this.savingProfile.set(false);
        },
        error: () => {
          this.profileFeedback.set('Não foi possível atualizar seu perfil agora.');
          this.savingProfile.set(false);
        }
      });
  }

  protected hasProfileFieldError(controlName: 'name' | 'phone' | 'address', error: 'required' | 'maxlength'): boolean {
    const control = this.profileForm.controls[controlName];
    return control.touched && control.hasError(error);
  }

  private patchProfileForm(profile: MemberProfile): void {
    this.profileForm.setValue({
      name: profile.name ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
    });
  }

  private persistUpdatedAuthUser(profile: MemberProfile): void {
    const storages: Storage[] = [localStorage, sessionStorage];

    for (const storage of storages) {
      const rawUser = storage.getItem('auth_user');
      if (!rawUser) {
        continue;
      }

      try {
        const parsed = JSON.parse(rawUser) as { name?: string; phone?: string; address?: string };
        const updated = {
          ...parsed,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
        };
        storage.setItem('auth_user', JSON.stringify(updated));
      } catch {
        // Ignore malformed auth cache and keep API as source of truth.
      }
    }
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
