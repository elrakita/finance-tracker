import { Routes } from '@angular/router';
import { AccountListComponent } from './components/account-list/account-list';
import { CategoryListComponent } from './components/category-list/category-list';
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

  { 
    path: 'categories', 
    component: CategoryListComponent, // Create this component next
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/accounts', pathMatch: 'full' },
  { path: '**', redirectTo: '/accounts' }
];
