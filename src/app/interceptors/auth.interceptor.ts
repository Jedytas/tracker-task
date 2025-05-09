import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  // Не добавляем токен к запросам на /login и /register
  const skipAuth =
    req.url.includes('/login') || req.url.includes('/register') || req.method === 'OPTIONS';

  const authReq = skipAuth
    ? req
    : req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && authService.getRefreshToken() && !skipAuth) {
        return authService.refreshToken().pipe(
          switchMap((newTokens) => {
            const retryRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newTokens.accessToken}`
              }
            });
            return next(retryRequest);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
