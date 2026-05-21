import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { DrawRafflePayload, DrawRaffleResult, RaffleCampaign } from '../../features/dashboard/raffle/raffle.models';
import { API_BASE_URL } from './api.config';

interface AdminRaffleListResponse {
  success: boolean;
  data: RaffleCampaign[];
}

interface AdminRaffleDrawResponse {
  success: boolean;
  message: string;
  data: RaffleCampaign;
}

@Injectable({
  providedIn: 'root',
})
export class AdminRaffleApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  public getRaffles(): Observable<RaffleCampaign[]> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http
      .get<AdminRaffleListResponse>(`${this.baseUrl}/admin/raffles`, {
        headers: this.authorizationHeaders(token),
      })
      .pipe(map((response) => response.data));
  }

  public drawRaffle(raffleId: number, payload: DrawRafflePayload): Observable<DrawRaffleResult> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http
      .post<AdminRaffleDrawResponse>(`${this.baseUrl}/admin/raffles/${raffleId}/draw`, payload, {
        headers: this.authorizationHeaders(token),
      })
      .pipe(
        map((response) => ({
          winnerName: response.data.winnerName ?? 'Resultado registrado manualmente',
          winnerNumber: response.data.winnerNumber ?? payload.winnerNumber,
          winnerSourceComment: response.data.winnerSourceComment,
          processedAt: new Date().toISOString(),
        }))
      );
  }

  private authorizationHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private readAuthToken(): string | null {
    return localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  }
}