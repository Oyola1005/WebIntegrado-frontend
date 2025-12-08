import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray
} from '@angular/forms';
import { ViajeService } from '../../../core/services/viaje.service';
import { Viaje } from '../../../core/models/viaje.model';
import { BoletoService } from '../../../core/services/boleto.service';
import { CompraBoletoRequest } from '../../../core/models/compra-boleto.model';
import { forkJoin } from 'rxjs';
import { PasajeroService } from '../../../core/services/pasajero.service';
import { Pasajero } from '../../../core/models/pasajero.model';

@Component({
  selector: 'app-buscar-viajes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buscar-viajes.component.html',
  styleUrls: ['./buscar-viajes.component.scss']
})
export class BuscarViajesComponent implements OnInit {

  private fb = inject(FormBuilder);
  private viajeService = inject(ViajeService);
  private boletoService = inject(BoletoService);
  private pasajeroService = inject(PasajeroService);

  todayStr: string = new Date().toISOString().split('T')[0];

  get minFechaRetorno(): string {
    const fechaIda = this.form.get('fechaIda')?.value;
    return fechaIda || this.todayStr;
  }

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

  selectedViaje: Viaje | null = null;

  seatNumbers: number[] = Array.from({ length: 40 }, (_, i) => i + 1);
  selectedSeats: number[] = [];
  resumenAsientos = '';
  cantidadAsientos = 0;
  totalAPagar = 0;

  /** 🔹 Asientos ocupados del backend */
  occupiedSeats: number[] = [];

  compraMsg = '';
  compraError = '';

  pasajeroActual: Pasajero | null = null;

  pasajerosForm: FormGroup = this.fb.group({
    pasajeros: this.fb.array([])
  });

  get pasajerosArray(): FormArray {
    return this.pasajerosForm.get('pasajeros') as FormArray;
  }

  mostrarFormularioPasajeros = false;

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.cargarPasajeroActual();
    }
  }

  private cargarPasajeroActual(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.pasajeroService.getPerfilActual().subscribe({
      next: (p: Pasajero | null) => {
        if (!p) return;
        this.pasajeroActual = p;
      },
      error: (err: any) => {
        console.error('No se pudo cargar el pasajero actual', err);
      }
    });
  }

  buscar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { origen, destino, fechaIda } = this.form.value;

    this.loading = true;
    this.errorMsg = '';
    this.buscado = true;

    this.selectedViaje = null;
    this.selectedSeats = [];
    this.resumenAsientos = '';
    this.cantidadAsientos = 0;
    this.totalAPagar = 0;
    this.compraMsg = '';
    this.compraError = '';
    this.mostrarFormularioPasajeros = false;
    this.pasajerosArray.clear();
    this.occupiedSeats = [];

    this.viajeService.buscarPorRuta(origen, destino, fechaIda).subscribe({
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

  seleccionarViaje(viaje: Viaje): void {
    this.selectedViaje = viaje;

    this.selectedSeats = [];
    this.resumenAsientos = '';
    this.cantidadAsientos = 0;
    this.totalAPagar = 0;
    this.compraMsg = '';
    this.compraError = '';
    this.mostrarFormularioPasajeros = false;
    this.pasajerosArray.clear();
    this.occupiedSeats = [];

    this.boletoService.getAsientosOcupados(viaje.id!).subscribe({
      next: (ocupados: number[]) => {
        this.occupiedSeats = ocupados.map(x => Number(x));
      },
      error: (err) => {
        console.error('Error cargando asientos ocupados', err);
        this.occupiedSeats = [];
      }
    });
  }

  /** Si está ocupado */
  isSeatOccupied(seat: number): boolean {
    return this.occupiedSeats.includes(Number(seat));
  }

  onSeatToggle(seatNumber: number, checked: boolean): void {
    if (this.isSeatOccupied(seatNumber)) {
      return;
    }

    if (checked) {
      if (!this.selectedSeats.includes(seatNumber)) {
        this.selectedSeats.push(seatNumber);
      }
    } else {
      this.selectedSeats = this.selectedSeats.filter(s => s !== seatNumber);
    }

    this.resumenAsientos = this.selectedSeats.join(', ');
    this.cantidadAsientos = this.selectedSeats.length;
    this.totalAPagar = this.selectedViaje ? this.cantidadAsientos * this.selectedViaje.precio : 0;

    this.construirFormularioPasajeros();
  }

  private construirFormularioPasajeros(): void {
    const arr = this.pasajerosArray;
    arr.clear();

    if (!this.selectedViaje || this.selectedSeats.length === 0) {
      this.mostrarFormularioPasajeros = false;
      return;
    }

    this.selectedSeats.forEach((seat, index) => {
      let nombres = '';
      let apellidos = '';
      let dni = '';
      let email = '';
      let celular = '';

      if (index === 0 && this.pasajeroActual) {
        nombres = this.pasajeroActual.nombres;
        apellidos = this.pasajeroActual.apellidos;
        dni = this.pasajeroActual.dni;
        email = this.pasajeroActual.email;
        celular = this.pasajeroActual.telefono;
      }

      arr.push(
        this.fb.group({
          asiento: [seat],
          nombres: [nombres, Validators.required],
          apellidos: [apellidos, Validators.required],
          dni: [dni, [Validators.required, Validators.pattern(/^\d{8}$/)]],
          email: [email, [Validators.required, Validators.email]],
          celular: [celular, [Validators.required, Validators.pattern(/^\d{9}$/)]]
        })
      );
    });

    this.mostrarFormularioPasajeros = true;
  }

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

    this.compraError = '';
    this.compraMsg = '';
    this.mostrarFormularioPasajeros = true;
  }

  finalizarCompra(): void {
    if (!this.selectedViaje) return;

    if (this.pasajerosForm.invalid) {
      this.pasajerosForm.markAllAsTouched();
      return;
    }

    const peticiones = this.selectedSeats.map(seat => {
      const payload: CompraBoletoRequest = {
        viajeId: this.selectedViaje!.id!,
        numeroAsiento: seat
      };
      return this.boletoService.comprar(payload);
    });

    this.loading = true;
    this.compraMsg = '';
    this.compraError = '';

    forkJoin(peticiones).subscribe({
      next: (resArr: any[]) => {
        this.compraMsg = `Se compraron ${resArr.length} boleto(s) correctamente.`;
        this.loading = false;

        this.occupiedSeats.push(...this.selectedSeats);
        this.occupiedSeats = [...new Set(this.occupiedSeats)];

        if (this.selectedViaje) {
          this.selectedViaje.asientosDisponibles -= this.selectedSeats.length;
        }

        this.selectedSeats = [];
        this.resumenAsientos = '';
        this.cantidadAsientos = 0;
        this.totalAPagar = 0;
        this.mostrarFormularioPasajeros = false;
        this.pasajerosArray.clear();
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
