export type PublicationStatus = 'published' | 'draft';
export type PublicationFilter = 'all' | 'published' | 'draft';

export interface Publication {
  id: number;
  title: string;
  author: string;
  date: string;
  status: PublicationStatus;
  thumbnail?: string;
  content?: string;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface PublicationPayload {
  title: string;
  content: string;
  featuredImage?: string;
  excerpt?: string;
  imageAlt?: string;
  eyebrow?: string;
  category?: string;
  tags?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
}
