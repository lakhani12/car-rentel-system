import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdminCarsComponent } from './pages/admin/admin-cars.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { AdminBookingsComponent } from './pages/admin/admin-bookings/admin-bookings.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminCustomersComponent } from './pages/admin/admin-customers/admin-customers.component';
import { RegisterComponent } from './pages/register/register.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { adminGuard } from './guards/admin.guard';
import { AdminLoginComponent } from './pages/admin/admin-login/admin-login';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'cars', component: AdminCarsComponent },
            { path: 'bookings', component: AdminBookingsComponent },
            { path: 'customers', component: AdminCustomersComponent }
        ]
    },
    { path: 'login', component: LoginComponent },
    { path: 'admin-login', component: AdminLoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'cars/:id', component: CarDetailsComponent },
    { path: 'my-bookings', component: MyBookingsComponent },
    { path: 'profile', component: ProfileComponent }
];
