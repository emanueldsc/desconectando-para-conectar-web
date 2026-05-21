import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BlogCardComponent } from '../../../../../shared/components/blog-card/blog-card';
import { HomeRealitySection } from '../../../../../shared/models/api-contracts.models';

@Component({
  selector: 'home-reality-section',
  imports: [BlogCardComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reality-section.html',
  styleUrl: './reality-section.scss',
})
export class RealitySectionComponent {
  readonly section = input<HomeRealitySection | null>(null);

  @ViewChild('carouselWrap', { read: ElementRef }) private carouselWrapRef?: ElementRef<HTMLElement>;

  protected scrollCarousel(direction: 'previous' | 'next'): void {
    const carousel = this.carouselWrapRef?.nativeElement;

    if (!carousel) {
      return;
    }

    const item = carousel.querySelector<HTMLElement>('.reality__item');
    const itemWidth = item?.getBoundingClientRect().width ?? Math.min(carousel.clientWidth * 0.75, 360);
    const gap = 16;
    const offset = itemWidth + gap;

    carousel.scrollBy({
      left: direction === 'next' ? offset : -offset,
      behavior: 'smooth',
    });
  }
}
