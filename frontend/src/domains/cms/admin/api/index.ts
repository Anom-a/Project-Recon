import { http } from '@/src/shared/api/http';
import type {
  HeroBanner,
  NewsArticle,
  CmsPartner,
  AboutUs,
  ContactRequest,
  FAQ,
  PaginatedResponse,
} from '../model';

const PREFIX = '/cms/admin';

export const heroBannerApi = {
  list: (params?: Record<string, string>) =>
    http.get<PaginatedResponse<HeroBanner>>(`${PREFIX}/hero-banners/`, { params }),
  get: (id: string) =>
    http.get<HeroBanner>(`${PREFIX}/hero-banners/${id}/`),
  create: (data: Partial<HeroBanner>) =>
    http.post<HeroBanner>(`${PREFIX}/hero-banners/`, data),
  update: (id: string, data: Partial<HeroBanner>) =>
    http.put<HeroBanner>(`${PREFIX}/hero-banners/${id}/`, data),
  patch: (id: string, data: Partial<HeroBanner>) =>
    http.patch<HeroBanner>(`${PREFIX}/hero-banners/${id}/`, data),
  remove: (id: string) =>
    http.delete(`${PREFIX}/hero-banners/${id}/`),
};

export const newsApi = {
  list: (params?: Record<string, string>) =>
    http.get<PaginatedResponse<NewsArticle>>(`${PREFIX}/news/`, { params }),
  get: (id: string) =>
    http.get<NewsArticle>(`${PREFIX}/news/${id}/`),
  create: (data: Partial<NewsArticle>) =>
    http.post<NewsArticle>(`${PREFIX}/news/`, data),
  update: (id: string, data: Partial<NewsArticle>) =>
    http.put<NewsArticle>(`${PREFIX}/news/${id}/`, data),
  patch: (id: string, data: Partial<NewsArticle>) =>
    http.patch<NewsArticle>(`${PREFIX}/news/${id}/`, data),
  remove: (id: string) =>
    http.delete(`${PREFIX}/news/${id}/`),
};

export const partnerApi = {
  list: (params?: Record<string, string>) =>
    http.get<PaginatedResponse<CmsPartner>>(`${PREFIX}/partners/`, { params }),
  get: (id: string) =>
    http.get<CmsPartner>(`${PREFIX}/partners/${id}/`),
  create: (data: Partial<CmsPartner>) =>
    http.post<CmsPartner>(`${PREFIX}/partners/`, data),
  update: (id: string, data: Partial<CmsPartner>) =>
    http.put<CmsPartner>(`${PREFIX}/partners/${id}/`, data),
  patch: (id: string, data: Partial<CmsPartner>) =>
    http.patch<CmsPartner>(`${PREFIX}/partners/${id}/`, data),
  remove: (id: string) =>
    http.delete(`${PREFIX}/partners/${id}/`),
};

export const aboutUsApi = {
  list: (params?: Record<string, string>) =>
    http.get<PaginatedResponse<AboutUs>>(`${PREFIX}/about/`, { params }),
  get: (id: string) =>
    http.get<AboutUs>(`${PREFIX}/about/${id}/`),
  create: (data: Partial<AboutUs>) =>
    http.post<AboutUs>(`${PREFIX}/about/`, data),
  update: (id: string, data: Partial<AboutUs>) =>
    http.put<AboutUs>(`${PREFIX}/about/${id}/`, data),
  patch: (id: string, data: Partial<AboutUs>) =>
    http.patch<AboutUs>(`${PREFIX}/about/${id}/`, data),
  remove: (id: string) =>
    http.delete(`${PREFIX}/about/${id}/`),
};

export const contactRequestApi = {
  list: (params?: Record<string, string>) =>
    http.get<PaginatedResponse<ContactRequest>>(`${PREFIX}/contact-requests/`, { params }),
  get: (id: string) =>
    http.get<ContactRequest>(`${PREFIX}/contact-requests/${id}/`),
  update: (id: string, data: Partial<ContactRequest>) =>
    http.put<ContactRequest>(`${PREFIX}/contact-requests/${id}/`, data),
  patch: (id: string, data: Partial<ContactRequest>) =>
    http.patch<ContactRequest>(`${PREFIX}/contact-requests/${id}/`, data),
  remove: (id: string) =>
    http.delete(`${PREFIX}/contact-requests/${id}/`),
};

export const faqApi = {
  list: (params?: Record<string, string>) =>
    http.get<PaginatedResponse<FAQ>>(`${PREFIX}/faqs/`, { params }),
  get: (id: string) =>
    http.get<FAQ>(`${PREFIX}/faqs/${id}/`),
  create: (data: Partial<FAQ>) =>
    http.post<FAQ>(`${PREFIX}/faqs/`, data),
  update: (id: string, data: Partial<FAQ>) =>
    http.put<FAQ>(`${PREFIX}/faqs/${id}/`, data),
  patch: (id: string, data: Partial<FAQ>) =>
    http.patch<FAQ>(`${PREFIX}/faqs/${id}/`, data),
  remove: (id: string) =>
    http.delete(`${PREFIX}/faqs/${id}/`),
};
