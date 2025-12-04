import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarViajesComponent } from './gestionar-viajes.component';

describe('GestionarViajesComponent', () => {
  let component: GestionarViajesComponent;
  let fixture: ComponentFixture<GestionarViajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarViajesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarViajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
