// src/app/auth/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (token) {
    // Usuario autenticado
    return true;
  }

  // No autenticado → enviar a login
  return router.parseUrl('/auth');
};