import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'footer-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {}
