import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AdminUsersApiService } from '../../../shared/services/admin-users-api.service';
import { UserCreateModal } from './components/user-create-modal/user-create-modal';
import { UsersMembersList } from './components/users-members-list/users-members-list';
import { CreateMemberPayload, MemberFilter, UserMember } from './users.models';

type UsersSection = 'members' | 'users';

@Component({
  selector: 'users',
  imports: [UsersMembersList, UserCreateModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private readonly usersApi = inject(AdminUsersApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly members = signal<UserMember[]>([]);
  protected readonly query = signal('');
  protected readonly filter = signal<MemberFilter>('all');
  protected readonly showCreateModal = signal(false);
  protected readonly editingMemberId = signal<number | null>(null);
  protected readonly savingNoteIds = signal<number[]>([]);
  protected readonly activeSection = signal<UsersSection>('members');
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);

  public constructor() {
    this.loadUsersFromApi();
  }

  protected readonly filteredMembers = computed(() => {
    const search = this.query().toLowerCase().trim();
    const activeFilter = this.filter();
    const section = this.activeSection();

    const sectionMembers = this.members().filter((member) => {
      if (section === 'users') {
        return member.portalRole !== 'buyer';
      }

      return member.portalRole === 'buyer';
    });

    return sectionMembers.filter((member) => {
      const matchesSearch =
        !search ||
        member.fullName.toLowerCase().includes(search) ||
        member.category.toLowerCase().includes(search);
      const matchesFilter = section === 'members' || activeFilter === 'all' || member.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  });

  protected readonly editingMember = computed(() => {
    const id = this.editingMemberId();
    if (id === null) return null;
    return this.members().find((member) => member.id === id) ?? null;
  });

  protected setQuery(value: string): void {
    this.query.set(value);
  }

  protected setFilter(value: MemberFilter): void {
    this.filter.set(value);
  }

  protected setSection(value: UsersSection): void {
    this.activeSection.set(value);
    this.query.set('');
    this.filter.set('all');
  }

  protected openCreateModal(): void {
    if (this.activeSection() === 'members') {
      return;
    }

    this.editingMemberId.set(null);
    this.showCreateModal.set(true);
  }

  protected openEditModal(id: number): void {
    if (this.activeSection() !== 'users') {
      return;
    }

    this.editingMemberId.set(id);
    this.showCreateModal.set(true);
  }

  protected saveMemberNote(payload: { id: number; notes: string }): void {
    const member = this.members().find((item) => item.id === payload.id);

    if (!member || member.portalRole !== 'buyer' || this.savingNoteIds().includes(payload.id)) {
      return;
    }

    this.savingNoteIds.update((ids) => [...ids, payload.id]);

    this.usersApi
      .updateUser(payload.id, {
        fullName: member.fullName.trim(),
        phone: member.phone === '-' ? '' : member.phone.trim(),
        address: (member.address ?? '').trim(),
        notes: payload.notes,
        role: member.portalRole,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.savingNoteIds.update((ids) => ids.filter((id) => id !== payload.id));
        })
      )
      .subscribe({
        next: (response) => {
          const persistedNotes = response.data.notes ?? payload.notes;
          this.members.update((items) =>
            items.map((item) =>
              item.id === payload.id
                ? {
                    ...item,
                    notes: persistedNotes,
                  }
                : item
            )
          );
        },
        error: (error: unknown) => {
          this.loadError.set(this.extractErrorMessage(error));
        }
      });
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.editingMemberId.set(null);
    this.loadUsersFromApi();
  }

  protected saveMember(payload: CreateMemberPayload): void {
    const editingId = this.editingMemberId();
    const section = this.activeSection();

    if (editingId !== null) {
      if (this.saving()) {
        return;
      }

      const role = section === 'members' ? 'buyer' : payload.portalRole;

      if (role !== 'buyer' && role !== 'manager' && role !== 'publisher') {
        this.loadError.set('Perfil inválido para atualização.');
        return;
      }

      this.saving.set(true);

      this.usersApi
        .updateUser(editingId, {
          fullName: payload.fullName.trim(),
          phone: payload.phone.trim(),
          address: payload.address.trim(),
          role,
        })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.saving.set(false))
        )
        .subscribe({
          next: () => this.closeCreateModal(),
          error: (error: unknown) => {
            this.loadError.set(this.extractErrorMessage(error));
          }
        });

      return;
    }

    // Buyers are created only in the public portal area, not from this internal screen.
    if (section === 'members') {
      return;
    }

    const createRole = payload.category === 'child' ? 'none' : payload.portalRole;

    if (createRole !== 'none' && createRole !== 'manager' && createRole !== 'publisher') {
      this.loadError.set('Selecione Gestor, Publicador ou categoria Criança para perfil nulo.');
      return;
    }

    if (createRole !== 'none' && (!payload.email || !payload.password || !payload.passwordConfirmation)) {
      this.loadError.set('Preencha e-mail e senha para criar o novo usuário.');
      return;
    }

    if (this.saving()) {
      return;
    }

    this.saving.set(true);

    this.usersApi
      .createUser({
        fullName: payload.fullName.trim(),
        phone: payload.phone.trim(),
        address: payload.address.trim(),
        role: createRole,
        email: payload.email?.trim(),
        password: payload.password,
        password_confirmation: payload.passwordConfirmation,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.loadError.set(response.message);
            return;
          }

          this.closeCreateModal();
        },
        error: (error: unknown) => {
          this.loadError.set(this.extractErrorMessage(error));
        }
      });

    return;
  }

  protected reload(): void {
    this.loadUsersFromApi();
  }

  private loadUsersFromApi(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.usersApi
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.members.set(response.data.map((item) => this.mapUser(item)));
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.loadError.set(this.extractErrorMessage(error));
        }
      });
  }

  private mapUser(item: {
    id: number;
    fullName: string;
    phone: string | null;
    address: string | null;
    notes: string | null;
    role: 'buyer' | 'manager' | 'publisher' | 'none';
  }): UserMember {
    return {
      id: item.id,
      fullName: item.fullName,
      phone: item.phone ?? '-',
      category: item.role === 'buyer' ? 'child' : 'collaborator',
      portalRole: item.role,
      address: item.address ?? undefined,
      notes: item.notes ?? '',
    };
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;

      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return 'Nao foi possivel carregar usuarios e membros agora.';
  }
}
