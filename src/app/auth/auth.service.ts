// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// ---- REQUESTS ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  password: string;
}

// ---- RESPUESTA DEL BACKEND ----
export interface AuthResponse {
  token: string;
  rol: 'ADMIN' | 'CLIENTE';
  nombreMostrado: string;   // 👈 Nuevo
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // ===========================
  // LOGIN
  // ===========================
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('nombreMostrado', res.nombreMostrado); // 👈 Aquí guardamos el nombre
      })
    );
  }

  // ===========================
  // REGISTRO
  // ===========================
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('nombreMostrado', res.nombreMostrado); // 👈 También después de registrar
      })
    );
  }

  // ===========================
  // LOGOUT
  // ===========================
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombreMostrado');
  }

  // ===========================
  // GETTERS
  // ===========================
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('rol');
  }

  getNombreMostrado(): string | null {
    return localStorage.getItem('nombreMostrado');
  }
}
