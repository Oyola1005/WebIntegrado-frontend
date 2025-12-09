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

  // 👉 mínima fecha permitida (fecha actual en formato YYYY-MM-DDTHH:mm)
  minFechaSalida: string = '';

  form: FormGroup = this.fb.group(
    {
      origen: ['', [Validators.required]],
      destino: ['', [Validators.required]],
      fechaSalida: ['', [Validators.required]],
      fechaLlegada: ['', [Validators.required]],
      precio: [0, [Validators.required, Validators.min(1)]],
      asientosDisponibles: [0, [Validators.required, Validators.min(1)]],
      estado: ['PROGRAMADO', [Validators.required]]
    },
    {
      validators: [GestionarViajesComponent.validarRangoFechas]
    }
  );

  loading = false;
  errorMsg = '';
  successMsg = '';

  private viajeEditandoId?: number;
  editando = false;

  ngOnInit(): void {
    // 🚫 No permitir fechas en el pasado
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.minFechaSalida = now.toISOString().slice(0, 16);

    this.cargarViajes();
  }

  // ============= VALIDACIÓN DE FECHAS =============
  private static validarRangoFechas(group: AbstractControl): ValidationErrors | null {
    const fg = group as FormGroup;

    const ctrlSalida = fg.get('fechaSalida');
    const ctrlLlegada = fg.get('fechaLlegada');
    if (!ctrlSalida || !ctrlLlegada) return null;

    const vSalida = ctrlSalida.value;
    const vLlegada = ctrlLlegada.value;

    // Si falta alguna, limpiamos error en llegada y no marcamos nada
    if (!vSalida || !vLlegada) {
      GestionarViajesComponent.limpiarErrorLlegada(ctrlLlegada);
      return null;
    }

    const dSalida = new Date(vSalida);
    const dLlegada = new Date(vLlegada);

    if (isNaN(dSalida.getTime()) || isNaN(dLlegada.getTime())) {
      GestionarViajesComponent.limpiarErrorLlegada(ctrlLlegada);
      return null;
    }

    // ❌ Llegada <= salida → error
    if (dLlegada <= dSalida) {
      const errores = ctrlLlegada.errors || {};
      errores['rangoFechasInvalido'] = true;
      ctrlLlegada.setErrors(errores);
      return { rangoFechasInvalido: true };
    }

    // ✅ Si ahora es correcto, limpiamos solo ese error
    GestionarViajesComponent.limpiarErrorLlegada(ctrlLlegada);
    return null;
  }

  private static limpiarErrorLlegada(ctrlLlegada: AbstractControl): void {
    if (!ctrlLlegada.errors || !ctrlLlegada.errors['rangoFechasInvalido']) return;

    const { rangoFechasInvalido, ...resto } = ctrlLlegada.errors;
    const tieneOtros = Object.keys(resto).length > 0;
    ctrlLlegada.setErrors(tieneOtros ? resto : null);
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
        console.error(err);
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
        console.error(err);
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

    const payload: Viaje = {
      origen: raw.origen,
      destino: raw.destino,
      fechaSalida: raw.fechaSalida,
      fechaLlegada: raw.fechaLlegada,
      precio: raw.precio,
      asientosDisponibles: raw.asientosDisponibles,
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
        this.errorMsg = 'No se pudo guardar el viaje. Revisa los datos e inténtalo de nuevo.';
      }
    });
  }
}
