import { Routes } from '@angular/router';
import { AccountListComponent } from './components/account-list/account-list';
import { CreateAccountComponent } from './components/create-account/create-account'; // ← Add this import

export const routes: Routes = [
  { path: '', redirectTo: '/accounts', pathMatch: 'full' },
  { path: 'accounts', component: AccountListComponent },
  { path: 'accounts/create', component: CreateAccountComponent }, // ← Add this route
];
