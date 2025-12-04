// src/app/admin/pages/gestionar-viajes/gestionar-viajes.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ViajeService } from '../../../core/services/viaje.service';
import { Viaje } from '../../../core/models/viaje.model';


@Component({
  selector: 'app-gestionar-viajes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestionar-viajes.component.html',
  styleUrls: ['./gestionar-viajes.component.scss']
})
export class GestionarViajesComponent implements OnInit {

  private viajeService = inject(ViajeService);
  private fb = inject(FormBuilder);

  viajes: Viaje[] = [];
  loading = false;
  errorMsg = '';

  // para crear/editar
  viajeForm: FormGroup = this.fb.group({
    id: [null],
    origen: ['', Validators.required],
    destino: ['', Validators.required],
    fechaSalida: ['', Validators.required],
    fechaLlegada: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    asientosDisponibles: [0, [Validators.required, Validators.min(1)]],
    estado: ['PROGRAMADO', Validators.required]
  });

  modoEdicion = false;

  ngOnInit(): void {
    this.cargarViajes();
  }

  cargarViajes(): void {
    this.loading = true;
    this.errorMsg = '';
    this.viajeService.obtenerTodos().subscribe({
      next: (data) => {
        this.viajes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Error al cargar los viajes.';
        this.loading = false;
      }
    });
  }

  nuevoViaje(): void {
    this.modoEdicion = false;
    this.viajeForm.reset({
      id: null,
      origen: '',
      destino: '',
      fechaSalida: '',
      fechaLlegada: '',
      precio: 0,
      asientosDisponibles: 1,
      estado: 'PROGRAMADO'
    });
  }

  editarViaje(viaje: Viaje): void {
    this.modoEdicion = true;
    this.viajeForm.patchValue({
      id: viaje.id,
      origen: viaje.origen,
      destino: viaje.destino,
      fechaSalida: viaje.fechaSalida?.slice(0, 16),   // para input datetime-local
      fechaLlegada: viaje.fechaLlegada?.slice(0, 16),
      precio: viaje.precio,
      asientosDisponibles: viaje.asientosDisponibles,
      estado: viaje.estado
    });
  }

  guardarViaje(): void {
    if (this.viajeForm.invalid) {
      this.viajeForm.markAllAsTouched();
      return;
    }

    const formValue = this.viajeForm.value;

    const payload: Viaje = {
      origen: formValue.origen,
      destino: formValue.destino,
      fechaSalida: formValue.fechaSalida,
      fechaLlegada: formValue.fechaLlegada,
      precio: formValue.precio,
      asientosDisponibles: formValue.asientosDisponibles,
      estado: formValue.estado,
      id: formValue.id
    };

    this.loading = true;
    this.errorMsg = '';

    // crear
    if (!this.modoEdicion || !payload.id) {
      this.viajeService.crear(payload).subscribe({
        next: () => {
          this.loading = false;
          this.nuevoViaje();
          this.cargarViajes();
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Error al crear el viaje.';
          this.loading = false;
        }
      });
    } else {
      // actualizar
      this.viajeService.actualizar(payload.id!, payload).subscribe({
        next: () => {
          this.loading = false;
          this.modoEdicion = false;
          this.nuevoViaje();
          this.cargarViajes();
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Error al actualizar el viaje.';
          this.loading = false;
        }
      });
    }
  }

  eliminarViaje(viaje: Viaje): void {
    if (!viaje.id) return;

    const confirmar = confirm(`¿Seguro que deseas eliminar el viaje ${viaje.origen} → ${viaje.destino}?`);
    if (!confirmar) return;

    this.loading = true;
    this.viajeService.eliminar(viaje.id).subscribe({
      next: () => {
        this.loading = false;
        this.cargarViajes();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Error al eliminar el viaje.';
        this.loading = false;
      }
    });
  }
}
