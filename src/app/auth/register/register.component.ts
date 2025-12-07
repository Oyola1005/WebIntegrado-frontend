import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    nombres: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  loading = false;
  errorMessage = '';

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.form.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    const payload: RegisterRequest = {
      nombres: this.form.value.nombres,
      apellidos: this.form.value.apellidos,
      dni: this.form.value.dni,
      telefono: this.form.value.telefono,
      email: this.form.value.email,
      password: this.form.value.password
    };

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading = false;

        // Después de registrarse ya está logueado
        if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/cliente']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en registro:', err);

        // ⬇⬇ Mostrar el mensaje real del backend si viene
        const backendMsg =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo completar el registro. Intenta con otro correo o revisa los datos.';

        this.errorMessage = backendMsg;
      }
    });
  }
}
