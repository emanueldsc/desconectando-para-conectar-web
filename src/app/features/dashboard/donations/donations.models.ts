export type DonationStatus = 'confirmed' | 'pending';
export type DonationFilter = DonationStatus | 'all';
export type PaymentMethod = 'pix' | 'card' | 'boleto' | 'cash';

export interface Donation {
  id: number;
  donorName: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  notes: string | null;
  canEdit: boolean;
}

export interface DonationCreatePayload {
  donorName: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  isConfirmed: boolean;
  notes?: string | null;
}
