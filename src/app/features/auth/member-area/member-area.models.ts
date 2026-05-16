export interface MemberStats {
  totalDonated: string;
  livesImpacted: number;
}

export interface MemberRaffle {
  id: number;
  title: string;
  drawDate: string;
  status: 'active' | 'completed';
  numbers?: number[];
  summary?: string;
  imageUrl: string;
}

export interface ParticipationOpportunity {
  title: string;
  description: string;
  progress: number;
  imageUrl: string;
}
