import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { Footer } from './shared/components/footer/footer';
import { TopBar } from './shared/components/top-bar/top-bar';
import { MenuActions } from './store/menu/menu.actions';
import { MenuItem, UserProfile } from './store/menu/menu.models';
import { selectMenuError, selectMenuItems, selectMenuLoading } from './store/menu/menu.selectors';

const DASHBOARD_MENU: readonly MenuItem[] = [
  { id: 'dash-general',   label: 'Visão Geral',  route: '/dashboard',           profiles: ['admin'] },
  { id: 'dash-content',   label: 'Conteúdo Blog', route: '/dashboard/content',  profiles: ['admin'] },
  { id: 'dash-raffle',    label: 'Rifas',         route: '/dashboard/raffle',   profiles: ['admin'] },
  { id: 'dash-donations', label: 'Doações',       route: '/dashboard/donations',profiles: ['admin'] },
  { id: 'dash-users',     label: 'Usuários',      route: '/dashboard/users',    profiles: ['admin'] },
  { id: 'dash-cms',       label: 'CMS do Site',   route: '/dashboard/cms',      profiles: ['admin'] },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, MatSidenavModule, MatButtonModule, MatIconModule, TopBar, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly menuItems = this.store.selectSignal(selectMenuItems);
  protected readonly menuLoading = this.store.selectSignal(selectMenuLoading);
  protected readonly menuError = this.store.selectSignal(selectMenuError);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  protected readonly isDashboard = computed(() =>
    this.currentUrl().startsWith('/dashboard')
  );

  protected readonly activeMenuItems = computed<readonly MenuItem[]>(() =>
    this.isDashboard() ? DASHBOARD_MENU : this.menuItems()
  );

  protected readonly dashboardMenuItems = DASHBOARD_MENU;

  public constructor() {
    const profile: UserProfile = 'guest';
    this.store.dispatch(MenuActions.loadMenu({ profile }));
  }

  protected menuIcon(menuId: string): string {
    const iconMap: Record<string, string> = {
      home: 'home',
      blog: 'auto_stories',
      raffles: 'confirmation_number',
      login: 'login',
      dashboard: 'dashboard',
      'dash-general':   'dashboard',
      'dash-content':   'edit_note',
      'dash-raffle':    'confirmation_number',
      'dash-donations': 'volunteer_activism',
      'dash-users':     'group',
      'dash-cms':       'tune',
    };

    return iconMap[menuId] ?? 'menu';
  }

  protected menuHint(menuId: string): string {
    const hintMap: Record<string, string> = {
      'dash-general':   'Resumo e indicadores',
      'dash-content':   'Postagens do blog',
      'dash-raffle':    'Gestão das rifas',
      'dash-donations': 'Gestão das doações',
      'dash-users':     'Usuários internos e externos',
      'dash-cms':       'Conteúdos gerais do site',
    };

    return hintMap[menuId] ?? `Acessar ${menuId}`;
  }
}
