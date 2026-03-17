import { Component} from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule
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
