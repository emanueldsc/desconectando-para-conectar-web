
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';


interface RaffleNumber {
  number: number;
  status: 'available' | 'selected' | 'occupied';
}

interface RaffleDetailData {
  title: string;
  description: string;
  image: string;
  drawDate: string;
  ticketPrice: number;
  numbers: RaffleNumber[];
  progress: number; // 0-100
  total: number;
  sold: number;
}

const MOCK_DATA: RaffleDetailData = {
  title: 'Cesta Regional Nordestina',
  description: 'Participe da nossa rifa solidária e concorra a uma linda cesta repleta de produtos artesanais da região do Sertão. Tudo preparado com muito carinho por produtores locais.',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyVRdAZ0tP2CcbF-p37kz9TGoNpeUPXfKjXYG-qU4PMMcuyvde3HYWkl15dWkwTYntvZQpb4IoABjuhV0JIxoQmRxghpBef7bYrggGkz8m2QQRan-oMnOlwe5pqDWTDgRMIPMpNWKoXgNDkHC9kKGG4-e2Ss0JouKfVbLMebmMSSpk3g8iHsPNw-aF6O8hjubvKoJiPpPbRAZ-GpvKtO-QqleQ3cMhvLLPpwwdUfGnIcEBrD8W_95RuBT4SlQd1hGnNneJZQgkj18X',
  drawDate: '15 de Dezembro',
  ticketPrice: 10,
  numbers: Array.from({ length: 30 }, (_, i) => {
    if ([4, 5, 9, 12, 16, 17].includes(i + 1)) return { number: i + 1, status: 'occupied' };
    if ([2, 8].includes(i + 1)) return { number: i + 1, status: 'selected' };
    return { number: i + 1, status: 'available' };
  }),
  progress: 65,
  total: 100,
  sold: 65,
};

@Component({
  selector: 'app-raffle',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./raffle.scss'],
  templateUrl: './raffle.html'
})
export class Raffle {

  readonly data = signal<RaffleDetailData>(MOCK_DATA);
  readonly selectedNumbers = signal<number[]>([]);

  isSelected(num: number): boolean {
    return this.selectedNumbers().includes(num);
  }

  toggleNumber(n: RaffleNumber) {
    if (n.status === 'occupied') return;
    const current = this.selectedNumbers();
    if (current.includes(n.number)) {
      this.selectedNumbers.set(current.filter(x => x !== n.number));
    } else {
      this.selectedNumbers.set([...current, n.number]);
    }
  }


}
