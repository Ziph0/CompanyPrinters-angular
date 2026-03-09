import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Auth, Designation } from '../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DesignationDialogData extends Designation {
  onAddSuccess?: () => void;
  isEdit?: boolean; 
}

@Component({
  selector: 'app-designation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './designation-dialog.html',
  styleUrls: ['./designation-dialog.css'],
})
export class DesignationDialog implements OnInit {

 constructor(
    public dialogRef: MatDialogRef<DesignationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DesignationDialogData, 
    private auth: Auth,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  close() {
    this.dialogRef.close();
  }

  clear(designationModel: any) {
    this.data.designationName = '';

    designationModel.control.markAsUntouched();
   
  }
onDesignationInput(control: any) {
  
  control.control.markAsTouched();
}

onSave(designationModel: any): void {
  if (!this.data.designationName?.trim()) {
   this.snackBar.open('Please fill all required fields.', 'X', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['error-snackbar']
    }); 
    designationModel.control.markAsTouched();
    return;
  }

  const designation = {
    designationId: this.data.designationId,
    designationName: this.data.designationName.trim()
  };

  const handleError = (err: any) => {
    const errorMsg = err.error?.message || err.error || 'Database Error: A designation with this name already exists.';
    this.snackBar.open(errorMsg, 'X', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['error-snackbar']
    });
  };

  if (designation.designationId) {
    this.auth.updateDesignation(designation).subscribe({
      next: () => this.dialogRef.close({ success: true, mode: 'edit' }),
      error: handleError
    });
  } else {
    this.auth.addDesignation(designation).subscribe({
      next: () => {
        if (this.data.onAddSuccess) this.data.onAddSuccess();

        this.clear(designationModel);
        designationModel.control.markAsUntouched(); 
        this.cdr.detectChanges();
      },
      error: handleError
    });
  }
}

  }



