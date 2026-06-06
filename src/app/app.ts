import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, finalize, map } from 'rxjs';
import { Footer } from './shared/components/footer/footer';
import { TopBar } from './shared/components/top-bar/top-bar';
import { AuthApiService } from './shared/services/auth-api.service';
import { MenuActions } from './store/menu/menu.actions';
import { MenuItem, MenuScope, UserProfile } from './store/menu/menu.models';
import { selectMenuError, selectMenuItems, selectMenuLoading } from './store/menu/menu.selectors';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, MatSidenavModule, MatButtonModule, MatIconModule, TopBar, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  private readonly destroyRef = inject(DestroyRef);

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

  private readonly menuScope = computed<MenuScope>(() =>
    this.isDashboard() ? 'dashboard' : 'public'
  );

  protected readonly activeMenuItems = computed(() => {
    this.currentUrl();

    const items = this.menuItems();
    const authRole = this.readAuthUser()?.role?.trim().toLowerCase();

    if (authRole !== 'publisher') {
      return items;
    }

    const blockedIds = new Set(['dash-cms', 'dash-users', 'dash-donations']);
    return items.filter((item) => !blockedIds.has(item.id));
  });
  protected readonly internalMenuItems = computed(() =>
    this.activeMenuItems().filter((item) => item.scope === 'dashboard')
  );
  protected readonly externalMenuItems = computed(() =>
    this.activeMenuItems().filter((item) => item.scope !== 'dashboard')
  );
  protected readonly hasMixedMenuScopes = computed(() =>
    this.internalMenuItems().length > 0 && this.externalMenuItems().length > 0
  );

  public constructor() {
    effect(() => {
      this.currentUrl();
      const scope = this.menuScope();
      const profile = this.resolveProfile(scope);
      this.store.dispatch(MenuActions.loadMenu({ profile, scope }));
    });
  }

  private resolveProfile(scope: MenuScope): UserProfile {
    const authUser = this.readAuthUser();

    if (!authUser) {
      return 'guest';
    }

    if (scope === 'dashboard' && authUser.role === 'buyer') {
      return 'guest';
    }

    return authUser.role === 'buyer' ? 'member' : 'admin';
  }

  protected handleMenuItem(item: MenuItem): void {
    if (item.action === 'logout') {
      this.logout();
    }
  }

  private logout(): void {
    const token = this.readAuthToken();

    if (!token) {
      this.clearAuthSession();
      this.refreshMenu();
      void this.router.navigate(['/public/home']);
      return;
    }

    this.authApi.logout(token)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.clearAuthSession();
          this.refreshMenu();
          void this.router.navigate(['/public/home']);
        })
      )
      .subscribe({
        error: (_error: unknown) => {
          this.clearAuthSession();
          this.refreshMenu();
          void this.router.navigate(['/public/home']);
        }
      });
  }

  private refreshMenu(): void {
    const scope = this.menuScope();
    const profile = this.resolveProfile(scope);
    this.store.dispatch(MenuActions.loadMenu({ profile, scope }));
  }

  private readAuthToken(): string | null {
    return localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  }

  private readAuthUser(): { role?: string } | null {
    const rawUser = localStorage.getItem('auth_user') ?? sessionStorage.getItem('auth_user');

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as { role?: string };
    } catch {
      return null;
    }
  }

  private clearAuthSession(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  }

  protected menuIcon(menuId: string): string {
    const iconMap: Record<string, string> = {
      home: 'home',
      blog: 'auto_stories',
      raffles: 'confirmation_number',
      login: 'login',
      'member-area': 'groups',
      logout: 'logout',
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
      'member-area': 'Acesse sua area de membros',
      logout: 'Encerrar sessao com seguranca',
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
