import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasajeroService } from '../../../core/services/pasajero.service';
import { Pasajero } from '../../../core/models/pasajero.model';

@Component({
  selector: 'app-gestionar-pasajeros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-pasajeros.component.html',
  styleUrls: ['./gestionar-pasajeros.component.scss']
})
export class GestionarPasajerosComponent implements OnInit {

  private pasajeroService = inject(PasajeroService);

  pasajeros: Pasajero[] = [];
  loading = false;
  errorMsg = '';

  filtro = '';

  ngOnInit(): void {
    this.cargarPasajeros();
  }

  cargarPasajeros(): void {
    this.loading = true;
    this.errorMsg = '';

    this.pasajeroService.obtenerTodos().subscribe({
      next: (data: Pasajero[]) => {
        this.pasajeros = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pasajeros', err);
        this.errorMsg = 'No se pudo cargar la lista de pasajeros.';
        this.loading = false;
      }
    });
  }

  eliminar(p: Pasajero): void {
    if (!p.id) return;
    if (!confirm(`¿Eliminar pasajero ${p.nombres} ${p.apellidos}?`)) return;

    this.loading = true;
    this.errorMsg = '';

    this.pasajeroService.eliminar(p.id).subscribe({
      next: () => this.cargarPasajeros(),
      error: (err) => {
        console.error('Error eliminando pasajero', err);
        this.errorMsg = 'No se pudo eliminar el pasajero.';
        this.loading = false;
      }
    });
  }

  get pasajerosFiltrados(): Pasajero[] {
    const term = this.filtro.trim().toLowerCase();
    if (!term) return this.pasajeros;

    return this.pasajeros.filter(p =>
      p.nombres.toLowerCase().includes(term) ||
      p.apellidos.toLowerCase().includes(term) ||
      p.dni.toLowerCase().includes(term)
    );
  }
}
