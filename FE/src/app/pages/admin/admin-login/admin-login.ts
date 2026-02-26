import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  async handleLogin() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const credential = await this.authService.login(this.email(), this.password());
      if (credential.user) {
        const profile = await this.authService.getUserProfile(credential.user.uid);

        if (profile && profile.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          // If a standard user tries to log in here, deny access and log them out
          await this.authService.logout();
          this.errorMessage.set('Access Denied: Administrator privileges required.');
        }
      }
    } catch (error: any) {
      console.error('Admin Login Error:', error);
      if (error.code === 'auth/invalid-credential' || error.message.includes('invalid-credential')) {
        this.errorMessage.set('Invalid admin credentials.');
      } else {
        this.errorMessage.set(error.message || 'Login failed');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
