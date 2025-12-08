// src/app/admin/pages/gestionar-viajes/gestionar-viajes.component.ts
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Viaje } from '../../../core/models/viaje.model';
import { ViajeService } from '../../../core/services/viaje.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gestionar-viajes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestionar-viajes.component.html',
  styleUrls: ['./gestionar-viajes.component.scss']
})
export class GestionarViajesComponent implements OnInit {

  private fb = inject(FormBuilder);
  private viajeService = inject(ViajeService);

  viajes: Viaje[] = [];

  // mínima fecha permitida en el input (hoy)
  minFechaSalida: string = '';

  form: FormGroup = this.fb.group(
    {
      origen: ['', [Validators.required, Validators.minLength(3)]],
      destino: ['', [Validators.required, Validators.minLength(3)]],
      fechaSalida: ['', [Validators.required]],
      fechaLlegada: ['', [Validators.required]],
      precio: [0, [Validators.required, Validators.min(1)]],
      asientosDisponibles: [0, [Validators.required, Validators.min(1)]],
      estado: ['PROGRAMADO', [Validators.required]]
    },
    { validators: [GestionarViajesComponent.validarRangoFechas] }
  );

  loading = false;
  errorMsg = '';
  successMsg = '';

  private viajeEditandoId?: number;
  editando = false;

  // ============= CICLO DE VIDA =============
  ngOnInit(): void {
    this.minFechaSalida = new Date().toISOString().slice(0, 16);
    this.cargarViajes();
  }

  // ============= VALIDACIÓN DE FECHAS =============
  private static validarRangoFechas(group: AbstractControl): ValidationErrors | null {
    const salida = group.get('fechaSalida')?.value;
    const llegada = group.get('fechaLlegada')?.value;

    if (!salida || !llegada) return null;

    const dSalida = new Date(salida);
    const dLlegada = new Date(llegada);

    if (dLlegada <= dSalida) {
      return { rangoFechasInvalido: true };
    }
    return null;
  }

  get f() {
    return this.form.controls;
  }

  // ============= CARGAR LISTA DE VIAJES =============
  cargarViajes(): void {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.viajeService.obtenerTodos().subscribe({
      next: (data: Viaje[]) => {
        this.viajes = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando viajes', err);
        this.errorMsg = 'No se pudo cargar la lista de viajes.';
        this.loading = false;
      }
    });
  }

  // ============= NUEVO VIAJE =============
  nuevoViaje(): void {
    this.editando = false;
    this.viajeEditandoId = undefined;
    this.form.reset({
      origen: '',
      destino: '',
      fechaSalida: '',
      fechaLlegada: '',
      precio: 0,
      asientosDisponibles: 0,
      estado: 'PROGRAMADO'
    });
    this.errorMsg = '';
    this.successMsg = '';
  }

  // ============= EDITAR VIAJE =============
  editarViaje(v: Viaje): void {
    this.editando = true;
    this.viajeEditandoId = v.id;

    this.form.patchValue({
      origen: v.origen,
      destino: v.destino,
      // del backend viene con segundos → para el input cortamos a YYYY-MM-DDTHH:mm
      fechaSalida: v.fechaSalida?.slice(0, 16),
      fechaLlegada: v.fechaLlegada?.slice(0, 16),
      precio: v.precio,
      asientosDisponibles: v.asientosDisponibles,
      estado: v.estado
    });

    this.errorMsg = '';
    this.successMsg = '';
  }

  // ============= ELIMINAR VIAJE =============
  eliminarViaje(v: Viaje): void {
    if (!v.id) return;

    if (!confirm(`¿Eliminar el viaje ${v.origen} → ${v.destino}?`)) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.viajeService.eliminar(v.id).subscribe({
      next: () => {
        this.successMsg = 'Viaje eliminado correctamente.';
        this.loading = false;
        this.cargarViajes();
      },
      error: (err: any) => {
        console.error('Error eliminando viaje', err);
        this.errorMsg = 'No se pudo eliminar el viaje.';
        this.loading = false;
      }
    });
  }

  // ============= GUARDAR VIAJE (CREAR / EDITAR) =============
  guardarViaje(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const raw = this.form.value;

    // 🔧 Aseguramos formato con segundos para el backend (LocalDateTime)
    const salida: string = raw.fechaSalida;
    const llegada: string = raw.fechaLlegada;

    const fechaSalidaIso =
      salida && salida.length === 16 ? `${salida}:00` : salida;

    const fechaLlegadaIso =
      llegada && llegada.length === 16 ? `${llegada}:00` : llegada;

    const payload: Viaje = {
      origen: raw.origen,
      destino: raw.destino,
      fechaSalida: fechaSalidaIso,
      fechaLlegada: fechaLlegadaIso,
      precio: Number(raw.precio),
      asientosDisponibles: Number(raw.asientosDisponibles),
      estado: raw.estado
    };

    let peticion$: Observable<Viaje>;

    if (this.editando && this.viajeEditandoId != null) {
      peticion$ = this.viajeService.actualizar(this.viajeEditandoId, payload);
    } else {
      peticion$ = this.viajeService.crear(payload);
    }

    peticion$.subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = this.editando
          ? 'Viaje actualizado correctamente.'
          : 'Viaje creado correctamente.';
        this.nuevoViaje();
        this.cargarViajes();
      },
      error: (err: any) => {
        console.error('Error guardando viaje', err);
        this.loading = false;
        this.errorMsg =
          'No se pudo guardar el viaje. Revisa los datos e inténtalo de nuevo.';
      }
    });
  }
}
