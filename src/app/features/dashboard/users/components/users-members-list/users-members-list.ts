import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MemberFilter, UserMember } from '../../users.models';
import { UserMemberCard } from '../user-member-card/user-member-card';

type UsersSection = 'members' | 'users';

@Component({
  selector: 'dashboard-users-members-list',
  imports: [MatIconModule, UserMemberCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-members-list.html',
  styleUrl: './users-members-list.scss',
})
export class UsersMembersList {
  readonly members = input.required<readonly UserMember[]>();
  readonly savingNoteIds = input.required<readonly number[]>();
  readonly query = input.required<string>();
  readonly filter = input.required<MemberFilter>();
  readonly section = input.required<UsersSection>();

  readonly queryChange = output<string>();
  readonly filterChange = output<MemberFilter>();
  readonly createMember = output<void>();
  readonly editMember = output<number>();
  readonly saveMemberNote = output<{ id: number; notes: string }>();

  protected heading(): string {
    if (this.section() === 'users') return 'Gestão de Usuários do Portal';
    return 'Gestão de Membros';
  }

  protected searchPlaceholder(): string {
    if (this.section() === 'users') return 'Buscar por nome ou categoria...';
    return 'Buscar por nome ou telefone...';
  }

  protected createLabel(): string {
    return 'Novo usuário';
  }

  protected onSearch(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }

  protected onEditMember(id: number): void {
    this.editMember.emit(id);
  }

  protected onSaveMemberNote(payload: { id: number; notes: string }): void {
    this.saveMemberNote.emit(payload);
  }
}
