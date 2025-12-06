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

  /**
   * El backend debe tener:
   * GET /api/pasajeros/perfil  -> usa el email del JWT (Authentication.getName())
   */
  getPerfilActual(): Observable<Pasajero> {
    return this.http.get<Pasajero>(`${this.apiUrl}/perfil`);
  }
}
