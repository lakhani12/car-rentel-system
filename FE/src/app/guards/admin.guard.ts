import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take } from 'rxjs/operators';
import { from, of } from 'rxjs'; // Import from and of

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.user$.pipe(
        take(1),
        switchMap(user => {
            if (!user) {
                return of(router.createUrlTree(['/login']));
            }
            // Fetch profile to check role
            return from(authService.getUserProfile(user.uid)).pipe(
                map(profile => {
                    if (profile && profile.role === 'admin') {
                        return true;
                    } else {
                        // Redirect if logged in but not admin
                        return router.createUrlTree(['/']);
                    }
                })
            );
        })
    );
};
