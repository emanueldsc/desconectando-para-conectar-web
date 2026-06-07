import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface AdminDonationRecord {
  id: number;
  donorName: string;
  amount: number;
  date: string;
  paymentMethod: 'pix' | 'card' | 'boleto' | 'cash';
  status: 'confirmed' | 'pending';
  notes: string | null;
  canEdit: boolean;
  createdAt: string;
}

export interface AdminDonationsListResponse {
  success: boolean;
  data: AdminDonationRecord[];
  editWindowMinutes: number;
}

export interface AdminDonationPayload {
  donorName: string;
  amount: number;
  date: string;
  paymentMethod: 'pix' | 'card' | 'boleto' | 'cash';
  isConfirmed: boolean;
  notes?: string | null;
}

export interface AdminDonationMutationResponse {
  success: boolean;
  message: string;
  data?: AdminDonationRecord;
  code?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminDonationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private authHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getDonations(): Observable<AdminDonationsListResponse> {
    return this.http.get<AdminDonationsListResponse>(`${this.baseUrl}/admin/donations`, {
      headers: this.authHeaders(),
    });
  }

  createDonation(payload: AdminDonationPayload): Observable<AdminDonationMutationResponse> {
    return this.http.post<AdminDonationMutationResponse>(
      `${this.baseUrl}/admin/donations`,
      payload,
      { headers: this.authHeaders() }
    );
  }

  updateDonation(
    id: number,
    payload: AdminDonationPayload
  ): Observable<AdminDonationMutationResponse> {
    return this.http.put<AdminDonationMutationResponse>(
      `${this.baseUrl}/admin/donations/${id}`,
      payload,
      { headers: this.authHeaders() }
    );
  }

  deleteDonation(id: number): Observable<AdminDonationMutationResponse> {
    const headers = this.authHeaders().set('X-HTTP-Method-Override', 'DELETE');
    return this.http.post<AdminDonationMutationResponse>(
      `${this.baseUrl}/admin/donations/${id}`,
      null,
      { headers }
    );
  }
}
