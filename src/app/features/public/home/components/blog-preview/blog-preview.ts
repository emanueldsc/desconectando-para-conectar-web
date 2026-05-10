import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

@Component({
  selector: 'home-blog-preview',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-preview.html',
  styleUrl: './blog-preview.scss'
})
export class BlogPreviewComponent {
  protected readonly posts: BlogPost[] = [
    {
      id: 1,
      title: 'Como a solidariedade transformou o Sertão',
      excerpt: 'Uma história de como pequenas ações coletivas mudaram a realidade de uma comunidade inteira no semiárido nordestino.',
      date: '08 Mai 2026',
      category: 'Histórias'
    },
    {
      id: 2,
      title: 'Rifa do Bem: Como funciona e como participar',
      excerpt: 'Entenda o modelo de rifas solidárias e como cada bilhete contribui diretamente para causas reais no interior do Brasil.',
      date: '02 Mai 2026',
      category: 'Guias'
    },
    {
      id: 3,
      title: 'Caatinga viva: natureza que inspira resistência',
      excerpt: 'A fauna e flora do bioma mais único do mundo nos ensina sobre resiliência e a força do povo sertanejo.',
      date: '25 Abr 2026',
      category: 'Natureza'
    }
  ];
}
