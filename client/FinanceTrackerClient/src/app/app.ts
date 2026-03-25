import { Component} from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu'; 
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
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
