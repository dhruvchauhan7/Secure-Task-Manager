import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

type LoginResponse = { accessToken: string };

@Component({
    selector: 'stm-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
  })
  
export class LoginComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  email = 'owner@demo.com';
  password = 'Owner123!';
  error = '';

  private readonly API = 'http://localhost:3000/api';

  submit() {
    this.error = '';

    this.http
      .post<LoginResponse>(`${this.API}/auth/login`, {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          this.auth.setToken(res.accessToken);
          this.router.navigateByUrl('/tasks');
        },
        error: () => {
          this.error = 'Login failed';
        },
      });
  }
}
