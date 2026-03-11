import { Routes } from '@angular/router';
import { AccountListComponent } from './components/account-list/account-list';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { 
    path: 'accounts', 
    component: AccountListComponent, 
    canActivate: [authGuard]
  },

  { path: '', redirectTo: '/accounts', pathMatch: 'full' },
  { path: '**', redirectTo: '/accounts' }
];
