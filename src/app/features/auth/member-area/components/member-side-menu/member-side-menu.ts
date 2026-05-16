import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'auth-member-side-menu',
  imports: [MatIconModule],
  templateUrl: './member-side-menu.html',
  styleUrl: './member-side-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberSideMenu {
  protected readonly items = signal([
    { icon: 'person', label: 'Meu Perfil', active: true },
  ]);
}
