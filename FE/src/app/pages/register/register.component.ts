import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html'
})
export class RegisterComponent {
    authService = inject(AuthService);
    router = inject(Router);

    name = signal('');
    email = signal('');
    password = signal('');
    confirmPassword = signal('');
    errorMessage = signal('');

    async handleRegister() {
        if (this.password() !== this.confirmPassword()) {
            this.errorMessage.set('Passwords do not match');
            return;
        }

        try {
            const credential = await this.authService.register(this.email(), this.password());
            if (credential.user) {
                await this.authService.createUserProfile(
                    credential.user.uid,
                    this.email(),
                    this.name(),
                    'user'
                );

                this.router.navigate(['/']);
            }
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use' || error.message.includes('email-already-in-use')) {
                this.errorMessage.set('Account already exists. Please Login.');
            } else {
                this.errorMessage.set(error.message || 'Registration failed');
            }
        }
    }
}
