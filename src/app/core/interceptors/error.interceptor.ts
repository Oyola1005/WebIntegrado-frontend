// src/app/core/interceptors/error.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Para debug en consola
      console.error('🔴 HTTP ERROR:', error);

      // Mensaje base
      let message = 'Ocurrió un error inesperado.';

      if (error.status === 0) {
        // No hay conexión con el backend
        message = 'No hay conexión con el servidor. Verifica tu red o que el backend esté encendido.';
      } else if (error.status === 400) {
        message = 'Solicitud inválida. Revisa los datos enviados.';
      } else if (error.status === 401) {
        // No autorizado → token inválido o vencido
        message = 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
        authService.logout();
        router.navigate(['/auth']);
      } else if (error.status === 403) {
        message = 'No tienes permisos para esta operación.';
      } else if (error.status >= 500) {
        message = 'Error en el servidor. Intenta más tarde.';
      }

      // Guardamos el mensaje en localStorage para que el componente pueda leerlo si quiere
      localStorage.setItem('lastHttpErrorMessage', message);

      // Re-lanzamos el error para que los componentes puedan manejarlo
      return throwError(() => error);
    })
  );
};
