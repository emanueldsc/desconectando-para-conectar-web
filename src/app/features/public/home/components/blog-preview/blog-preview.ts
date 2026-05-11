import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BlogCardComponent, BlogCardData } from '../../../../../shared/components/blog-card/blog-card';

@Component({
  selector: 'home-blog-preview',
  imports: [BlogCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-preview.html',
  styleUrl: './blog-preview.scss'
})
export class BlogPreviewComponent {
  protected readonly posts: BlogCardData[] = [
    {
      id: 1,
      image: 'assets/sertao_landscape.png',
      imageAlt: 'Paisagem do sertão com árvores e céu aberto',
      eyebrow: 'Histórias',
      description: 'Como a solidariedade transformou o Sertão'
    },
    {
      id: 2,
      image: 'assets/sertao_landscape.png',
      imageAlt: 'Vista de vegetação da caatinga ao entardecer',
      eyebrow: 'Guias',
      description: 'Rifa do Bem: como funciona e como participar'
    },
    {
      id: 3,
      image: 'assets/sertao_landscape.png',
      imageAlt: 'Cenário natural da caatinga com vegetação nativa',
      eyebrow: 'Natureza',
      description: 'Caatinga viva: natureza que inspira resistência'
    }
  ];
}
