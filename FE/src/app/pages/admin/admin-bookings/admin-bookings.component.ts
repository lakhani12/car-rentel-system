import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '../../../services/booking.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-admin-bookings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-bookings.component.html',
    providers: [DatePipe]
})
export class AdminBookingsComponent implements OnInit {
    bookingService = inject(BookingService);
    bookings = signal<Booking[]>([]);

    async ngOnInit() {
        this.loadBookings();
    }

    loadBookings() {
        this.bookingService.getAllBookings().subscribe(data => {
            this.bookings.set(data);
        });
    }

    async updateStatus(id: string, status: 'confirmed' | 'cancelled') {
        try {
            await this.bookingService.updateBookingStatus(id, status);
            // Optionally reload or let usage of observable handle it if realtime
            // Ideally getAllBookings should be an observable stream
        } catch (error) {
            console.error('Error updating status', error);
            alert('Failed to update status');
        }
    }
}
