import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  loginForm: FormGroup;
  showPassword = false;
  submitted = false;
  isCapsOn = false;
  errorMessage = '';
  isLoading = false; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  checkCapsLock(event: any) {
    if (event?.getModifierState) {
      this.isCapsOn = event.getModifierState('CapsLock');
    }
  }

  onLogin() {
  this.submitted = true;
  this.errorMessage = '';

  if (this.loginForm.invalid) return;

  this.isLoading = true;
  this.cdr.detectChanges(); 

  const start = Date.now();

  this.auth.login(this.loginForm.value).subscribe({
  next: (res: any) => {
      const elapsed = Date.now() - start;
      const minTime = 400; 
      const delay = Math.max(minTime - elapsed, 0);

      setTimeout(() => {
      const userData = res.data; 

      localStorage.setItem('username', userData.username);
      localStorage.setItem('designationId', userData.designationId.toString());
      localStorage.setItem('userId', '1'); 

      this.isLoading = false;
      this.cdr.detectChanges(); 
      this.router.navigate(['/printers']);
      }, delay);
    },
    error: (err: any) => {
      
      this.isLoading = false; 
      this.errorMessage = err.error?.message || err.error || 'Invalid username or password.';
      
      
      this.cdr.detectChanges(); 
      
      console.error('Login error:', err);
    }
  });
  }
}