import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { Auth, Designation } from '../../services/auth';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';
import { DesignationDialog } from '../../designation-dialog/designation-dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatIconModule, 
    MatButtonModule, 
    MatCheckboxModule, 
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './designations.html',
  styleUrls: ['./designations.css'],
})
export class Designations implements OnInit, AfterViewInit {
  designations: Designation[] = [];
  displayedColumns: string[] = ['designationName', 'edit', 'delete'];
  selection = new SelectionModel<Designation>(true, []);
  dataSource = new MatTableDataSource<Designation>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  topMessage: string = '';
  topMessageType: 'success' | 'error' = 'success';
  isLoading: boolean = false;  

  constructor(
    private auth: Auth, 
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadDesignations();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  
  loadDesignations(isRefresh: boolean = false) {
  const currentIndex = this.dataSource.paginator ? this.dataSource.paginator.pageIndex : 0;

 
  const options = isRefresh 
    ? { headers: new HttpHeaders().set('X-Skip-Loading', 'true') } 
    : {};

  this.auth.getDesignations(options).subscribe({
    next: (res: Designation[]) => {
      this.designations = res;
      this.dataSource.data = this.designations;

      if (this.dataSource.paginator) {
        const maxPageIndex = Math.max(0, Math.ceil(res.length / this.dataSource.paginator.pageSize) - 1);
        this.dataSource.paginator.pageIndex = Math.min(currentIndex, maxPageIndex);
      }

      this.cdr.detectChanges();
    },
    error: err => {
      console.error('Fetch error:', err);
      this.showTopMessage('Failed to load designations', 'error');
    }
  });
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
addDesignation() {
  const dialogRef = this.dialog.open(DesignationDialog, {
    width: '500px',
    panelClass: 'my-popup-class',
    data: {
      designationName: '',
      isEdit: false,
      onAddSuccess: () => {
        this.loadDesignations(true);
        this.showTopMessage('Designation added successfully', 'success');
      }
    }
  });
}

editingId: number | null = null;

edit(designation: Designation) {

  this.editingId = designation.designationId; 

  const dialogRef = this.dialog.open(DesignationDialog, {
    width: '500px',
    panelClass: 'my-popup-class',
    data: { ...designation, isEdit: true }
  });

  dialogRef.afterClosed().subscribe(result => {
    
    this.editingId = null; 
    this.cdr.detectChanges();

    if (result?.success) {
     this.loadDesignations(true);
      this.showTopMessage('Designation updated successfully', 'success');
    }
  });
}
delete(designation: Designation) {
  
  this.editingId = designation.designationId; 
  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
    panelClass: 'custom-confirm-dialog',
    data: { message: `Are you sure you want to delete this designation?` }
  });

  dialogRef.afterClosed().subscribe(result => {
     this.editingId = null; 
    this.cdr.detectChanges();

    if (!result) return;

    this.auth.deleteDesignation(designation.designationId).subscribe({
      next: () => {
        this.designations = this.designations.filter(d => d.designationId !== designation.designationId);
        this.dataSource.data = this.designations;
        this.selection.deselect(designation);
        this.cdr.detectChanges();
        
       
        this.showTopMessage(`Designation deleted successfully`, 'success');
      },
      error: err => {
        console.error('Delete failed', err);

        let errorMsg = 'Failed to delete designation.';
        if (err.error) {
          try {
            const parsed = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
            errorMsg = parsed.message || errorMsg;
          } catch (e) {
            errorMsg = typeof err.error === 'string' ? err.error : errorMsg;
          }
        }
        this.snackBar.open(errorMsg, 'X', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
      }
    });
  });

  
}
searchText: string = '';
datasource = new MatTableDataSource<Designation>([]);

applyFilter() {
  const filterValue = this.searchText.trim().toLowerCase();

  this.dataSource.filterPredicate = (data: Designation, filter: string) => {
    return data.designationName.toLowerCase().includes(filter);
  };

  this.dataSource.filter = filterValue;
  
   if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();}
}

}
  
