import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogCardComponent } from '../../../shared/components/blog-card/blog-card';
import { BlogComment, BlogPostFull } from '../../../shared/models/api-contracts.models';
import { PublicBlogApiService } from '../../../shared/services/public-blog-api.service';

@Component({
  selector: 'app-blog-article',
  imports: [RouterLink, MatIconModule, NgOptimizedImage, BlogCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-article.html',
  styleUrl: './blog-article.scss',
})
export class BlogArticle {
  private readonly blogApi = inject(PublicBlogApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly article = signal<BlogPostFull | null>(null);

  protected readonly relatedPosts = computed(() => this.article()?.relatedPosts ?? []);
  protected readonly comments = computed(() => this.article()?.comments ?? []);

  public constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (paramMap) => {
        const idOrSlug = paramMap.get('idOrSlug');

        if (!idOrSlug) {
          this.error.set('Artigo não encontrado.');
          this.loading.set(false);
          return;
        }

        this.loadArticle(idOrSlug);
      },
    });
  }

  protected formatPublishedAt(value: string | undefined): string {
    if (!value) {
      return '';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  }

  protected trackComment(index: number, comment: BlogComment): number {
    return comment.id ?? index;
  }

  private loadArticle(idOrSlug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.blogApi
      .getBlogPostByIdOrSlug(idOrSlug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.article.set(response);
          this.loading.set(false);
        },
        error: () => {
          this.article.set(null);
          this.error.set('Nao foi possivel carregar este artigo.');
          this.loading.set(false);
        },
      });
  }
}