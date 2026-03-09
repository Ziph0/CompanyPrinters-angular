import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Menu } from './pages/menu/menu';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LoadingSpinner } from './loading-spinner/loading-spinner';
import { Loading } from './services/loading';



@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterModule,
    Menu,
    CommonModule,
    MatCheckboxModule,
    LoadingSpinner
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  isLoading = false;

  constructor(private router: Router,
    public loadingService: Loading
  ) {}

  showMenu(): boolean {
    return this.router.url !== '/login';
  }
}
