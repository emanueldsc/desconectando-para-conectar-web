import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Publication } from '../../content.models';

@Component({
  selector: 'dashboard-content-delete-confirm',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-delete-confirm.html',
  styleUrl: './content-delete-confirm.scss',
})
export class ContentDeleteConfirm {
  readonly publication = input.required<Publication>();
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
