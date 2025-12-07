import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
    dni: [{ value: '', disabled: true }],       // solo lectura
    email: [{ value: '', disabled: true }],     // solo lectura
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]]
  });

  loading = false;
  successMessage = '';
  errorMessage = '';
  pasajeroActual: Pasajero | null = null;

  ngOnInit(): void {
    this.cargarPerfil();
  }

  private cargarPerfil(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.pasajeroService.getPerfilActual().subscribe({
      next: (data: Pasajero) => {
        this.pasajeroActual = data;

        this.form.patchValue({
          nombres: data.nombres,
          apellidos: data.apellidos,
          dni: data.dni,
          email: data.email,
          telefono: data.telefono
        });

        this.loading = false;
      },
      error: (err: any) => {
        console.error('No se pudo cargar el perfil', err);
        this.loading = false;
        this.errorMessage = 'No se pudo cargar tu perfil. Intenta nuevamente más tarde.';
      }
    });
  }

  guardarCambios(): void {
    if (this.form.invalid || !this.pasajeroActual) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue(); // incluye campos disabled

    // Solo enviamos lo que el backend espera en PUT /me
    const payload: ActualizarPerfilRequest = {
      nombres: raw.nombres,
      apellidos: raw.apellidos,
      telefono: raw.telefono
    };

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.pasajeroService.actualizarPerfil(payload).subscribe({
      next: (updated: Pasajero) => {
        this.loading = false;
        this.successMessage = 'Tus datos se actualizaron correctamente.';
        this.pasajeroActual = updated;

        // Actualizamos el formulario con la respuesta real del backend
        this.form.patchValue({
          nombres: updated.nombres,
          apellidos: updated.apellidos,
          dni: updated.dni,
          email: updated.email,
          telefono: updated.telefono
        });
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