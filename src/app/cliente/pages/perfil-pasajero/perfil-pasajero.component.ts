import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { PasajeroService } from '../../../core/services/pasajero.service';
import { Pasajero } from '../../../core/models/pasajero.model';
import { ActualizarPerfilRequest } from '../../../core/models/actualizar-perfil-request.model';

@Component({
  selector: 'app-perfil-pasajero',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-pasajero.component.html',
  styleUrls: ['./perfil-pasajero.component.scss']
})
export class PerfilPasajeroComponent implements OnInit {

  private fb = inject(FormBuilder);
  private pasajeroService = inject(PasajeroService);

  form: FormGroup = this.fb.group({
    nombres: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    dni: [{ value: '', disabled: true }],      // solo lectura siempre
    email: [{ value: '', disabled: true }],    // solo lectura siempre
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]]
  });

  loading = false;          // para carga inicial y guardado
  successMessage = '';
  errorMessage = '';
  pasajeroActual: Pasajero | null = null;

  /** modo edición / solo lectura */
  editMode = false;

  /** para restaurar valores al cancelar */
  private originalData: any = null;

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.cargarPerfil();
    }
  }

  // ====== CARGAR PERFIL ======
  private cargarPerfil(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.pasajeroService.getPerfilActual().subscribe({
      next: (data) => {
        if (!data) {
          this.loading = false;
          return;
        }

        this.pasajeroActual = data;

        this.form.patchValue({
          nombres: data.nombres,
          apellidos: data.apellidos,
          dni: data.dni,
          email: data.email,
          telefono: data.telefono
        });

        // por defecto: solo lectura
        this.form.disable();
        this.form.get('dni')?.disable();
        this.form.get('email')?.disable();

        this.originalData = this.form.getRawValue();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('No se pudo cargar el perfil', err);
        this.loading = false;
        this.errorMessage = 'No se pudo cargar tu perfil. Intenta nuevamente más tarde.';
      }
    });
  }

  // ====== ACTIVAR EDICIÓN ======
  activarEdicion(): void {
    if (!this.pasajeroActual) return;

    this.editMode = true;
    this.successMessage = '';
    this.errorMessage = '';

    // habilitamos todo…
    this.form.enable();
    // …pero mantenemos bloqueados dni y email
    this.form.get('dni')?.disable();
    this.form.get('email')?.disable();
  }

  // ====== CANCELAR EDICIÓN ======
  cancelarEdicion(): void {
    this.editMode = false;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.originalData) {
      this.form.reset(this.originalData);
    }

    this.form.disable();
    this.form.get('dni')?.disable();
    this.form.get('email')?.disable();
  }

  // ====== GUARDAR CAMBIOS ======
  guardarCambios(): void {
    if (this.form.invalid || !this.pasajeroActual) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: ActualizarPerfilRequest = {
      nombres: raw.nombres,
      apellidos: raw.apellidos,
      telefono: raw.telefono
    };

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.pasajeroService.actualizarPerfil(payload).subscribe({
      next: (updated) => {
        if (!updated) {
          this.loading = false;
          this.errorMessage = 'No se pudo actualizar tu perfil. Vuelve a iniciar sesión.';
          return;
        }

        this.pasajeroActual = updated;

        this.form.patchValue({
          nombres: updated.nombres,
          apellidos: updated.apellidos,
          dni: updated.dni,
          email: updated.email,
          telefono: updated.telefono
        });

        this.originalData = this.form.getRawValue();
        this.loading = false;
        this.successMessage = 'Tus datos se actualizaron correctamente.';

        // volvemos a modo solo lectura
        this.editMode = false;
        this.form.disable();
        this.form.get('dni')?.disable();
        this.form.get('email')?.disable();
      },
      error: (err: any) => {
        console.error('Error al actualizar perfil', err);
        this.loading = false;
        this.errorMessage =
          'No se pudieron guardar los cambios. Revisa los datos e inténtalo de nuevo.';
      }
    });
  }
}
