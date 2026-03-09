import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';


import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-menu',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css'],
})
export class Menu implements OnInit {

  username: string | null = null;

  constructor(
    private router: Router,
    public auth: Auth   
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
