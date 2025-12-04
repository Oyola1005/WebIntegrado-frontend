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
      email: username,    // backend usa "email"
      password: password  // backend usa "password"
    };

    console.log('Enviando al backend:', payload);

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(payload).subscribe({
      next: (res) => {
        console.log('Login OK:', res);
        this.loading = false;

        // Redirección según el rol del usuario
        if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (res.rol === 'CLIENTE') {
          this.router.navigate(['/cliente']);
        } else {
          // fallback improbable
          this.router.navigate(['/auth']);
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.loading = false;
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }
}
