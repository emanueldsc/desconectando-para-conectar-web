import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    LoginRequest,
    LoginResponseType,
    LogoutResponse,
    RegisterInternalRequest,
    RegisterMemberRequest,
    RegisterResponseType,
    VerifyTokenResponse
} from '../models/api-contracts.models';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  public login(payload: LoginRequest): Observable<LoginResponseType> {
    return this.http.post<LoginResponseType>(`${this.baseUrl}/auth/login`, payload);
  }

  public registerMember(payload: RegisterMemberRequest): Observable<RegisterResponseType> {
    return this.http.post<RegisterResponseType>(`${this.baseUrl}/auth/register/member`, payload);
  }

  public registerInternal(payload: RegisterInternalRequest): Observable<RegisterResponseType> {
    return this.http.post<RegisterResponseType>(`${this.baseUrl}/auth/register/internal`, payload);
  }

  public verifyToken(token: string): Observable<VerifyTokenResponse> {
    return this.http.get<VerifyTokenResponse>(`${this.baseUrl}/auth/verify`, {
      headers: this.authorizationHeaders(token)
    });
  }

  public logout(token: string): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(
      `${this.baseUrl}/auth/logout`,
      {},
      { headers: this.authorizationHeaders(token) }
    );
  }

  private authorizationHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
