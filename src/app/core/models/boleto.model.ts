// src/app/core/models/boleto.model.ts
export interface Boleto {
  id: number;
  viajeId: number;
  pasajeroId: number;
  fechaCompra: string;   // viene como ISO string del backend
  montoTotal: number;
  estado: string;        // PAGADO, CANCELADO, etc.
}
