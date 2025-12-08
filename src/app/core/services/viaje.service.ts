import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viaje } from '../models/viaje.model';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {

  private apiUrl = 'http://localhost:8080/api/viajes';

  constructor(private http: HttpClient) {}

  /** Listar todos los viajes (alias usado por el admin) */
  listar(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(this.apiUrl);
  }

  /** Versión anterior, la puedes seguir usando si quieres */
  obtenerTodos(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(this.apiUrl);
  }

  crear(viaje: Viaje): Observable<Viaje> {
    return this.http.post<Viaje>(this.apiUrl, viaje);
  }

  actualizar(id: number, viaje: Viaje): Observable<Viaje> {
    return this.http.put<Viaje>(`${this.apiUrl}/${id}`, viaje);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 👉 búsqueda que usa el módulo cliente
  buscarPorRuta(origen: string, destino: string, fechaIda?: string): Observable<Viaje[]> {
    const params: any = { origen, destino };
    if (fechaIda) {
      params.fechaIda = fechaIda;  // debe coincidir con el nombre del backend
    }
    return this.http.get<Viaje[]>(`${this.apiUrl}/busqueda`, { params });
  }
}
