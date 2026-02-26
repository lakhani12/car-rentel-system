import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService, UserProfile } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, DatePipe],
    template: `
    <div class="max-w-4xl mx-auto p-6">
        <h2 class="text-3xl font-bold mb-8 text-gray-800">My Profile</h2>

        <div class="bg-white rounded-lg shadow-md overflow-hidden" *ngIf="profile(); else loading">
            <div class="bg-gray-800 px-6 py-4">
                <div class="flex items-center">
                    <div class="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                        {{ getInitials(profile()!.name) }}
                    </div>
                    <div class="ml-4">
                        <h3 class="text-xl font-bold text-white">{{ profile()?.name }}</h3>
                        <p class="text-gray-300">{{ profile()?.email }}</p>
                    </div>
                </div>
            </div>
            
            <div class="p-6">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ profile()?.name }}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Email Address</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ profile()?.email }}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Role</dt>
                        <dd class="mt-1 text-sm text-gray-900 px-2 py-1 bg-gray-100 rounded inline-block uppercase text-xs font-bold tracking-wider">
                            {{ profile()?.role }}
                        </dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Member Since</dt>
                        <dd class="mt-1 text-sm text-gray-900">
                             {{ profile()?.createdAt | date:'mediumDate' }}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>

        <ng-template #loading>
            <div class="text-center py-10 text-gray-500">Loading profile...</div>
        </ng-template>
    </div>
  `
})
export class ProfileComponent implements OnInit {
    authService = inject(AuthService);
    profile = signal<UserProfile | null>(null);

    ngOnInit() {
        this.authService.user$.subscribe(user => {
            if (user) {
                this.authService.getUserProfile(user.uid).then(p => {
                    const profileData = p || {
                        uid: user.uid,
                        email: user.email || '',
                        name: 'User',
                        role: 'user', // Default for legacy users
                        createdAt: new Date()
                    };

                    // Handle Timestamp if date comes from Firestore as object
                    if (profileData.createdAt && typeof (profileData.createdAt as any).seconds === 'number') {
                        profileData.createdAt = new Date((profileData.createdAt as any).seconds * 1000);
                    }

                    this.profile.set(profileData);
                });
            }
        });
    }

    getInitials(name: string): string {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
}
