import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import {
    CreateRafflePayload,
    DrawRafflePayload,
    DrawRaffleResult,
    MarkNumberAsSoldPayload,
    RaffleCampaign,
} from '../../features/dashboard/raffle/raffle.models';
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

interface AdminRaffleMutationResponse {
  success: boolean;
  message: string;
  data: RaffleCampaign;
}

interface AdminRaffleDeleteResponse {
  success: boolean;
  message: string;
}

interface AdminRaffleImageUploadResponse {
  success: boolean;
  message: string;
  url: string;
}

interface ConfirmReservedNumberPayload {
  reservationCode?: string;
}

interface UpdateReservationTimeoutPayload {
  reservationTimeoutMinutes: number;
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
        map((response) => {
          const extractionNumber = response.data.extractionNumber;

          if (!Number.isFinite(extractionNumber) || Number(extractionNumber) < 1) {
            throw new Error('Numero de extracao invalido retornado pelo backend.');
          }

          return {
            winnerName: response.data.winnerName,
            winnerNumber: response.data.winnerNumber ?? payload.winnerNumber,
            extractionNumber: Number(extractionNumber),
            processedAt: new Date().toISOString(),
          };
        })
      );
  }

  public createRaffle(payload: CreateRafflePayload): Observable<RaffleCampaign> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http
      .post<AdminRaffleMutationResponse>(`${this.baseUrl}/admin/raffles`, payload, {
        headers: this.authorizationHeaders(token),
      })
      .pipe(map((response) => response.data));
  }

  public updateRaffle(raffleId: number, payload: CreateRafflePayload): Observable<RaffleCampaign> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    const headers = this.authorizationHeaders(token).set('X-HTTP-Method-Override', 'PUT');

    return this.http
      .post<AdminRaffleMutationResponse>(`${this.baseUrl}/admin/raffles/${raffleId}`, payload, {
        headers,
      })
      .pipe(map((response) => response.data));
  }

  public deleteRaffle(raffleId: number): Observable<void> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    const headers = this.authorizationHeaders(token).set('X-HTTP-Method-Override', 'DELETE');

    return this.http
      .post<AdminRaffleDeleteResponse>(`${this.baseUrl}/admin/raffles/${raffleId}`, null, {
        headers,
      })
      .pipe(map(() => undefined));
  }

  public activateRaffle(raffleId: number): Observable<RaffleCampaign> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http
      .post<AdminRaffleMutationResponse>(`${this.baseUrl}/admin/raffles/${raffleId}/activate`, {}, {
        headers: this.authorizationHeaders(token),
      })
      .pipe(map((response) => response.data));
  }

  public uploadRaffleImage(file: File, previousUrl?: string): Observable<string> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    const formData = new FormData();
    formData.append('image', file);

    if (typeof previousUrl === 'string' && previousUrl.trim().length > 0) {
      formData.append('previous_url', previousUrl);
    }

    return this.http
      .post<AdminRaffleImageUploadResponse>(`${this.baseUrl}/admin/raffles/image`, formData, {
        headers: this.authorizationHeaders(token),
      })
      .pipe(map((response) => response.url));
  }

  public confirmReservedNumber(
    raffleId: number,
    number: number,
    payload: ConfirmReservedNumberPayload = {}
  ): Observable<RaffleCampaign> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http
      .post<AdminRaffleMutationResponse>(
        `${this.baseUrl}/admin/raffles/${raffleId}/numbers/${number}/confirm-payment`,
        payload,
        {
          headers: this.authorizationHeaders(token),
        }
      )
      .pipe(map((response) => response.data));
  }

  public markNumberAsSold(
    raffleId: number,
    number: number,
    payload: MarkNumberAsSoldPayload
  ): Observable<RaffleCampaign> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http
      .post<AdminRaffleMutationResponse>(
        `${this.baseUrl}/admin/raffles/${raffleId}/numbers/${number}/mark-sold`,
        payload,
        {
          headers: this.authorizationHeaders(token),
        }
      )
      .pipe(map((response) => response.data));
  }

  public updateReservationTimeout(
    raffleId: number,
    payload: UpdateReservationTimeoutPayload
  ): Observable<RaffleCampaign> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    const headers = this.authorizationHeaders(token).set('X-HTTP-Method-Override', 'PUT');

    return this.http
      .post<AdminRaffleMutationResponse>(`${this.baseUrl}/admin/raffles/${raffleId}/reservation-timeout`, payload, {
        headers,
      })
      .pipe(map((response) => response.data));
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