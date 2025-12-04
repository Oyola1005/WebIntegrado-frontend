export interface Viaje {
  id?: number;                // opcional al crear
  origen: string;
  destino: string;
  fechaSalida: string;        // ISO string (ej: '2025-12-05T08:00:00')
  fechaLlegada: string;
  precio: number;
  asientosDisponibles: number;
  estado: string;             // 'PROGRAMADO', 'COMPLETADO', etc.
}