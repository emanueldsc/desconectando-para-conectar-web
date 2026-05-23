import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    BlogListResponse,
    BlogPostPreview,
    FeaturedRaffleCard,
    HeroData,
    HomeRealitySection,
    Institution,
} from '../../../shared/models/api-contracts.models';
import { PublicBlogApiService } from '../../../shared/services/public-blog-api.service';
import { PublicHomeApiService } from '../../../shared/services/public-home-api.service';
import { BlogPreviewComponent } from './components/blog-preview/blog-preview';
import { HeroComponent } from './components/hero/hero';
import { RealitySectionComponent } from './components/reality-section/reality-section';
import { RifasDoBemComponent } from './components/rifas-do-bem/rifas-do-bem';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, RealitySectionComponent, RifasDoBemComponent, BlogPreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private static readonly BLOG_PREVIEW_PAGE_SIZE = 4;

  private readonly homeApi = inject(PublicHomeApiService);
  private readonly blogApi = inject(PublicBlogApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly hero = signal<HeroData | null>(null);
  protected readonly impactPhrases = signal<string[]>([]);
  protected readonly realitySection = signal<HomeRealitySection | null>(null);
  protected readonly institutions = signal<Institution[]>([]);
  protected readonly featuredRaffles = signal<FeaturedRaffleCard[]>([]);
  protected readonly blogPreview = signal<BlogPostPreview[]>([]);
  protected readonly blogLoading = signal(false);
  protected readonly blogError = signal<string | null>(null);
  protected readonly blogPage = signal(1);
  protected readonly blogPages = signal(1);

  public constructor() {
    this.loadHome();
    this.loadBlogPreview(1);
  }

  protected loadPreviousBlogPage(): void {
    if (this.blogLoading() || this.blogPage() <= 1) {
      return;
    }

    this.loadBlogPreview(this.blogPage() - 1);
  }

  protected loadNextBlogPage(): void {
    if (this.blogLoading() || this.blogPage() >= this.blogPages()) {
      return;
    }

    this.loadBlogPreview(this.blogPage() + 1);
  }

  private loadHome(): void {
    this.loading.set(true);
    this.error.set(null);

    this.homeApi
      .getHome()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.hero.set(response.hero);
          this.impactPhrases.set(response.impactPhrases);
          this.realitySection.set(response.realitySection);
          this.institutions.set(response.institutions);
          this.featuredRaffles.set(response.featuredRaffles);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Nao foi possivel carregar os dados da home.');
          this.loading.set(false);
        }
      });
  }

  private loadBlogPreview(page: number): void {
    this.blogLoading.set(true);
    this.blogError.set(null);

    this.blogApi
      .getBlogList({
        page,
        limit: Home.BLOG_PREVIEW_PAGE_SIZE,
        sort: 'newest'
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: BlogListResponse) => {
          this.blogPreview.set(response.data);
          this.blogPage.set(response.pagination.page);
          this.blogPages.set(Math.max(response.pagination.pages, 1));
          this.blogLoading.set(false);
        },
        error: () => {
          this.blogError.set('Nao foi possivel carregar os posts do blog.');
          this.blogLoading.set(false);
        }
      });
  }
}
