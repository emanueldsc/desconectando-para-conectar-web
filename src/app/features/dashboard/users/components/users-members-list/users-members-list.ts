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
  readonly query = input.required<string>();
  readonly filter = input.required<MemberFilter>();
  readonly section = input.required<UsersSection>();

  readonly queryChange = output<string>();
  readonly filterChange = output<MemberFilter>();
  readonly createMember = output<void>();
  readonly editMember = output<number>();

  protected heading(): string {
    if (this.section() === 'users') return 'Gestão de Usuários';
    return 'Gestão de Membros';
  }

  protected searchPlaceholder(): string {
    if (this.section() === 'users') return 'Buscar por nome ou telefone...';
    return 'Buscar por nome ou categoria...';
  }

  protected createLabel(): string {
    return 'Novo membro';
  }

  protected onSearch(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }

  protected onEditMember(id: number): void {
    this.editMember.emit(id);
  }
}
