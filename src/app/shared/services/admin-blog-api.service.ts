import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { PublicationPayload } from '../../features/dashboard/content/content.models';
import { API_BASE_URL } from './api.config';

export type AdminBlogPostStatus = 'published' | 'draft';

export interface AdminBlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  status: AdminBlogPostStatus;
  thumbnail?: string;
  excerpt?: string;
  imageAlt?: string;
  eyebrow?: string;
  category?: string;
  slug?: string;
  publishedAt?: string;
  updatedAt?: string;
  tags?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface AdminBlogListResponse {
  success: boolean;
  data: AdminBlogPost[];
}

export interface AdminBlogMutationResponse {
  success: boolean;
  message: string;
  data?: AdminBlogPost;
}

export interface AdminBlogImageUploadResponse {
  success: boolean;
  message: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminBlogApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  public getPosts(): Observable<AdminBlogListResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http.get<AdminBlogListResponse>(`${this.baseUrl}/admin/content/posts`, {
      headers: this.authorizationHeaders(token)
    });
  }

  public createPost(payload: PublicationPayload, status: AdminBlogPostStatus): Observable<AdminBlogMutationResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http.post<AdminBlogMutationResponse>(`${this.baseUrl}/admin/content/posts`, {
      ...payload,
      status,
    }, {
      headers: this.authorizationHeaders(token)
    });
  }

  public updatePost(postId: number, payload: PublicationPayload, status: AdminBlogPostStatus): Observable<AdminBlogMutationResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http.put<AdminBlogMutationResponse>(`${this.baseUrl}/admin/content/posts/${postId}`, {
      ...payload,
      status,
    }, {
      headers: this.authorizationHeaders(token)
    });
  }

  public deletePost(postId: number): Observable<AdminBlogMutationResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http.delete<AdminBlogMutationResponse>(`${this.baseUrl}/admin/content/posts/${postId}`, {
      headers: this.authorizationHeaders(token)
    });
  }

  public uploadFeaturedImage(file: File, previousUrl?: string): Observable<AdminBlogImageUploadResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    const formData = new FormData();
    formData.append('image', file);

    if (typeof previousUrl === 'string' && previousUrl.trim().length > 0) {
      formData.append('previous_url', previousUrl);
    }

    return this.http.post<AdminBlogImageUploadResponse>(`${this.baseUrl}/admin/content/posts/featured-image`, formData, {
      headers: this.authorizationHeaders(token)
    });
  }

  private authorizationHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private readAuthToken(): string | null {
    return localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  }
}