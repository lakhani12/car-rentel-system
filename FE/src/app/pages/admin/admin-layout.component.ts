import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
        <div class="min-h-screen bg-gray-100 flex flex-col">
            <!-- Admin Nav -->
            <nav class="bg-gray-800 text-white shadow-md">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 font-bold text-xl text-blue-400">
                                CarRental Admin
                            </div>
                            <div class="hidden md:block">
                                <div class="ml-10 flex items-baseline space-x-4">
                                    <a routerLink="/admin/dashboard" routerLinkActive="bg-gray-900 text-white" 
                                       class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors">
                                        Dashboard
                                    </a>
                                    <a routerLink="/admin/cars" routerLinkActive="bg-gray-900 text-white" 
                                       class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors">
                                        Manage Cars
                                    </a>
                                    <a routerLink="/admin/bookings" routerLinkActive="bg-gray-900 text-white" 
                                       class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors">
                                        Bookings
                                    </a>
                                    <a routerLink="/admin/customers" routerLinkActive="bg-gray-900 text-white" 
                                       class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors">
                                        Customers
                                    </a>
                                    <a routerLink="/"
                                       class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white text-gray-300 transition-colors">
                                        Visit Site
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div>
                            <a routerLink="/profile" class="text-sm text-gray-300 hover:text-white mr-4">My Profile</a>
                            <button (click)="authService.logout()" class="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <div class="flex-grow">
                 <router-outlet></router-outlet>
            </div>
        </div>
    `
})
export class AdminLayoutComponent {
    authService = inject(AuthService);
}
