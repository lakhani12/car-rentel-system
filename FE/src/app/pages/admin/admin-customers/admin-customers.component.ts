import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '../../../services/booking.service';

interface CustomerStat {
    email: string;
    totalBookings: number;
    totalSpent: number;
    lastBookingDate: Date;
}

@Component({
    selector: 'app-admin-customers',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-customers.component.html'
})
export class AdminCustomersComponent implements OnInit {
    bookingService = inject(BookingService);
    customers = signal<CustomerStat[]>([]);

    ngOnInit() {
        this.bookingService.getAllBookings().subscribe(bookings => {
            this.processCustomers(bookings);
        });
    }

    processCustomers(bookings: Booking[]) {
        const customerMap = new Map<string, CustomerStat>();

        bookings.forEach(booking => {
            const email = booking.userEmail;
            if (!email) return;

            const current = customerMap.get(email) || {
                email,
                totalBookings: 0,
                totalSpent: 0,
                lastBookingDate: new Date(0) // Epoch
            };

            current.totalBookings++;
            if (booking.status === 'confirmed') {
                current.totalSpent += (booking.totalPrice || 0);
            }

            const bookingDate = booking.createdAt instanceof Date ? booking.createdAt : new Date((booking.createdAt as any)['seconds'] * 1000 || booking.createdAt); // Handle Firestore Timestamp

            if (bookingDate > current.lastBookingDate) {
                current.lastBookingDate = bookingDate;
            }

            customerMap.set(email, current);
        });

        this.customers.set(Array.from(customerMap.values()));
    }
}
