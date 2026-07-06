export type NewsType = 'NEWS' | 'ANNOUNCEMENT';
export type PartnerType = 'SPONSOR' | 'PARTNER';
export type ContactStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ContactPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string | null;
  video_url: string | null;
  button_text: string | null;
  button_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string | null;
  video_url: string | null;
  button_text: string | null;
  button_url: string | null;
  type: NewsType;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsPartner {
  id: string;
  title: string;
  description: string;
  image: string | null;
  website_url: string | null;
  type: PartnerType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutUs {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactRequest {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  description: string;
  attachment: string | null;
  status: ContactStatus;
  priority: ContactPriority;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
