import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BlogCardComponent, BlogCardData } from '../../../shared/components/blog-card/blog-card';
import { PublicBlogApiService } from '../../../shared/services/public-blog-api.service';

@Component({
  selector: 'app-blog',
  imports: [BlogCardComponent, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  private readonly blogApi = inject(PublicBlogApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchQuery = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly posts = signal<BlogCardData[]>([]);

  protected readonly filteredPosts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return this.posts();
    }

    return this.posts().filter((post) =>
      post.description.toLowerCase().includes(query)
      || post.eyebrow.toLowerCase().includes(query)
    );
  });

  public constructor() {
    this.loadBlogPosts();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  private loadBlogPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.blogApi
      .getBlogList({ sort: 'newest', limit: 24 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.posts.set(
            response.data.map((post) => ({
              id: post.id,
              slug: post.slug,
              image: post.image,
              imageAlt: post.imageAlt,
              eyebrow: post.eyebrow,
              description: post.description
            }))
          );
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Nao foi possivel carregar os artigos do blog.');
          this.loading.set(false);
        }
      });
  }
}
