import { ChangeDetectorRef, Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Auth, User, Designation } from '../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appPasswordValidator]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: PasswordValidatorDirective, multi: true }]
})
export class PasswordValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;
    if (!value) return null; 
    const isValid = value.length >= 6 && /[^a-zA-Z0-9]/.test(value);
    return isValid ? null : { invalidPassword: true };
  }
}@Directive({
  selector: '[appConfirmPasswordValidator]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: ConfirmPasswordValidatorDirective, multi: true }]
})
export class ConfirmPasswordValidatorDirective implements Validator, OnChanges {
  @Input('appConfirmPasswordValidator') passwordReference: string = '';
  
  private onChange?: () => void;

  validate(control: AbstractControl): ValidationErrors | null {
    const confirmValue = control.value;
    if (!confirmValue) return null; 

   
    return confirmValue === this.passwordReference ? null : { passwordMismatch: true };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['passwordReference'] && this.onChange) {
      this.onChange();
    }
  }

  registerOnValidatorChange(fn: () => void) {
    this.onChange = fn;
  }
}

export interface UserDialogData {
  onAddSuccess: any;
  userId?: number;
  firstName?: string;
  lastName?: string;
  designationId?: number;
  email?: string;
  username?: string;
  password?: string;
  isEditMode?: boolean;
  onSaveSuccess?: () => void;
}


@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    PasswordValidatorDirective,
    ConfirmPasswordValidatorDirective
  ],
  templateUrl: './user-dialog.html',
  styleUrls: ['./user-dialog.css']
})
export class UserDialog implements OnInit {
  designations: Designation[] = [];
  confirmPassword: string = '';
  passwordMismatch = false;
  isEditMode = false;

  constructor(
    public dialogRef: MatDialogRef<UserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData,
    private auth: Auth,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
  this.isEditMode = !!this.data.isEditMode;

  this.auth.getDesignations().subscribe(res => {
    this.designations = res;
    this.cdr.detectChanges();
  });

  if (this.isEditMode && this.data.password) {
    this.confirmPassword = this.data.password;
  }
}


  close() {
    this.dialogRef.close();
  }
@ViewChild('firstNameModel') firstNameModel: any;
@ViewChild('lastNameModel') lastNameModel: any;
@ViewChild('designationModel') designationModel: any;
@ViewChild('emailModel') emailModel: any;
@ViewChild('usernameModel') usernameModel: any;
@ViewChild('passwordModel') passwordModel: any;
@ViewChild('confirmModel') confirmModel: any;


onPasswordChange() {
  
  if (this.confirmModel && this.confirmModel.control) {
    this.confirmModel.control.updateValueAndValidity();
  }
}

 clearForm() {
  this.data.userId = undefined;
  this.data.firstName = '';
  this.data.lastName = '';
  this.data.designationId = undefined;
  this.data.email = '';
  this.data.username = '';
  this.data.password = '';
  this.confirmPassword = '';
  this.passwordMismatch = false;

  [this.firstNameModel, this.lastNameModel, this.designationModel, this.emailModel, this.usernameModel, this.passwordModel, this.confirmModel]
    .forEach(ctrl => ctrl?.control?.markAsUntouched());

  this.cdr.detectChanges();
}




onSave(): void {
  
  if (!this.data.firstName || !this.data.lastName || !this.data.email || !this.data.username || !this.data.designationId) {
    this.showErrorSnackbar('Please fill all required fields.');

  this.firstNameModel.control.markAsTouched();
  this.lastNameModel.control.markAsTouched();
  this.designationModel.control.markAsTouched();
  this.emailModel.control.markAsTouched();
  this.usernameModel.control.markAsTouched();
  this.passwordModel.control.markAsTouched();
  this.confirmModel.control.markAsTouched();
    return;
  }
  if (!this.isEditMode || this.data.password) {
    this.passwordMismatch = this.data.password !== this.confirmPassword;
    if (this.passwordMismatch) {
      this.showErrorSnackbar('Unable to save user.');
      return;
    }
  }

  const selectedDesignation = this.designations.find(d => d.designationId === this.data.designationId)?.designationName;
  if (!selectedDesignation) return;

  const userPayload: User = {
    firstName: this.data.firstName!,
    lastName: this.data.lastName!,
    email: this.data.email!,
    username: this.data.username!,
    password: this.data.password!,
    designationName: selectedDesignation
  };

  const handleError = (err: any) => {
  console.error('Save failed:', err);
  let errorMsg = 'Unable to save user.';

  if (err.error) {
    try {
     
      const parsedError = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
      errorMsg = parsedError.message || errorMsg;
    } catch (e) {
    
      errorMsg = typeof err.error === 'string' ? err.error : errorMsg;
    }
  }

  this.showErrorSnackbar(errorMsg);
};

  
 if (this.data.userId) {
  this.auth.updateUser(this.data.userId, userPayload).subscribe({
    next: (res) => {
      this.dialogRef.close({ success: true });
    },
    error: (err) => handleError(err) 
  });
  } else {
    this.auth.addUser(userPayload).subscribe({
      next: () => {
        if (this.data.onAddSuccess) this.data.onAddSuccess();
        this.clearForm();
        this.cdr.detectChanges();
      },
      error: handleError 
    });
  }
}

private showErrorSnackbar(message: string): void {
  this.snackBar.open(message, 'X', {
    duration: 5000,
    verticalPosition: 'top',
    horizontalPosition: 'center',
    panelClass: ['error-snackbar']
  });
}



}

 

