import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../../store/menu/menu.models';


@Component({
  selector: 'top-bar',
  imports: [RouterModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  public readonly menuItems = input<readonly MenuItem[]>([]);
  public readonly menuClick = output<void>();
  public readonly menuItemSelected = output<MenuItem>();

  public openMenu(): void {
    this.menuClick.emit();
  }

  public selectItem(item: MenuItem): void {
    this.menuItemSelected.emit(item);
  }

  // Função para identificar se a rota é do painel logado
  isInternalRoute(route?: string): boolean {
    if (!route) return false;
    // Consideramos internas as rotas que apontam para as áreas restritas
    return route.includes('/member') || route.includes('/admin') || route.includes('/dashboard');
  }

  // Verifica se existe algum item de menu restrito disponível
  hasInternalItems(): boolean {
    return this.menuItems().some(item => this.isInternalRoute(item.route));
  }

  // Verifica se o menu atual tem a opção de logout
  hasLogout(): boolean {
    return this.menuItems().some(item => item.action === 'logout');
  }


}
