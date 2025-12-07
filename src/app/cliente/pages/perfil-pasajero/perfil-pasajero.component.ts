import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasajeroService } from '../../../core/services/pasajero.service';
import { Pasajero } from '../../../core/models/pasajero.model';

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

  // 👇 Usamos el método que sí existe en el service: getPerfilActual()
  this.pasajeroService.getPerfilActual().subscribe({
    next: (data: Pasajero) => {
      this.pasajeroActual = data;

      // Rellenar formulario con los datos del pasajero
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

  const payload: Pasajero = {
    id: this.pasajeroActual.id,
    nombres: raw.nombres,
    apellidos: raw.apellidos,
    dni: raw.dni,
    email: raw.email,
    telefono: raw.telefono
  };

  this.loading = true;
  this.successMessage = '';
  this.errorMessage = '';

  // 👇 OJO: usamos actualizarPerfil (el que sí existe en el service)
  this.pasajeroService.actualizarPerfil(payload).subscribe({
    next: (updated: Pasajero) => {
      this.loading = false;
      this.successMessage = 'Tus datos se actualizaron correctamente.';
      this.pasajeroActual = updated;
      this.form.patchValue(updated);
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
