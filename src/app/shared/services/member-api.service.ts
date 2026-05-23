import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MemberProfile, MemberRaffle } from '../../features/auth/member-area/member-area.models';

export interface MemberDonation {
  id: number;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
}

@Injectable({ providedIn: 'root' })
export class MemberApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMemberRaffles(): Observable<MemberRaffle[]> {
    return this.http.get<{ success: boolean; data: MemberRaffle[] }>(`${this.baseUrl}/member/raffles`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      // Extrai apenas o array de rifas
      map((res) => res.data)
    );
  }

  getMemberProfile(): Observable<MemberProfile> {
    return this.http.get<{ success: boolean; data: MemberProfile }>(`${this.baseUrl}/member/profile`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map((res) => res.data)
    );
  }

  getMemberDonations(): Observable<MemberDonation[]> {
    return this.http.get<{ success: boolean; data: MemberDonation[] }>(`${this.baseUrl}/member/donations`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map((res) => res.data)
    );
  }
}
