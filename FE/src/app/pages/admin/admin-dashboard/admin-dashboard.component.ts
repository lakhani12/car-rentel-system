import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarService } from '../../../services/car.service';
import { BookingService, Booking } from '../../../services/booking.service';
import { combineLatest } from 'rxjs';

interface CustomerStat {
    email: string;
    totalSpent: number;
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-dashboard.component.html',
    providers: [DatePipe]
})
export class AdminDashboardComponent implements OnInit {
    carService = inject(CarService);
    bookingService = inject(BookingService);

    totalCars = signal(0);
    totalBookings = signal(0);
    totalRevenue = signal(0);
    pendingBookings = signal(0);
    recentBookings = signal<Booking[]>([]);
    topCustomers = signal<CustomerStat[]>([]);

    ngOnInit() {
        console.log('Admin Dashboard Initialized - Version 2');
        this.fetchData();
    }

    fetchData() {
        combineLatest([
            this.carService.getCars(),
            this.bookingService.getAllBookings()
        ]).subscribe({
            next: ([cars, bookings]) => {
                try {
                    console.log('Dashboard Data:', { cars: cars.length, bookings: bookings.length });
                    this.totalCars.set(cars.length);
                    this.totalBookings.set(bookings.length);

                    const revenue = bookings
                        .filter(b => b.status === 'confirmed')
                        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                    this.totalRevenue.set(revenue);

                    const pending = bookings.filter(b => b.status === 'pending').length;
                    this.pendingBookings.set(pending);

                    // Robust Date Parser
                    const getDate = (date: any) => {
                        if (!date) return new Date();
                        if (date instanceof Date) return date;
                        if (typeof date === 'object' && date.seconds) return new Date(date.seconds * 1000);
                        return new Date(date);
                    };

                    // Recent Bookings
                    const sortedBookings = [...bookings].sort((a, b) => {
                        return getDate(b.createdAt).getTime() - getDate(a.createdAt).getTime();
                    });
                    this.recentBookings.set(sortedBookings.slice(0, 5));

                    // Top Customers
                    const customerMap = new Map<string, CustomerStat>();
                    bookings.forEach(b => {
                        const email = b.userEmail;
                        if (!email) return;

                        // Create new object to avoid reference issues or reuse existing
                        let current = customerMap.get(email);
                        if (!current) {
                            current = { email, totalSpent: 0 };
                        }

                        if (b.status === 'confirmed') {
                            current.totalSpent += (b.totalPrice || 0);
                        }
                        customerMap.set(email, current);
                    });

                    const customers = Array.from(customerMap.values());
                    customers.sort((a, b) => b.totalSpent - a.totalSpent);
                    this.topCustomers.set(customers.slice(0, 5));

                } catch (error) {
                    console.error('Error processing dashboard data:', error);
                }
            },
            error: (err) => console.error('Failed to fetch dashboard data:', err)
        });
    }
}
