import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    BlogPostPreview,
    FeaturedRaffleCard,
    HeroData,
    HomeRealitySection,
    Institution,
} from '../../../shared/models/api-contracts.models';
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
  private readonly homeApi = inject(PublicHomeApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly hero = signal<HeroData | null>(null);
  protected readonly impactPhrases = signal<string[]>([]);
  protected readonly realitySection = signal<HomeRealitySection | null>(null);
  protected readonly institutions = signal<Institution[]>([]);
  protected readonly featuredRaffles = signal<FeaturedRaffleCard[]>([]);
  protected readonly blogPreview = signal<BlogPostPreview[]>([]);

  public constructor() {
    this.loadHome();
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
          this.blogPreview.set(response.blogPreview);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Nao foi possivel carregar os dados da home.');
          this.loading.set(false);
        }
      });
  }
}
