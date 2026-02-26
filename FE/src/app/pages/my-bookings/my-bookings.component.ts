import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { BookingService, Booking } from '../../services/booking.service';
import { CarService } from '../../services/car.service';
import { switchMap, map, tap } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './my-bookings.component.html'
})
export class MyBookingsComponent {
    authService = inject(AuthService);
    bookingService = inject(BookingService);
    carService = inject(CarService);

    bookingsWithCarInfo$ = this.authService.user$.pipe(
        switchMap(user => {
            if (!user) return of([]);

            return combineLatest([
                this.bookingService.getUserBookings(user.uid),
                this.carService.getCars()
            ]).pipe(
                tap(([bookings, cars]) => console.log('DEBUG: Bookings from DB:', bookings, 'Cars:', cars)),
                map(([bookings, cars]) => {
                    return bookings.map(booking => {
                        const car = cars.find(c => c.id === booking.carId);
                        return {
                            ...booking,
                            carName: car?.name || 'Unknown Car',
                            carImage: car?.image
                        };
                    });
                })
            );
        })
    );

    async cancelBooking(bookingId: string | undefined) {
        if (!bookingId) return;

        const confirmed = window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.');
        if (confirmed) {
            try {
                await this.bookingService.updateBookingStatus(bookingId, 'cancelled');
            } catch (error) {
                console.error('Error cancelling booking:', error);
                alert('Failed to cancel the booking. Please try again.');
            }
        }
    }
}
