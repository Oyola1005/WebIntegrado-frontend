import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViajeService } from '../../../core/services/viaje.service';
import { Viaje } from '../../../core/models/viaje.model';
import { BoletoService } from '../../../core/services/boleto.service';
import { CompraBoletoRequest } from '../../../core/models/compra-boleto.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-buscar-viajes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buscar-viajes.component.html',
  styleUrls: ['./buscar-viajes.component.scss']
})
export class BuscarViajesComponent {

  private fb = inject(FormBuilder);
  private viajeService = inject(ViajeService);
  private boletoService = inject(BoletoService);

  // 👉 FECHA DE HOY (para bloquear días pasados)
  todayStr: string = new Date().toISOString().split('T')[0];

  // 👉 Mínimo permitido para la fecha de retorno
  get minFechaRetorno(): string {
    const fechaIda = this.form.get('fechaIda')?.value;
    return fechaIda || this.todayStr;
  }

  // FORMULARIO DE BÚSQUEDA
  form: FormGroup = this.fb.group({
    origen: ['', Validators.required],
    destino: ['', Validators.required],
    fechaIda: [null],
    fechaRetorno: [null]
  });

  resultados: Viaje[] = [];
  loading = false;
  errorMsg = '';
  buscado = false;

  // VIAJE SELECCIONADO
  selectedViaje: Viaje | null = null;

  // ASIENTOS
  seatNumbers: number[] = Array.from({ length: 40 }, (_, i) => i + 1);
  selectedSeats: number[] = [];
  resumenAsientos: string = '';
  cantidadAsientos = 0;
  totalAPagar = 0;

  // MENSAJES
  compraMsg = '';
  compraError = '';

  // Toggle de asientos
  onSeatToggle(seatNumber: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedSeats.includes(seatNumber)) {
        this.selectedSeats.push(seatNumber);
      }
    } else {
      this.selectedSeats = this.selectedSeats.filter(s => s !== seatNumber);
    }

    this.resumenAsientos = this.selectedSeats.join(', ');
    this.cantidadAsientos = this.selectedSeats.length;

    if (this.selectedViaje) {
      this.totalAPagar = this.cantidadAsientos * this.selectedViaje.precio;
    } else {
      this.totalAPagar = 0;
    }
  }

  // Buscar viajes
  buscar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { origen, destino } = this.form.value;

    this.loading = true;
    this.errorMsg = '';
    this.buscado = true;

    // reset selección
    this.selectedViaje = null;
    this.selectedSeats = [];
    this.resumenAsientos = '';
    this.cantidadAsientos = 0;
    this.totalAPagar = 0;
    this.compraMsg = '';
    this.compraError = '';

    this.viajeService.buscarPorRuta(origen, destino).subscribe({
      next: (data: Viaje[]) => {
        this.resultados = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Ocurrió un error al buscar los viajes.';
        this.loading = false;
      }
    });
  }

  // Seleccionar viaje
  seleccionarViaje(viaje: Viaje): void {
    this.selectedViaje = viaje;
    this.selectedSeats = [];
    this.resumenAsientos = '';
    this.cantidadAsientos = 0;
    this.totalAPagar = 0;
    this.compraMsg = '';
    this.compraError = '';
  }

  // Confirmar compra
  confirmarCompra(): void {
    if (!this.selectedViaje) {
      this.compraError = 'Debes seleccionar un viaje.';
      this.compraMsg = '';
      return;
    }

    if (this.selectedSeats.length === 0) {
      this.compraError = 'Selecciona al menos un asiento.';
      this.compraMsg = '';
      return;
    }

    if (this.selectedSeats.length > this.selectedViaje.asientosDisponibles) {
      this.compraError = 'No hay suficientes asientos disponibles para esa cantidad.';
      this.compraMsg = '';
      return;
    }

    const payload: CompraBoletoRequest = {
      viajeId: this.selectedViaje.id!
    };

    // Creamos una petición por cada asiento seleccionado
    const peticiones = this.selectedSeats.map(() => this.boletoService.comprar(payload));

    this.loading = true;
    this.compraMsg = '';
    this.compraError = '';

    forkJoin(peticiones).subscribe({
      next: (resArr: any[]) => {
        this.compraMsg = `Se compraron ${resArr.length} boleto(s) correctamente.`;
        this.loading = false;
        this.buscar(); // recargar para ver asientos actualizados
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;

        if (err.status === 400 && typeof err.error === 'string') {
          this.compraError = err.error;
        } else if (err.status === 500 && typeof err.error === 'string') {
          this.compraError = 'Error interno: ' + err.error;
        } else {
          this.compraError = 'No se pudo completar la compra.';
        }
      }
    });
  }
}
