import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { User, Auth, Designation } from '../../services/auth';
import { UserDialog } from '../../user-dialog/user-dialog';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpHeaders } from '@angular/common/http';



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit, AfterViewInit {
  users: User[] = [];
  designations: Designation[] = [];
  selectedDesignation?: number;
  isLoading: boolean = false;  
  editingId: number | null | undefined = null;
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = [
    'firstName', 'lastName', 'designationName', 'email', 'username', 'password', 'edit', 'delete'
  ];
  topMessage: string = '';
  topMessageType: 'success' | 'error' = 'success';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private auth: Auth,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadDesignations();
    this.loadUsers();
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

 loadDesignations(isRefresh: boolean = false) {
  const options = isRefresh ? { headers: new HttpHeaders().set('X-Skip-Loading', 'true') } : {};
  
  this.auth.getDesignations(options).subscribe({
    next: res => { this.designations = res; this.cdr.detectChanges(); },
    error: err => console.error(err)
  });
}

loadUsers(isRefresh: boolean = false, callback?: () => void) {
  const options = isRefresh ? { headers: new HttpHeaders().set('X-Skip-Loading', 'true') } : {};

  this.auth.getUsers(options).subscribe({
    next: (res: any) => {
      const currentPageIndex = this.paginator ? this.paginator.pageIndex : 0;
      const rawData = Array.isArray(res) ? res : (res.data || res.users || []);
      
      this.users = rawData.map((u: any) => ({
        ...u,
        designationName: u.designationName || u.designation || 'N/A',
        username: u.userName || u.username || 'Unknown',
        userId: u.userId || u.id
      }));

      this.dataSource.data = this.users;

      setTimeout(() => {
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          if (currentPageIndex > 0) {
            this.dataSource.paginator.pageIndex = currentPageIndex;
          }
        }
        this.cdr.detectChanges();
        if (callback) callback();
      });
    },
    error: err => {
      console.error('Fetch error:', err);
      this.showTopMessage('Failed to load users', 'error');
    }
  });
}

  filterByDesignation() {
  this.auth.getUsersFiltered(this.selectedDesignation).subscribe({
    next: (res: any[]) => {
      this.users = res.map(u => ({
       userId: u.userId || u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        password: u.password,
        designationId: u.designationId,     
        designationName: u.designationName,      
        username: u.userName                 
      }));

      this.dataSource.data = this.users;
      this.dataSource.paginator?.firstPage();
      this.cdr.detectChanges();
    },
    error: err => console.error('API error:', err)
  });
}



  clearFilter() {
 
  this.selectedDesignation = undefined;

  this.searchText = '';

  if (this.dataSource) {
    this.dataSource.filter = '';
  }

  this.loadUsers();
}

 addUser() {
  const dialogRef = this.dialog.open(UserDialog, {
    width: '500px',
    panelClass: 'my-popup-class',
    data: { 
      isEditMode: false,
      onAddSuccess: () => {
        this.loadUsers(true);
        this.showTopMessage('User added successfully', 'success');
      }
    }
  });
}


edit(user: User) {

  this.editingId = user.userId; 

  const dialogRef = this.dialog.open(UserDialog, {
    width: '500px',
    panelClass: 'my-popup-class',
    data: { ...user, isEditMode: true }
  });

  dialogRef.afterClosed().subscribe(result => {
     this.editingId = null; 
    this.cdr.detectChanges();

    if (!result?.success) return;

    this.loadUsers(true);
    this.showTopMessage('User updated successfully', 'success');
  });
}


delete(user: User) {
  this.editingId = user.userId; 
    const dialogRef=this.dialog.open(ConfirmDialog,{
width:'400px',
 panelClass: 'custom-confirm-dialog',
data:{message:'Are you sure you want to delete this user?'}
});

dialogRef.afterClosed().subscribe(result => {
   this.editingId = null; 
    this.cdr.detectChanges();

    if (!result) return;
   this.auth.deleteUser(user.userId!).subscribe({
      next: () => { 
        this.showTopMessage(`User deleted successfully`, 'success');
        this.loadUsers(true);
      },
      error: err => {
        console.error(err);
        this.showTopMessage(`Failed to delete user`, 'error');
      }
    });
});
}
searchText: string = '';

applyFilter() {
  const filterValue = this.searchText.trim().toLowerCase();

  this.dataSource.filterPredicate = (data: User, filter: string) => {
    return (
      data.firstName?.toLowerCase().includes(filter) ||
      data.lastName?.toLowerCase().includes(filter) ||
      data.email?.toLowerCase().includes(filter) ||
      data.username?.toLowerCase().includes(filter) ||
      data.designationName?.toLowerCase().includes(filter)
    );
  };

  this.dataSource.filter = filterValue;
 if (this.dataSource.paginator) {
   this.dataSource.paginator.firstPage();

  }
}
}