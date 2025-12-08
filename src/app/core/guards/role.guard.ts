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
    const userRole = this.authService.getRole();  // 👈 ahora leemos del AuthService

    // Sin rol → sesión inválida, mandamos al login
    if (!userRole) {
      return this.router.parseUrl('/auth');
    }

    // Rol correcto → deja pasar
    if (userRole === requiredRole) {
      return true;
    }

    // Rol distinto → redirección “inteligente”
    if (userRole === 'ADMIN') {
      return this.router.parseUrl('/admin');
    }

    if (userRole === 'CLIENTE') {
      return this.router.parseUrl('/cliente');
    }

    // Cualquier otro caso raro
    return this.router.parseUrl('/auth');
  }
}
