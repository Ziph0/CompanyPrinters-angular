import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Printers } from './printers';

describe('Printers', () => {
  let component: Printers;
  let fixture: ComponentFixture<Printers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Printers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Printers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
