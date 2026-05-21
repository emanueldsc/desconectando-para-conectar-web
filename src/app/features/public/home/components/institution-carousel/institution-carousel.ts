import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Institution } from '../../../../../shared/models/api-contracts.models';

@Component({
  selector: 'home-institution-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './institution-carousel.html',
  styleUrl: './institution-carousel.scss',
  imports: [MatIconModule]
})
export class InstitutionCarouselComponent {
  private isDragging = false;
  private startX = 0;
  private startScrollLeft = 0;
  readonly institutions = input<Institution[]>([]);

  protected scrollPrevious(track: HTMLElement): void {
    this.scrollByCard(track, -1);
  }

  protected scrollNext(track: HTMLElement): void {
    this.scrollByCard(track, 1);
  }

  protected onPointerDown(track: HTMLElement, event: PointerEvent): void {
    this.isDragging = true;
    this.startX = event.clientX;
    this.startScrollLeft = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
    track.classList.add('is-dragging');
  }

  protected onPointerMove(track: HTMLElement, event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }

    const deltaX = event.clientX - this.startX;
    track.scrollLeft = this.startScrollLeft - deltaX;
  }

  protected onPointerUp(track: HTMLElement, event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    track.releasePointerCapture(event.pointerId);
    track.classList.remove('is-dragging');
  }

  private scrollByCard(track: HTMLElement, direction: -1 | 1): void {
    const card = track.querySelector('.institution-card') as HTMLElement | null;
    const gap = 24;
    const amount = card ? card.offsetWidth + gap : 320;

    track.scrollBy({
      left: amount * direction,
      behavior: 'smooth'
    });
  }
}
