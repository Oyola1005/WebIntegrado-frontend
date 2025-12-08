// src/app/auth/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Si hay token -> usuario autenticado
  if (authService.isLoggedIn()) {
    return true;
  }

  // No autenticado → enviar a login
  return router.createUrlTree(['/auth']);
};