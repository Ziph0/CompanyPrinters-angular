import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Confirm</h2>
<mat-dialog-content style="white-space: pre-line">
  {{ data.message }}
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="dialogRef.close(false)">Cancel</button>
  <button mat-raised-button color="warn" (click)="dialogRef.close(true)">Delete</button>
    
</mat-dialog-actions>
  `
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}
}
