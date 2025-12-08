// src/app/core/services/pasajero.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Pasajero } from '../models/pasajero.model';
import { ActualizarPerfilRequest } from '../models/actualizar-perfil-request.model';

@Injectable({
  providedIn: 'root'
})
export class PasajeroService {

  private apiUrl = 'http://localhost:8080/api/pasajeros';

  constructor(private http: HttpClient) {}

  /** CLIENTE: obtener perfil del usuario logueado
   *  👉 Si NO hay token, NO llama al backend.
   */
  getPerfilActual(): Observable<Pasajero | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null); // evita error 401 al cargar login
    }
    return this.http.get<Pasajero>(`${this.apiUrl}/me`);
  }

  /** CLIENTE: actualizar perfil */
  actualizarPerfil(req: ActualizarPerfilRequest): Observable<Pasajero | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null); // evita error si el usuario no está logueado
    }
    return this.http.put<Pasajero>(`${this.apiUrl}/me`, req);
  }

  /** ADMIN: listar pasajeros */
  obtenerTodos(): Observable<Pasajero[]> {
    return this.http.get<Pasajero[]>(this.apiUrl);
  }

  /** ADMIN: eliminar pasajero */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
