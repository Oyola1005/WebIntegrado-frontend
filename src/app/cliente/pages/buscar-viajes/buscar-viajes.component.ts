import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViajeService } from '../../../core/services/viaje.service';
import { Viaje } from '../../../core/models/viaje.model';
import { BoletoService } from '../../../core/services/boleto.service';
import { CompraBoletoRequest } from '../../../core/models/compra-boleto.model';

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

  // formulario de búsqueda
  form: FormGroup = this.fb.group({
    origen: ['', Validators.required],
    destino: ['', Validators.required]
  });

  resultados: Viaje[] = [];
  loading = false;
  errorMsg = '';
  buscado = false;

  // compra de boleto
  selectedViaje: Viaje | null = null;

  compraForm: FormGroup = this.fb.group({
    pasajeroId: [null, [Validators.required]]
  });

  compraMsg = '';
  compraError = '';

  buscar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { origen, destino } = this.form.value;

    this.loading = true;
    this.errorMsg = '';
    this.buscado = true;
    this.selectedViaje = null;      // limpiar selección anterior
    this.compraMsg = '';
    this.compraError = '';

    this.viajeService.buscarPorRuta(origen, destino).subscribe({
      next: (data: Viaje[]) => {
        this.resultados = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMsg = 'Ocurrió un error al buscar los viajes.';
        this.loading = false;
      }
    });
  }

  // cuando el usuario hace clic en "Comprar"
  seleccionarViaje(viaje: Viaje): void {
    this.selectedViaje = viaje;
    this.compraMsg = '';
    this.compraError = '';
    this.compraForm.reset({
      pasajeroId: null
    });
  }

  confirmarCompra(): void {
    if (!this.selectedViaje || this.compraForm.invalid) {
      this.compraForm.markAllAsTouched();
      return;
    }

    const pasajeroId = this.compraForm.value.pasajeroId;

    const payload: CompraBoletoRequest = {
      viajeId: this.selectedViaje.id!,   // ya sabemos que tiene id
      pasajeroId: pasajeroId
    };

    this.loading = true;
    this.compraMsg = '';
    this.compraError = '';

    this.boletoService.comprar(payload).subscribe({
      next: (res: any) => {
        console.log('Compra OK:', res);
        this.loading = false;
        this.compraMsg = 'Boleto comprado correctamente.';
        // refrescar lista para ver asientos actualizados
        this.buscar();
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;

        // Si el backend manda un mensaje de error en texto plano (String)
        if (err.status === 400 && typeof err.error === 'string') {
          this.compraError = err.error; // ej: "No existe pasajero con id: 1"
        } else if (err.status === 500 && typeof err.error === 'string') {
          this.compraError = 'Error interno: ' + err.error;
        } else {
          this.compraError = 'No se pudo completar la compra. Verifica los datos.';
        }
      }

    });
  }
}
