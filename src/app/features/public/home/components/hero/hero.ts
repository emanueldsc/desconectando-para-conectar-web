import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { HeroData } from '../../../../../shared/models/api-contracts.models';

@Component({
  selector: 'home-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  imports: [MatButtonModule, MatIconModule, RouterLink]
})
export class HeroComponent {
  private static readonly DEFAULT_BACKGROUND_IMAGE = '/assets/sertao_landscape.png';

  readonly heroData = input<HeroData | null>(null);
  readonly impactPhrases = input<string[]>([]);
  readonly backgroundImage = computed(() => {
    const customImage = this.heroData()?.backgroundImage?.trim();
    const image = customImage && customImage.length > 0
      ? customImage
      : HeroComponent.DEFAULT_BACKGROUND_IMAGE;

    return `url('${image}')`;
  });

  readonly ctaIcon = computed(() => this.heroData()?.ctaIcon?.trim() || 'favorite_border');
  readonly ctaBackgroundColor = computed(() => this.heroData()?.ctaBackgroundColor?.trim() || '#d35400');
  readonly ctaTextColor = computed(() => this.heroData()?.ctaTextColor?.trim() || '#ffffff');
}
