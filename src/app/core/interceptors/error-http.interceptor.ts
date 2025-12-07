// src/app/core/interceptors/error-http.interceptor.ts
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Error HTTP global:', error);

      // Si el backend responde 401 => token inválido / sesión caducada
      if (error.status === 401) {
        // limpiamos sesión
        authService.logout();
        // redirigimos al login
        router.navigate(['/auth']);
      }

      // Puedes manejar otros códigos si quieres:
      // if (error.status === 403) { ... }
      // if (error.status >= 500) { ... }

      // re-lanzamos el error para que el componente lo vea si lo necesita
      return throwError(() => error);
    })
  );
};
