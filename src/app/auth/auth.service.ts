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

  // claves en localStorage
  private storageKey = 'auth';   // objeto completo { token, rol, nombreMostrado }
  private tokenKey   = 'token';  // solo el token en texto plano

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
    // guardamos el objeto completo
    localStorage.setItem(this.storageKey, JSON.stringify(res));
    // y también el token plano (para el interceptor)
    localStorage.setItem(this.tokenKey, res.token);
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
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
    // primero intentamos leer el token plano
    const direct = localStorage.getItem(this.tokenKey);
    if (direct) return direct;

    // fallback: leer desde el objeto auth
    return this.getAuthData()?.token ?? null;
  }

  getRole(): string | null {
    return this.getAuthData()?.rol ?? null;
  }

  getUserName(): string | null {
    return this.getAuthData()?.nombreMostrado ?? null;
  }

  // ======== Decodificar JWT sin librerías externas ========
  private decodeToken(token: string): any | null {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;

      // JWT usa base64url, convertimos a base64 normal
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  // ✅ Validar estructura + expiración del token
  isTokenValid(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const expirationMs = decoded.exp * 1000; // exp viene en segundos
    return expirationMs > Date.now();
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }
}