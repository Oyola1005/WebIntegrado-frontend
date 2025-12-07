// src/app/core/services/pasajero.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pasajero } from '../models/pasajero.model';

@Injectable({
  providedIn: 'root'
})
export class PasajeroService {

  private apiUrl = 'http://localhost:8080/api/pasajeros';

  constructor(private http: HttpClient) {}

  /** Obtiene los datos del pasajero asociado al usuario logueado */
  getPerfilActual(): Observable<Pasajero> {
    // Debe existir en el backend un endpoint GET /api/pasajeros/me
    return this.http.get<Pasajero>(`${this.apiUrl}/me`);
  }

  /** Actualiza el perfil del pasajero */
  actualizarPerfil(pasajero: Pasajero): Observable<Pasajero> {
    return this.http.put<Pasajero>(`${this.apiUrl}/${pasajero.id}`, pasajero);
  }
}
