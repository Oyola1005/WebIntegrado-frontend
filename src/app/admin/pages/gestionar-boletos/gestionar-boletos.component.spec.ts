import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarBoletosComponent } from './gestionar-boletos.component';

describe('GestionarBoletosComponent', () => {
  let component: GestionarBoletosComponent;
  let fixture: ComponentFixture<GestionarBoletosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarBoletosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarBoletosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
