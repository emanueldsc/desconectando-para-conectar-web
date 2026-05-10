import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Footer } from './shared/components/footer/footer';
import { TopBar } from './shared/components/top-bar/top-bar';
import { MenuActions } from './store/menu/menu.actions';
import { UserProfile } from './store/menu/menu.models';
import { selectMenuError, selectMenuItems, selectMenuLoading } from './store/menu/menu.selectors';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, MatSidenavModule, TopBar, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly store = inject(Store);

  protected readonly menuItems = this.store.selectSignal(selectMenuItems);
  protected readonly menuLoading = this.store.selectSignal(selectMenuLoading);
  protected readonly menuError = this.store.selectSignal(selectMenuError);

  public constructor() {
    const profile: UserProfile = 'guest';
    this.store.dispatch(MenuActions.loadMenu({ profile }));
  }
}
