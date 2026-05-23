import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    RaffleDetailResponse,
    RaffleListQuery,
    RaffleListResponse,
    ReserveRaffleNumberRequest,
    ReserveRaffleNumberResponse,
    UploadRaffleReceiptResponse,
} from '../models/api-contracts.models';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class PublicRaffleApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  public getRaffleList(query: RaffleListQuery = {}): Observable<RaffleListResponse> {
    const params = this.buildQueryParams(query);
    return this.http.get<RaffleListResponse>(`${this.baseUrl}/public/raffles`, { params });
  }

  public getRaffleByIdOrSlug(idOrSlug: number | string): Observable<RaffleDetailResponse> {
    return this.http.get<RaffleDetailResponse>(`${this.baseUrl}/public/raffles/${idOrSlug}`);
  }

  public reserveNumber(
    raffleId: number,
    number: number,
    payload: ReserveRaffleNumberRequest
  ): Observable<ReserveRaffleNumberResponse> {
    return this.http.post<ReserveRaffleNumberResponse>(
      `${this.baseUrl}/public/raffles/${raffleId}/numbers/${number}/reserve`,
      payload
    );
  }

  public uploadReservationReceipt(
    raffleId: number,
    number: number,
    reservationCode: string,
    receiptFile: File,
  ): Observable<UploadRaffleReceiptResponse> {
    const formData = new FormData();
    formData.append('reservationCode', reservationCode);
    formData.append('receipt', receiptFile);

    return this.http.post<UploadRaffleReceiptResponse>(
      `${this.baseUrl}/public/raffles/${raffleId}/numbers/${number}/receipt`,
      formData,
    );
  }

  private buildQueryParams(query: RaffleListQuery): HttpParams {
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
