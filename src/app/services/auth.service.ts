import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LoginPayload, LoginResponse, refreshTokenResponse, RegisterPayload, RegisterResponse, UserProfile } from '../models/interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'https://backend-tracker-mauve.vercel.app/api/auth';
  //private baseUrl = 'http://localhost:5000/api/auth';
  private accessTokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';

  http= inject(HttpClient);
  router= inject(Router);

  register(user: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, user);
  }

  login(credentials: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
  }

  refreshToken(): Observable<refreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.error('No refresh token available. Logging out.');
      this.logout();
      throw new Error('No refresh token available');
    }
  
    return this.http.post<refreshTokenResponse>(`${this.baseUrl}/refresh-token`, { refreshToken }).pipe(
      tap((response: refreshTokenResponse) => {
        if (response.accessToken && response.refreshToken) {
          this.saveTokens(response.accessToken, response.refreshToken);
        } else {
          console.error('Refresh token response does not contain tokens');
          this.logout();
        }
      }),
      catchError((error) => {
        console.error('Failed to refresh token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getUserProfile(): Observable<UserProfile> {
      return this.http.get<UserProfile>(`${this.baseUrl}/profile`);
  }

  updateProfile(data: { name: string; email: string; avatar?: string }): Observable<{ message: string; user: UserProfile; emailChangeRequested?: boolean }> {
    return this.http.patch<{ message: string; user: UserProfile; emailChangeRequested?: boolean }>(`${this.baseUrl}/profile`, data);
  }

  requestPasswordChangeCode(data: { currentPassword: string; newPassword: string }): Observable<{ message: string; codeDelivery?: 'email' | 'log' }> {
    return this.http.post<{ message: string; codeDelivery?: 'email' | 'log' }>(`${this.baseUrl}/change-password/request-code`, data);
  }

  confirmPasswordChange(code: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/change-password/confirm`, { code });
  }

  resendVerificationEmail(): Observable<{ message: string; verificationDelivery?: 'email' | 'log' }> {
    return this.http.post<{ message: string; verificationDelivery?: 'email' | 'log' }>(`${this.baseUrl}/verify-email/resend`, {});
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/verify-email`, { params: { token } });
  }

  forgotPassword(email: string): Observable<{ message: string; resetDelivery?: 'email' | 'log' }> {
    return this.http.post<{ message: string; resetDelivery?: 'email' | 'log' }>(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/reset-password`, { token, newPassword });
  }

  confirmEmailChange(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/confirm-email-change`, { params: { token } });
  }

  cancelEmailChange(): Observable<{ message: string; user: UserProfile }> {
    return this.http.delete<{ message: string; user: UserProfile }>(`${this.baseUrl}/change-email/cancel`);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.router.navigate(['/login']);
  }
}
