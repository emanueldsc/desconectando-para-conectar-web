import { ChangeDetectionStrategy, Component } from '@angular/core';

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
  protected readonly links: readonly FooterLink[] = [
    { label: 'Início', route: '/public/home' },
    { label: 'Blog', route: '/public/blog' },
    { label: 'Rifas', route: '/public/raffles' },
    { label: 'Login', route: '/login' },
    { label: 'Dashboard', route: '/dashboard' },
  ];

  protected readonly socialLinks: readonly SocialLink[] = [
    { label: 'Instagram', url: 'https://www.instagram.com', icon: 'instagram' },
    { label: 'Facebook', url: 'https://www.facebook.com', icon: 'facebook' },
    { label: 'YouTube', url: 'https://www.youtube.com', icon: 'youtube' },
  ];
}
