// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {

    const requiredRole = route.data['role'] as string;
    const userRole = localStorage.getItem('rol');

    // Si NO hay rol → no está logueado correctamente
    if (!userRole) {
      return this.router.parseUrl('/auth');
    }

    // Si el rol coincide, deja pasar
    if (userRole === requiredRole) {
      return true;
    }

    // Si el rol no coincide → redirección inteligente
    if (userRole === 'ADMIN') {
      return this.router.parseUrl('/admin');
    } else if (userRole === 'CLIENTE') {
      return this.router.parseUrl('/cliente');
    }

    // Cualquier otro caso extraño
    return this.router.parseUrl('/auth');
  }
}
