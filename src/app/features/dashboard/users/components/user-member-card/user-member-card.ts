import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UserMember } from '../../users.models';

type UsersSection = 'members' | 'users';

@Component({
  selector: 'dashboard-user-member-card',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-member-card.html',
  styleUrl: './user-member-card.scss',
})
export class UserMemberCard {
  readonly member = input.required<UserMember>();
  readonly section = input.required<UsersSection>();
  readonly savingNote = input(false);
  readonly edit = output<number>();
  readonly saveNote = output<{ id: number; notes: string }>();
  protected readonly noteDraft = signal('');

  protected readonly categoryLabel = computed(() => {
    const category = this.member().category;
    if (category === 'child') return 'Criança';
    if (category === 'volunteer') return 'Voluntário';
    return 'Colaborador';
  });

  protected readonly isBuyer = computed(() => this.member().portalRole === 'buyer');

  protected readonly roleLabel = computed(() => {
    const role = this.member().portalRole;
    if (role === 'manager') return 'Gestor Portal';
    if (role === 'publisher') return 'Publicador';
    if (role === 'none') return 'Sem perfil no portal';
    return 'Comprador de Rifa';
  });

  protected readonly entityLabel = computed(() => (this.isBuyer() ? 'membro' : 'usuário'));
  protected readonly canEditUser = computed(() => this.section() === 'users' && !this.isBuyer());
  protected readonly canManageMemberNote = computed(() => this.section() === 'members' && this.isBuyer());
  protected readonly hasChangedNote = computed(() => {
    const current = (this.member().notes ?? '').trim();
    const draft = this.noteDraft().trim();
    return current !== draft;
  });

  protected readonly iconName = computed(() => {
    const category = this.member().category;
    if (category === 'child') return 'child_care';
    if (category === 'volunteer') return 'volunteer_activism';
    return 'badge';
  });

  protected requestEdit(): void {
    this.edit.emit(this.member().id);
  }

  public constructor() {
    effect(() => {
      this.noteDraft.set(this.member().notes ?? '');
    });
  }

  protected onNoteInput(event: Event): void {
    this.noteDraft.set((event.target as HTMLTextAreaElement).value);
  }

  protected submitNote(): void {
    if (!this.canManageMemberNote() || !this.hasChangedNote() || this.savingNote()) {
      return;
    }

    this.saveNote.emit({
      id: this.member().id,
      notes: this.noteDraft().trim(),
    });
  }
}
