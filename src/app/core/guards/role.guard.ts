// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredRole = route.data['role'] as string;

    const token = this.authService.getToken();
    const userRole = this.authService.getRole();

    // ⛔ Sin token o token inválido → al login
    if (!token || !this.authService.isTokenValid(token)) {
      this.authService.logout();
      return this.router.parseUrl('/auth');
    }

    // ⛔ Sin rol guardado → sesión inválida
    if (!userRole) {
      this.authService.logout();
      return this.router.parseUrl('/auth');
    }

    // ✅ Rol correcto
    if (userRole === requiredRole) {
      return true;
    }

    // 🔁 Rol distinto → redirección “inteligente”
    if (userRole === 'ADMIN') {
      return this.router.parseUrl('/admin');
    }

    if (userRole === 'CLIENTE') {
      return this.router.parseUrl('/cliente');
    }

    // Caso raro → al login
    this.authService.logout();
    return this.router.parseUrl('/auth');
  }
}
