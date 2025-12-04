// src/app/dashboard/dashboard.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="p-4">
      <h2>Panel principal</h2>
      <p>Login exitoso. Aquí irán tus pantallas protegidas (viajes, boletos, etc.).</p>
    </div>
  `
})
export class DashboardComponent {}