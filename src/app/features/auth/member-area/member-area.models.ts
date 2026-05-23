export interface MemberStats {
  totalDonated: string;
  livesImpacted: number;
}

export interface MemberRaffle {
  id: number;
  title: string;
  drawDate: string;
  status: 'active' | 'completed';
  numbers?: { number: number; status: string; reservationCode?: string; reservationPaymentStatus?: string | null; reservationReceiptUrl?: string | null }[];
  summary?: string;
  imageUrl: string;
}

export interface MemberProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: string;
  role: 'buyer' | 'manager' | 'publisher';
}

export interface MemberOpportunityRaffle {
  id: number;
  title: string;
  description: string;
  slug: string;
  ticketPrice: number;
  progress: number;
  drawDate: string | null;
  status: 'active' | 'coming' | 'finished';
}
