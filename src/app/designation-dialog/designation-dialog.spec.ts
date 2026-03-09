import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationDialog } from './designation-dialog';

describe('DesignationDialog', () => {
  let component: DesignationDialog;
  let fixture: ComponentFixture<DesignationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignationDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
