import { Component} from '@angular/core';
import { RouterOutlet, Router } from '@angular/router'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true, // Ensure this is present
  imports: [
    RouterOutlet, 
    MatToolbarModule, // Fixes mat-toolbar error
    MatButtonModule   // Fixes mat-button error
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(
    protected route: Router
  ) { }

  protected title = 'FinanceTrackerClient';

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('auth-token');
  }

  onLogout() {
    localStorage.removeItem('auth-token');
    this.route.navigate(['/login']);
  }
}
