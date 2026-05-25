import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CmsBannerUploadResponse, CmsSettingsResponse, CmsUpdateRequest, CmsUpdateResponse } from '../models/api-contracts.models';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AdminCmsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  public getSettings(): Observable<CmsSettingsResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http.get<CmsSettingsResponse>(`${this.baseUrl}/admin/cms`, {
      headers: this.authorizationHeaders(token)
    });
  }

  public updateSettings(payload: CmsUpdateRequest): Observable<CmsUpdateResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http.post<CmsUpdateResponse>(`${this.baseUrl}/admin/cms`, {...payload, _method: 'PUT'}, {
      headers: this.authorizationHeaders(token)
    });
  }

  public uploadBannerImage(file: File, previousUrl?: string): Observable<CmsBannerUploadResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    const formData = new FormData();
    formData.append('banner', file);

    if (typeof previousUrl === 'string' && previousUrl.trim().length > 0) {
      formData.append('previous_url', previousUrl);
    }

    return this.http.post<CmsBannerUploadResponse>(`${this.baseUrl}/admin/cms/banner-image`, formData, {
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
