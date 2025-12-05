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
    // Ajusta '/comprar' si en tu Swagger el endpoint se llama distinto
    return this.http.post<any>(`${this.apiUrl}/comprar`, req);
  }
}
