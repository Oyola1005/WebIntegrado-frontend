// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Guards
import { authGuard } from './auth/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

// Dashboards
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { ClienteDashboardComponent } from './cliente/cliente-dashboard/cliente-dashboard.component';

// Páginas ADMIN
import { GestionarViajesComponent } from './admin/pages/gestionar-viajes/gestionar-viajes.component';
import { GestionarBoletosComponent } from './admin/pages/gestionar-boletos/gestionar-boletos.component';
import { GestionarPasajerosComponent } from './admin/pages/gestionar-pasajeros/gestionar-pasajeros.component';

// Páginas CLIENTE
import { BuscarViajesComponent } from './cliente/pages/buscar-viajes/buscar-viajes.component';
import { MisBoletosComponent } from './cliente/pages/mis-boletos/mis-boletos.component';
import { PerfilPasajeroComponent } from './cliente/pages/perfil-pasajero/perfil-pasajero.component';

export const routes: Routes = [
  // AUTH
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then(m => m.AuthModule)
  },

  // ADMIN
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'viajes', pathMatch: 'full' },
      { path: 'viajes', component: GestionarViajesComponent },
      { path: 'boletos', component: GestionarBoletosComponent },
      { path: 'pasajeros', component: GestionarPasajerosComponent }
    ]
  },

  // CLIENTE
  {
    path: 'cliente',
    component: ClienteDashboardComponent,
    canActivate: [authGuard, RoleGuard],
    data: { role: 'CLIENTE' },
    children: [
      { path: '', redirectTo: 'buscar', pathMatch: 'full' },
      { path: 'buscar', component: BuscarViajesComponent },
      { path: 'mis-boletos', component: MisBoletosComponent },
      { path: 'perfil', component: PerfilPasajeroComponent }
    ]
  },

  // DEFAULT
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' }
];
