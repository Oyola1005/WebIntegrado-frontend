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

  // 👉 ahora acepta fechaIda opcional
  buscarPorRuta(origen: string, destino: string, fechaIda?: string): Observable<Viaje[]> {
    const params: any = { origen, destino };
    if (fechaIda) {
      params.fechaIda = fechaIda;  // mismo nombre que en el backend
    }
    return this.http.get<Viaje[]>(`${this.apiUrl}/busqueda`, { params });
  }
}
