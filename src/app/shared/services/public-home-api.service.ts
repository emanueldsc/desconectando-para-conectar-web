import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HomePageResponse } from '../models/api-contracts.models';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class PublicHomeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  public getHome(): Observable<HomePageResponse> {
    return this.http.get<HomePageResponse>(`${this.baseUrl}/public/home`);
  }
}
