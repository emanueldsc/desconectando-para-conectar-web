import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface GeneralDashboardCard {
  title: string;
  icon: string;
  value: string;
  subtitle: string;
  accent: 'green' | 'orange';
  trendIcon?: string;
  progress?: number;
  target?: string;
}

export interface AdminGeneralOverviewMetrics {
  totalDonationsCurrentMonth: number;
  totalRafflePointsCurrentMonth: number;
  totalRaisedCurrentMonth: number;
  activeRaffles: number;
  finishedRaffles: number;
  usersTotal: number;
  membersTotal: number;
  monthlyTarget: number;
  goalProgress: number;
  historyLastSixMonths: AdminGeneralMonthlyHistoryItem[];
}

export interface AdminGeneralMonthlyHistoryItem {
  month: string;
  label: string;
  donations: number;
  raffles: number;
  total: number;
  totalFormatted: string;
}

export interface AdminGeneralOverviewResponse {
  success: boolean;
  data: {
    metrics: AdminGeneralOverviewMetrics;
    cards: GeneralDashboardCard[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminGeneralApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  public getOverview(): Observable<AdminGeneralOverviewResponse> {
    const token = this.readAuthToken();

    if (!token) {
      return throwError(() => new Error('Sessao expirada. Faca login novamente.'));
    }

    return this.http.get<AdminGeneralOverviewResponse>(`${this.baseUrl}/admin/overview`, {
      headers: this.authorizationHeaders(token),
    });
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
