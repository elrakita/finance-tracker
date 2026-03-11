import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true, // Ensure this is present
  imports: [
    RouterOutlet, 
    RouterLink,       // Required for routerLink="/login"
    MatToolbarModule, // Fixes mat-toolbar error
    MatButtonModule   // Fixes mat-button error
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'FinanceTrackerClient';

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('auth-token');
  }

  onLogout() {
    localStorage.removeItem('auth-token');
  }
}
