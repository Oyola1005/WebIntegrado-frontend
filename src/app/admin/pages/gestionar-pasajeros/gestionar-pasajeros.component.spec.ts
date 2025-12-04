import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarPasajerosComponent } from './gestionar-pasajeros.component';

describe('GestionarPasajerosComponent', () => {
  let component: GestionarPasajerosComponent;
  let fixture: ComponentFixture<GestionarPasajerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarPasajerosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarPasajerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
