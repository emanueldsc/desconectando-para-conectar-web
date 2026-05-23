import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
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
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly limit = signal(4);
  readonly limitOptions = [4, 8, 12, 24];
  readonly totalItems = signal(0);

  public constructor() {
    this.loadBlogPosts();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.page.set(1);
    this.loadBlogPosts();
  }


  onLimitChangeEvent(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    const parsed = Number(value);
    if (this.limitOptions.includes(parsed)) {
      this.limit.set(parsed);
      this.page.set(1);
      this.loadBlogPosts();
    }
  }

  goToPreviousPage(): void {
    if (this.page() > 1 && !this.loading()) {
      this.page.set(this.page() - 1);
      this.loadBlogPosts();
    }
  }

  goToNextPage(): void {
    if (this.page() < this.totalPages() && !this.loading()) {
      this.page.set(this.page() + 1);
      this.loadBlogPosts();
    }
  }

  private loadBlogPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.blogApi
      .getBlogList({
        sort: 'newest',
        page: this.page(),
        limit: this.limit(),
        search: this.searchQuery().trim() || undefined
      })
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
          this.page.set(response.pagination.page);
          this.totalPages.set(Math.max(response.pagination.pages, 1));
          this.totalItems.set(response.pagination.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Nao foi possivel carregar os artigos do blog.');
          this.loading.set(false);
        }
      });
  }
}
