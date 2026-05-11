export type PublicationStatus = 'published' | 'draft';
export type PublicationFilter = 'all' | 'published' | 'draft';

export interface Publication {
  id: number;
  title: string;
  author: string;
  date: string;
  status: PublicationStatus;
  thumbnail?: string;
}

export interface PublicationPayload {
  title: string;
  content: string;
}
