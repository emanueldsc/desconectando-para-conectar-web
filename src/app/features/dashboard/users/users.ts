import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { UserCreateModal } from './components/user-create-modal/user-create-modal';
import { UsersMembersList } from './components/users-members-list/users-members-list';
import { CreateMemberPayload, MemberFilter, UserMember } from './users.models';

type UsersSection = 'members' | 'users';

const INITIAL_MEMBERS: readonly UserMember[] = [
  {
    id: 1,
    fullName: 'Joao Miguel Silva',
    phone: '(11) 98765-4321',
    category: 'child',
    portalRole: 'buyer',
  },
  {
    id: 2,
    fullName: 'Maria Luiza Ferreira',
    phone: '(81) 99123-4567',
    category: 'volunteer',
    portalRole: 'publisher',
  },
  {
    id: 3,
    fullName: 'Carlos Eduardo Souza',
    phone: '(81) 98877-6655',
    category: 'collaborator',
    portalRole: 'manager',
  },
  {
    id: 4,
    fullName: 'Ana Beatriz Costa',
    phone: '(11) 97777-8888',
    category: 'child',
    portalRole: 'buyer',
  },
];

@Component({
  selector: 'users',
  imports: [UsersMembersList, UserCreateModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  protected readonly members = signal<UserMember[]>([...INITIAL_MEMBERS]);
  protected readonly query = signal('');
  protected readonly filter = signal<MemberFilter>('all');
  protected readonly showCreateModal = signal(false);
  protected readonly editingMemberId = signal<number | null>(null);
  protected readonly activeSection = signal<UsersSection>('members');

  protected readonly filteredMembers = computed(() => {
    const search = this.query().toLowerCase().trim();
    const activeFilter = this.filter();
    const section = this.activeSection();

    const sectionMembers = this.members().filter((member) => {
      if (section === 'members') {
        return member.portalRole !== 'buyer';
      }

      return member.portalRole === 'buyer';
    });

    return sectionMembers.filter((member) => {
      const matchesSearch =
        !search ||
        member.fullName.toLowerCase().includes(search) ||
        member.category.toLowerCase().includes(search);
      const matchesFilter = section === 'users' || activeFilter === 'all' || member.category === activeFilter;
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
    if (this.activeSection() === 'users') {
      return;
    }

    this.editingMemberId.set(null);
    this.showCreateModal.set(true);
  }

  protected openEditModal(id: number): void {
    this.editingMemberId.set(id);
    this.showCreateModal.set(true);
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.editingMemberId.set(null);
  }

  protected saveMember(payload: CreateMemberPayload): void {
    const editingId = this.editingMemberId();
    const section = this.activeSection();

    if (editingId !== null) {
      this.members.update((items) =>
        items.map((member) =>
          member.id === editingId
            ? {
                ...member,
                fullName: payload.fullName.trim(),
                phone: payload.phone.trim(),
                category: payload.category,
                portalRole: section === 'users' ? 'buyer' : payload.portalRole,
                notes: payload.notes.trim(),
              }
            : member
        )
      );
      this.closeCreateModal();
      return;
    }

    // Buyers are created only in the public portal area, not from this internal screen.
    if (section === 'users') {
      return;
    }

    const nextId = Math.max(0, ...this.members().map((member) => member.id)) + 1;
    const created: UserMember = {
      id: nextId,
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      category: payload.category,
      portalRole: payload.portalRole,
      notes: payload.notes.trim(),
    };

    this.members.update((items) => [created, ...items]);
    this.closeCreateModal();
  }
}
