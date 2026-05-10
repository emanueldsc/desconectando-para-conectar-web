import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface Institution {
  id: number;
  name: string;
  description: string;
  image: string;
  imagePosition: string;
}

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

  protected readonly institutions: Institution[] = [
    {
      id: 1,
      name: 'Associação Sertaneja',
      description: 'Apoio às famílias do sertão nordestino com ações de impacto social contínuo.',
      image: '/assets/sertao_landscape.png',
      imagePosition: 'left center'
    },
    {
      id: 2,
      name: 'Instituto Raízes',
      description: 'Educação e cultura para comunidades rurais com foco em juventude e cidadania.',
      image: '/assets/sertao_landscape.png',
      imagePosition: 'center center'
    },
    {
      id: 3,
      name: 'Rede Caatinga',
      description: 'Preservação da Caatinga e incentivo a tecnologias sustentáveis no semiárido.',
      image: '/assets/sertao_landscape.png',
      imagePosition: 'right center'
    },
    {
      id: 4,
      name: 'Projeto Mandacaru',
      description: 'Fortalecimento da agricultura familiar e geração de renda local com dignidade.',
      image: '/assets/sertao_landscape.png',
      imagePosition: 'center top'
    }
  ];

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
