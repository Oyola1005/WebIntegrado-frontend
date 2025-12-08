// src/app/core/services/boleto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CompraBoletoRequest } from '../models/compra-boleto.model';
import { Boleto } from '../models/boleto.model';

@Injectable({
  providedIn: 'root'
})
export class BoletoService {

  private apiUrl = 'http://localhost:8080/api/boletos';

  constructor(private http: HttpClient) {}

  /** CLIENTE: comprar boleto */
  comprar(req: CompraBoletoRequest): Observable<Boleto | null> {
    const token = localStorage.getItem('token');
    if (!token) return of(null);
    return this.http.post<Boleto>(`${this.apiUrl}/comprar`, req);
  }

  /** CLIENTE: obtener boletos del usuario */
  obtenerMisBoletos(): Observable<Boleto[]> {
    const token = localStorage.getItem('token');
    if (!token) return of([]); // evita error al entrar al login
    return this.http.get<Boleto[]>(`${this.apiUrl}/mis-boletos`);
  }

  /** ADMIN */
  obtenerTodos(): Observable<Boleto[]> {
    return this.http.get<Boleto[]>(this.apiUrl);
  }

  cancelar(id: number): Observable<Boleto> {
    return this.http.put<Boleto>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  /** 🔹 NUEVO: lista de asientos ocupados de un viaje */
  getAsientosOcupados(viajeId: number): Observable<number[]> {
    const token = localStorage.getItem('token');
    if (!token) return of([]);
    return this.http.get<number[]>(`${this.apiUrl}/ocupados/${viajeId}`);
  }
}
