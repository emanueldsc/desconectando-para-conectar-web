import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BlogPreviewComponent } from './components/blog-preview/blog-preview';
import { HeroComponent } from './components/hero/hero';
import { InstitutionCarouselComponent } from './components/institution-carousel/institution-carousel';
import { RifasDoBemComponent } from './components/rifas-do-bem/rifas-do-bem';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, InstitutionCarouselComponent, RifasDoBemComponent, BlogPreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
