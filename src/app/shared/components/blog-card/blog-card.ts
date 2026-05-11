import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

export interface BlogCardData {
  id: number;
  image: string;
  imageAlt: string;
  eyebrow: string;
  description: string;
}

@Component({
  selector: 'blog-card',
  imports: [MatCardModule, MatIconModule, RouterLink, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.scss',
})
export class BlogCardComponent {
  readonly post = input.required<BlogCardData>();
}
