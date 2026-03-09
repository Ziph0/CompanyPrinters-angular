import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'

import { Auth, Makes, Printer, User } from '../../services/auth';
import { PrinterDialog } from '../../printer-dialog/printer-dialog';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';
import { forkJoin } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-printers',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSnackBarModule
  ],
  templateUrl: './printers.html',
  styleUrls: ['./printers.css'],
})
export class Printers implements OnInit, AfterViewInit {
  printers: Printer[] = [];
  displayedColumns: string[] = [
    'select', 'printerName', 'makeName', 'folderToMonitor',
    'outputType', 'fileOutput', 'active', 'createdTimeStamp', 'edit', 'delete'
  ];
  selection = new SelectionModel<Printer>(true, []);
  dataSource = new MatTableDataSource<Printer>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  makes: Makes[] = [];
  selectedMake: number | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  topMessage: string = '';
topMessageType: 'success' | 'error' = 'success';
currentUser: User | null = null;
currentDesignation: string = '';
editingId: number | null | undefined = null;


  constructor(
    private auth: Auth,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

isPrivileged: boolean = false;

ngOnInit() {
  this.loadPrinters();
  this.loadMakes();
  
  this.auth.getCurrentUser().subscribe(user => {
    this.currentDesignation = user.designationName;
 
    this.isPrivileged = (this.currentDesignation === 'Manager' || this.currentDesignation === 'System Administrator');
    this.applyRoleSecurity();
    
  });
}

applyRoleSecurity() {
  if (!this.isPrivileged) {
    
    const baseColumns = [
      'printerName', 'makeName', 'folderToMonitor',
      'outputType', 'fileOutput', 'active', 'createdTimeStamp', 'edit'
    ];
  
    this.displayedColumns = baseColumns;

    this.selection.clear();
    this.selection = new SelectionModel<Printer>(false, []);
  }
}


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  showTopMessage(
  message: string,
  type: 'success' | 'error' = 'success',
  duration = 3000
) {
  this.snackBar.open(message, undefined, {  
    duration,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: type === 'success'
      ? ['snackbar-success']
      : ['snackbar-error']
  });
}
loadPrinters(isRefresh: boolean = false) {
  const currentPage = this.dataSource.paginator ? this.dataSource.paginator.pageIndex : 0;
  
  // Set the "Silent" header if this is a refresh
  const options = isRefresh ? { headers: new HttpHeaders().set('X-Skip-Loading', 'true') } : {};

  this.auth.getPrinters(options).subscribe({
    next: printers => {
      this.printers = printers;
      this.dataSource.data = this.printers;
      
      if (this.dataSource.paginator) {
        this.dataSource.paginator.pageIndex = currentPage;
      }
      this.cdr.detectChanges();
    },
    error: err => {
      console.error('Fetch error:', err);
      this.showTopMessage('Failed to load printers', 'error');
    }
  });
}

loadMakes(isRefresh: boolean = false) {
  const options = isRefresh ? { headers: new HttpHeaders().set('X-Skip-Loading', 'true') } : {};
  
  this.auth.getMakes(options).subscribe({
    next: makes => {
      this.makes = makes;
      this.cdr.detectChanges();
    },
    error: err => console.error(err)
  });
}
 searchPrinters() {
  this.auth.getPrintersFiltered(
    this.selectedMake ?? undefined,
    this.fromDate ?? undefined,
    this.toDate ?? undefined
  ).subscribe({
    next: (response: any[]) => {
      console.log('Filtered Data (Raw):', response);

      this.printers = response.map(p => ({
        printerId: p.EngenPrintersID,
        printerName: p.PrinterName,
        makeID: p.PrinterMakeId,
        makeName: p.PrinterMakeName, 
        folderToMonitor: p.FolderToMonitor,
        outputType: p.OutputType,
        fileOutput: p.FileOutput,
        active: p.Active,
        createdTimeStamp: p.CreatedTimeStamp
      }));

     
      this.dataSource.data = this.printers;

      
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.paginator.firstPage();
      }

      
      this.cdr.detectChanges();
    },
    error: err => console.error('Filter Error:', err)
  });
}

clearFilters() {
 
  this.selectedMake = -1;
  this.fromDate = null;
  this.toDate = null;

  this.searchText = '';
  if (this.dataSource) {
    this.dataSource.filter = '';
  }
  this.loadPrinters();
}
  addPrinter() {
  const dialogRef = this.dialog.open(PrinterDialog, {
    width: '500px',
    panelClass: 'my-popup-class',
    data: { 
      active: true, 
      makeID: 0, 
      onAddSuccess: (newPrinter: Printer) => {
        this.loadPrinters(true);
        this.showTopMessage(`Printer added successfully`, 'success');
      }
    }
  });

  dialogRef.afterClosed().subscribe(refresh => {
    if (refresh) this.loadPrinters(true);
  });
}

openEditDialog(printer: Printer) {

  this.editingId = printer.printerId; 
  const dialogRef = this.dialog.open(PrinterDialog, { 
    width: '500px',
    panelClass: 'my-popup-class', 
    data: { ...printer,
      onUpdateSuccess: (updatedPrinter: Printer) => {
        this.loadPrinters(true);
        this.showTopMessage(`Printer updated successfully`, 'success');
      }
    } 
  });

  dialogRef.afterClosed().subscribe(refresh => { 
     this.editingId = null; 
    this.cdr.detectChanges();
    if (refresh) this.loadPrinters(true); 
  });
}

  delete(printer: Printer) {
  this.editingId = printer.printerId; 
  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
     panelClass: 'custom-confirm-dialog',
    data: { message: `Are you sure you want to delete this printer?` }
  });

  dialogRef.afterClosed().subscribe(result => {
    this.editingId = null; 
    this.cdr.detectChanges();

    if (!result) return;
    this.auth.deletePrinter(printer.printerId!).subscribe({
      next: () => { 
        this.showTopMessage(`Printer deleted successfully`, 'success');
        this.loadPrinters(true); 
      },
      error: err => { 
        console.error(err); 
        this.showTopMessage(`Failed to delete printer"`, 'error'); 
      }
    });
  });
}


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.dataSource.data);
  }

 deleteSelected() {
 
  const selected = this.selection.selected;
  if (selected.length < 1) return;

  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
     panelClass: 'custom-confirm-dialog',
    data: { 
      message: `Are you sure you want to delete ${selected.length} printers?\n\n${selected.map(p => '- ' + p.printerName).join('\n')}`
    }
  });

  dialogRef.afterClosed().subscribe(result => {

    if (!result) return;

    forkJoin(selected.map(p => this.auth.deletePrinter(p.printerId!))).subscribe({
      next: () => { 
        this.showTopMessage(`${selected.length} printers deleted successfully`, 'success');
        this.loadPrinters(true); 
        this.selection.clear(); 
      },
      error: err => { 
        console.error(err); 
        this.showTopMessage('Failed to delete some printers', 'error'); 
      }
    });
  });
}
searchText: string = '';
datasource = new MatTableDataSource<Printer>([]);

applyFilter() {
  const filterValue = this.searchText.trim().toLowerCase();

  this.dataSource.filterPredicate = (data: Printer, filter: string) => {
    return (
      data.printerName.toLowerCase().includes(filter) ||
      data.makeName.toLowerCase().includes(filter) ||
      data.folderToMonitor.toLowerCase().includes(filter) ||
      data.outputType.toLowerCase().includes(filter) ||
      data.fileOutput.toLowerCase().includes(filter) ||
      String(data.active).toLowerCase().includes(filter)||
      String(data.createdTimeStamp).toLowerCase().includes(filter)
    );
  };

  this.dataSource.filter = filterValue;
   if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
   }
}



}
