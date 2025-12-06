import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompraBoletoRequest } from '../models/compra-boleto.model';

@Injectable({
  providedIn: 'root'
})
export class BoletoService {

  private apiUrl = 'http://localhost:8080/api/boletos';

  constructor(private http: HttpClient) {}

  comprar(req: CompraBoletoRequest): Observable<any> {
    // El backend toma el pasajero desde el usuario logueado (JWT)
    return this.http.post<any>(`${this.apiUrl}/comprar`, req);
  }
}