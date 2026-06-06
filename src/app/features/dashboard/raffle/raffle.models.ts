export type RaffleStatus = 'active' | 'closed' | 'draft';

export interface RaffleNumberEntry {
  number: number;
  status: 'available' | 'reserved' | 'occupied';
  reservationCode?: string;
  reservedUntil?: string;
  reservationReceiptUrl?: string;
  reservationPaymentStatus?: 'awaiting_receipt' | 'pending_review' | 'approved';
}

export interface RaffleCampaign {
  id: number;
  title: string;
  description: string;
  rangeStart: number;
  rangeEnd: number;
  soldTickets: number;
  ticketPrice: number;
  reservationTimeoutMinutes: number;
  drawDate?: string | null;
  status: RaffleStatus;
  numbers?: RaffleNumberEntry[];
  imageUrl?: string;
  winnerName?: string;
  winnerNumber?: number;
  extractionNumber?: number;
}

export interface CreateRafflePayload {
  title: string;
  description: string;
  rangeStart: number;
  rangeEnd: number;
  ticketPrice: number;
  reservationTimeoutMinutes: number;
  drawDate?: string | null;
  imageUrl?: string;
}

export interface DrawRaffleResult {
  winnerName?: string;
  winnerNumber: number;
  extractionNumber: number;
  processedAt: string;
}

export interface DrawRafflePayload {
  winnerNumber: number;
  winnerName?: string;
}
