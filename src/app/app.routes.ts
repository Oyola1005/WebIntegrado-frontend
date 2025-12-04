// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then((m) => m.AuthModule),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Al iniciar la app → enviar al login
  { path: '', redirectTo: 'auth', pathMatch: 'full' },

  // Cualquier ruta desconocida
  { path: '**', redirectTo: 'auth' }
];