import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterDialog } from './printer-dialog';

describe('PrinterDialog', () => {
  let component: PrinterDialog;
  let fixture: ComponentFixture<PrinterDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrinterDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinterDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
