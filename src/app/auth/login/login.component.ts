// src/app/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';   // 👈 IMPORTANTE para *ngIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,          // 👈 aquí habilitamos *ngIf, *ngFor, etc.
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;
  errorMessage = '';

  constructor() {}

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.value;

    const payload = {
      email: username,
      password: password
    };

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.loading = false;

        // Navegación por rol
        if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/cliente']);
        }
      },
      error: (err) => {
        this.loading = false;

        console.error('Error en login:', err); // 👈 para ver en consola

        const backendMsg =
          err?.error?.message ||
          err?.error?.error ||
          'Usuario o contraseña incorrectos';

        this.errorMessage = backendMsg;
      }
    });
  }
}
