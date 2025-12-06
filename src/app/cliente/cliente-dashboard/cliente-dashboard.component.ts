import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],   // 👈 NECESARIO PARA QUE FUNCIONE <router-outlet>
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.scss']
})
export class ClienteDashboardComponent {

  userName = localStorage.getItem('nombreMostrado') || 'Cliente';

}
