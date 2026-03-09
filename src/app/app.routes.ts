import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Printers } from './pages/printers/printers';
import { Menu } from './pages/menu/menu';
import { Users } from './pages/users/users';
import { Designations } from './pages/designations/designations';


export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'printers', component: Printers},
  {path:'menu', component: Menu},
  {path: "users", component:Users},
  {path: "designations", component:Designations},
  { path: '', redirectTo: 'printers', pathMatch: 'full' },
];
