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

interface FooterContact {
  email: string;
  phone: string;
  whatsapp: string;
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
  protected readonly contact = signal<FooterContact>({
    email: 'contato@desconectando.com.br',
    phone: '(81) 3333-4444',
    whatsapp: '(81) 99999-0000',
  });

  protected readonly whatsappHref = signal('https://wa.me/5581999999999');

  public constructor() {
    this.publicHomeApi.getHome()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const contact = response.contact;

          if (contact) {
            this.contact.set({
              email: this.fallbackIfEmpty(contact.email, 'contato@desconectando.com.br'),
              phone: this.fallbackIfEmpty(contact.phone, '(81) 3333-4444'),
              whatsapp: this.fallbackIfEmpty(contact.whatsapp, '(81) 99999-0000'),
            });

            this.whatsappHref.set(this.buildWhatsappUrl(contact.whatsapp));
          }

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

  private fallbackIfEmpty(rawValue: string | undefined, fallbackValue: string): string {
    if (typeof rawValue !== 'string') {
      return fallbackValue;
    }

    const trimmedValue = rawValue.trim();
    return trimmedValue.length > 0 ? trimmedValue : fallbackValue;
  }

  private buildWhatsappUrl(rawWhatsapp: string | undefined): string {
    const value = this.fallbackIfEmpty(rawWhatsapp, '(81) 99999-0000');
    const digits = value.replace(/\D/g, '');
    const withCountryCode = digits.startsWith('55') ? digits : `55${digits}`;

    return `https://wa.me/${withCountryCode}`;
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
