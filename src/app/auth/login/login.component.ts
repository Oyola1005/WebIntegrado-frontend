// src/app/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    // Tu HTML usa formControlName="username"
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

    // <-- IMPORTANTE: mapear username -> email para el backend
    const payload = {
      email: username,
      password: password
    };

    console.log('Enviando al backend:', payload);

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('Login OK:', res);

        // Después de login correcto → ir a una pantalla protegida
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en login:', err);
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }
}
