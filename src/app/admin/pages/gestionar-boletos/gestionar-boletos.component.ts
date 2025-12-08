import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoletoService } from '../../../core/services/boleto.service';
import { Boleto } from '../../../core/models/boleto.model';

@Component({
  selector: 'app-gestionar-boletos',
  standalone: true,
  imports: [CommonModule],   // 👈 Habilita *ngFor, *ngIf, date, number, ngClass, etc.
  templateUrl: './gestionar-boletos.component.html',
  styleUrls: ['./gestionar-boletos.component.scss']
})
export class GestionarBoletosComponent implements OnInit {

  private boletoService = inject(BoletoService);

  boletos: Boleto[] = [];
  loading = false;
  errorMsg = '';

  ngOnInit(): void {
    this.cargarBoletos();
  }

  cargarBoletos(): void {
    this.loading = true;
    this.errorMsg = '';

    this.boletoService.obtenerTodos().subscribe({
      next: (data: Boleto[]) => {
        this.boletos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando boletos', err);
        this.errorMsg = 'No se pudo cargar la lista de boletos.';
        this.loading = false;
      }
    });
  }

  cancelar(b: Boleto): void {
    if (!b.id) return;
    if (!confirm(`¿Cancelar el boleto #${b.id}?`)) return;

    this.loading = true;
    this.errorMsg = '';

    this.boletoService.cancelar(b.id).subscribe({
      next: () => this.cargarBoletos(),
      error: (err) => {
        console.error('Error cancelando boleto', err);
        this.errorMsg = 'No se pudo cancelar el boleto.';
        this.loading = false;
      }
    });
  }
}
