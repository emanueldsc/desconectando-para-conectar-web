import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    BlogListQuery,
    BlogListResponse,
    BlogPostFull
} from '../models/api-contracts.models';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class PublicBlogApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  public getBlogList(query: BlogListQuery = {}): Observable<BlogListResponse> {
    const params = this.buildQueryParams(query);
    return this.http.get<BlogListResponse>(`${this.baseUrl}/public/blog`, { params });
  }

  public getBlogPostByIdOrSlug(idOrSlug: number | string): Observable<BlogPostFull> {
    return this.http.get<BlogPostFull>(`${this.baseUrl}/public/blog/${idOrSlug}`);
  }

  private buildQueryParams(query: BlogListQuery): HttpParams {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }

      params = params.set(key, String(value));
    }

    return params;
  }
}
