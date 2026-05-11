import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BlogCardComponent, BlogCardData } from '../../../shared/components/blog-card/blog-card';

@Component({
  selector: 'app-blog',
  imports: [BlogCardComponent, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  readonly searchQuery = signal('');

  private readonly allPosts: BlogCardData[] = [
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
    },
    {
      id: 4,
      image: 'assets/sertao_landscape.png',
      imageAlt: 'Comunidade sertaneja trabalhando em conjunto',
      eyebrow: 'Histórias',
      description: 'Educação transformadora no interior nordestino'
    },
    {
      id: 5,
      image: 'assets/sertao_landscape.png',
      imageAlt: 'Recursos de água e sustentabilidade',
      eyebrow: 'Recursos',
      description: 'Água: o recurso vital do semiárido'
    },
  ];

  protected readonly filteredPosts = signal<BlogCardData[]>(this.allPosts);

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.updateFilteredPosts();
  }

  private updateFilteredPosts(): void {
    const query = this.searchQuery().toLowerCase();
    if (!query.trim()) {
      this.filteredPosts.set(this.allPosts);
    } else {
      this.filteredPosts.set(
        this.allPosts.filter(post =>
          post.description.toLowerCase().includes(query) ||
          post.eyebrow.toLowerCase().includes(query)
        )
      );
    }
  }
}
