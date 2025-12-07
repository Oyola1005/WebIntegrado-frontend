// src/app/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  rol: string;           // "ADMIN" | "CLIENTE"
  nombreMostrado: string;
}

export interface RegisterRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';
  private storageKey = 'auth'; // lo que guardamos en localStorage

  // ============ LOGIN ============
  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  // ============ REGISTER ============
  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, req).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  // ============ MÉTODOS DE SESIÓN ============
  private saveAuth(res: AuthResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(res));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  private getAuthData(): AuthResponse | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.getAuthData()?.token ?? null;
  }

  getRole(): string | null {
    return this.getAuthData()?.rol ?? null;
  }

  getUserName(): string | null {
    return this.getAuthData()?.nombreMostrado ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
