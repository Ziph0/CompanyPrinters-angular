import { ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Auth, Makes, Printer, PrinterData } from '../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-printer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './printer-dialog.html',
  styleUrls: ['./printer-dialog.css']
})
export class PrinterDialog {
  makes: Makes[] = [];
  selectedMake: string = '';

  constructor(
    public dialogRef: MatDialogRef<PrinterDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PrinterData,
    private auth: Auth,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}
isEditMode = false;
@ViewChild('printerNameModel') printerNameModel: any;
  @ViewChild('makeModel') makeModel: any;
  @ViewChild('folderModel') folderModel: any;
  @ViewChild('outputTypeModel') outputTypeModel: any;
  @ViewChild('fileOutputModel') fileOutputModel: any;


  ngOnInit() {
    this.isEditMode = !!this.data.printerId;
    this.auth.getMakes().subscribe(res => {
      this.makes = res;
      this.cdr.detectChanges();
    });
  }

  close() {
    this.dialogRef.close();
  }

   clearForm() {
    this.data.printerId = undefined;
    this.data.printerName = '';
    this.data.makeID = undefined;
    this.data.makeName = '';
    this.data.folderToMonitor = '';
    this.data.outputType = '';
    this.data.fileOutput = '';
    this.data.active = true;
    this.data.createdTimeStamp = new Date();

    [this.printerNameModel, this.makeModel, this.folderModel, this.outputTypeModel, this.fileOutputModel]
      .forEach(ctrl => ctrl?.control?.markAsUntouched());

    this.cdr.detectChanges();
  }


  

onSave(): void {
  
  if (
    !this.data.printerName?.trim() ||
    !this.data.makeID ||
    !this.data.folderToMonitor?.trim() ||
    !this.data.outputType?.trim() ||
    !this.data.fileOutput?.trim()
  ) {
    this.snackBar.open('Please fill all required fields.', 'X', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['error-snackbar']
    });
    this.printerNameModel.control.markAsTouched();
    this.makeModel.control.markAsTouched();
    this.folderModel.control.markAsTouched();
    this.outputTypeModel.control.markAsTouched();
   this.fileOutputModel.control.markAsTouched();
   
    return;
  }

  const printer: Printer = {
    printerName: this.data.printerName,
    makeID: this.data.makeID,
    makeName: this.data.makeName,
    folderToMonitor: this.data.folderToMonitor,
    outputType: this.data.outputType,
    fileOutput: this.data.fileOutput,
    active: this.data.active ?? true,
    createdTimeStamp: new Date()
  };

 const handleError = (err: any) => {
  
  const errorMsg = 'Unable to save printer.';
 
  this.snackBar.open(errorMsg, 'X', {
    duration: 5000,
    verticalPosition: 'top',
    horizontalPosition: 'center',
    panelClass: ['error-snackbar']
  });
};


  if (this.data.printerId) {
    this.auth.updatePrinter(this.data.printerId, printer).subscribe({
      next: res => {
      
        if (this.data.onUpdateSuccess) this.data.onUpdateSuccess(printer);
        this.dialogRef.close(true); 
      },
      error: err => handleError(err) 
    });
  } else {
    this.auth.addPrinter(printer).subscribe({
      next: res => {
       
        if (this.data.onAddSuccess) this.data.onAddSuccess();
        this.clearForm();
        this.cdr.detectChanges();
      },
      error: err => handleError(err) 
    });
  }
}


}
