import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UserMember } from '../../users.models';

@Component({
  selector: 'dashboard-user-member-card',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-member-card.html',
  styleUrl: './user-member-card.scss',
})
export class UserMemberCard {
  readonly member = input.required<UserMember>();
  readonly edit = output<number>();

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
    return 'Comprador de Rifa';
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
}
