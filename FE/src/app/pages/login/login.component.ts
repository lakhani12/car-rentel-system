import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    authService = inject(AuthService);
    router = inject(Router);

    email = signal('');
    password = signal('');
    errorMessage = signal('');

    async handleLogin() {
        try {
            const credential = await this.authService.login(this.email(), this.password());
            if (credential.user) {
                const profile = await this.authService.getUserProfile(credential.user.uid);
                if (profile && profile.role === 'admin') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/']);
                }
            }
        } catch (error: any) {
            console.error('Login Error:', error);
            if (error.code === 'auth/invalid-credential' || error.message.includes('invalid-credential')) {
                this.errorMessage.set('Account not found or wrong password. Please Register first if you are new.');
            } else {
                this.errorMessage.set(error.message || 'Login failed');
            }
        }
    }
}
