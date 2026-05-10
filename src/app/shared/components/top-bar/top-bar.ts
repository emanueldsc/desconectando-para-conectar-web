import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../../store/menu/menu.models';

@Component({
  selector: 'top-bar',
  imports: [RouterModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  public readonly menuItems = input<readonly MenuItem[]>([]);
  public readonly menuClick = output<void>();

  public openMenu(): void {
    this.menuClick.emit();
  }
}
