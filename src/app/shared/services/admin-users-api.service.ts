import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface AdminUserRecord {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: 'buyer' | 'manager' | 'publisher' | 'none';
  status: 'active' | 'inactive';
  createdAt: string | null;
}

export interface AdminUsersListResponse {
  success: boolean;
  data: AdminUserRecord[];
}

export interface AdminUserUpdatePayload {
  fullName: string;
  phone: string;
  address: string;
  role: 'buyer' | 'manager' | 'publisher' | 'none';
}

export interface AdminUserCreatePayload {
  fullName: string;
  phone: string;
  address: string;
  role: 'none' | 'manager' | 'publisher';
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export interface AdminUserMutationResponse {
  success: boolean;
  message: string;
  data: AdminUserRecord;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  public getUsers(): Observable<AdminUsersListResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http.get<AdminUsersListResponse>(`${this.baseUrl}/admin/users`, {
      headers: this.authorizationHeaders(token)
    });
  }

  public updateUser(userId: number, payload: AdminUserUpdatePayload): Observable<AdminUserMutationResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http.put<AdminUserMutationResponse>(`${this.baseUrl}/admin/users/${userId}`, payload, {
      headers: this.authorizationHeaders(token)
    });
  }

  public createUser(payload: AdminUserCreatePayload): Observable<AdminUserMutationResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http.post<AdminUserMutationResponse>(`${this.baseUrl}/admin/users`, payload, {
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
