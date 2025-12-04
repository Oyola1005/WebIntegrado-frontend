import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarViajesComponent } from './buscar-viajes.component';

describe('BuscarViajesComponent', () => {
  let component: BuscarViajesComponent;
  let fixture: ComponentFixture<BuscarViajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarViajesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarViajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
