// src/app/auth/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = authService.getToken();

  // ⛔ No hay token → fuera
  if (!token) {
    authService.logout();
    return router.createUrlTree(['/auth']);
  }

  // ⛔ Token inválido o expirado → limpiar sesión
  if (!authService.isTokenValid(token)) {
    authService.logout();
    return router.createUrlTree(['/auth']);
  }

  // Todo OK → puede pasar
  return true;
};