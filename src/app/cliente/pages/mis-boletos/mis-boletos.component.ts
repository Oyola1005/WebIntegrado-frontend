// src/app/cliente/pages/mis-boletos/mis-boletos.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoletoService } from '../../../core/services/boleto.service';
import { Boleto } from '../../../core/models/boleto.model';

@Component({
  selector: 'app-mis-boletos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-boletos.component.html',
  styleUrls: ['./mis-boletos.component.scss']
})
export class MisBoletosComponent implements OnInit {

  private boletoService = inject(BoletoService);

  boletos: Boleto[] = [];
  loading = false;
  errorMsg = '';

  ngOnInit(): void {
    this.cargarMisBoletos();
  }

  cargarMisBoletos(): void {
    this.loading = true;
    this.errorMsg = '';

    this.boletoService.obtenerMisBoletos().subscribe({
      next: (data) => {
        this.boletos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar boletos:', err);
        this.errorMsg = 'No se pudieron cargar tus boletos. Inténtalo más tarde.';
        this.loading = false;
      }
    });
  }
}
