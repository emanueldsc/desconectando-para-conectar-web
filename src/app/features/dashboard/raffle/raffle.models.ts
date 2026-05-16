export type RaffleStatus = 'active' | 'closed' | 'draft';

export interface RaffleCampaign {
  id: number;
  title: string;
  description: string;
  rangeStart: number;
  rangeEnd: number;
  soldTickets: number;
  ticketPrice: number;
  status: RaffleStatus;
  imageUrl?: string;
  winnerName?: string;
  winnerNumber?: number;
}

export interface CreateRafflePayload {
  title: string;
  description: string;
  rangeStart: number;
  rangeEnd: number;
  ticketPrice: number;
}

export interface DrawRaffleResult {
  winnerName: string;
  winnerNumber: number;
  processedAt: string;
}
