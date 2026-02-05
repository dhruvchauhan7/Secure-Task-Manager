import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'stm-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'dashboard';

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // current logged-in user (or null)
  user = computed(() => this.auth.getUser());

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
