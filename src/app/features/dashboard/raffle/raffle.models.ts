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
  winnerSourceComment?: string;
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
  winnerSourceComment?: string;
  processedAt: string;
}

export interface DrawRafflePayload {
  winnerNumber: number;
  sourceComment: string;
}
