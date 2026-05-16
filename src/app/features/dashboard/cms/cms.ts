
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dashboard-cms',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cms.html',
  styleUrls: ['./cms.scss'],
})
export class Cms {
  // Signals para banners, frases, contatos e redes sociais
  readonly banners = signal([
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1zkLvq2X2LAXXSCEJqTW_fRWDeAv6y-aDc45lt6WD1YpneUezJn1iDskm8FZ4c5oaDQUw5K53u7tLcrmW9OB-T2Hm4khNh8sKlOwlWe1gINGA-o0qgj57Vg66HA3mPW54bI89xlJ8J9PscMPcGCIrY6D4sOQ_dKjjCrNISmHKUY1S5aXlY-TPmiWNTQoOJkPlcOGo-k9X6M_Nj3u0alWupFXu2kSoexkaiIgq7B3GedzmFWwt0--jebsSGsVclm3tHdn9Bgb9gQmP',
      alt: 'Banner Atual',
      label: 'Banner Principal',
    },
  ]);

  readonly phrases = signal([
    'A união faz a força do nosso povo.',
    'Conectando corações e transformando vidas.',
  ]);

  readonly contact = signal({
    email: 'contato@desconectando.com.br',
    whatsapp: '(81) 99999-0000',
    phone: '(81) 3333-4444',
  });

  readonly socials = signal({
    instagram: 'https://instagram.com/desconectando',
    facebook: 'https://facebook.com/desconectando',
    youtube: '',
  });

  // Métodos de manipulação (mock)
  addBanner() {}
  editBanner(idx: number) {}
  deleteBanner(idx: number) {}
  addPhrase() {}
  editPhrase(idx: number) {}
  deletePhrase(idx: number) {}
  save() {}
}
