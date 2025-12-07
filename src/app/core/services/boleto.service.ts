// src/app/core/services/boleto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompraBoletoRequest } from '../models/compra-boleto.model';
import { Boleto } from '../models/boleto.model';

@Injectable({
  providedIn: 'root'
})
export class BoletoService {

  private apiUrl = 'http://localhost:8080/api/boletos';

  constructor(private http: HttpClient) {}

  // Comprar boleto para el usuario logueado
  comprar(req: CompraBoletoRequest): Observable<Boleto> {
    // El backend toma el pasajero desde el usuario logueado (JWT)
    return this.http.post<Boleto>(`${this.apiUrl}/comprar`, req);
  }

  // 👇 NUEVO: obtener los boletos del usuario logueado
  obtenerMisBoletos(): Observable<Boleto[]> {
    return this.http.get<Boleto[]>(`${this.apiUrl}/mis-boletos`);
  }
}