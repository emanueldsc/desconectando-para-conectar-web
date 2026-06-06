import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PublicHomeApiService } from '../../services/public-home-api.service';

interface FooterLink {
  label: string;
  route: string;
}

interface SocialLink {
  label: string;
  url: string;
  icon: 'instagram' | 'facebook' | 'youtube';
}

@Component({
  selector: 'footer-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly publicHomeApi = inject(PublicHomeApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly links: readonly FooterLink[] = [
    { label: 'Início', route: '/public/home' },
    { label: 'Blog', route: '/public/blog' },
    { label: 'Rifas', route: '/public/raffles' },
    { label: 'Login', route: '/login' },
    { label: 'Dashboard', route: '/dashboard' },
  ];

  protected readonly socialLinks = signal<readonly SocialLink[]>([
    { label: 'Instagram', url: 'https://www.instagram.com', icon: 'instagram' },
    { label: 'Facebook', url: 'https://www.facebook.com', icon: 'facebook' },
    { label: 'YouTube', url: 'https://www.youtube.com', icon: 'youtube' },
  ]);

  public constructor() {
    this.publicHomeApi.getHome()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.socialLinks.set([
            {
              label: 'Instagram',
              icon: 'instagram',
              url: this.normalizeSocialUrl(response.socials?.instagram, 'https://www.instagram.com'),
            },
            {
              label: 'Facebook',
              icon: 'facebook',
              url: this.normalizeSocialUrl(response.socials?.facebook, 'https://www.facebook.com'),
            },
            {
              label: 'YouTube',
              icon: 'youtube',
              url: this.normalizeSocialUrl(response.socials?.youtube, 'https://www.youtube.com'),
            },
          ]);
        },
      });
  }

  private normalizeSocialUrl(rawUrl: string | undefined, fallbackUrl: string): string {
    if (typeof rawUrl !== 'string') {
      return fallbackUrl;
    }

    const trimmedUrl = rawUrl.trim();

    if (trimmedUrl.length === 0) {
      return fallbackUrl;
    }

    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }

    return `https://${trimmedUrl}`;
  }
}
