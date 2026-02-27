import { Component, inject, signal, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Car, CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { BookingService, Booking } from '../../services/booking.service';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { map, switchMap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

@Component({
    selector: 'app-car-details',
    standalone: true,
    imports: [CommonModule, FormsModule, PaymentModalComponent],
    templateUrl: './car-details.component.html'
})
export class CarDetailsComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private carService = inject(CarService);
    authService = inject(AuthService);
    private bookingService = inject(BookingService);

    car = signal<Car | null>(null);
    currentImage = signal<string>('');

    // Booking Form State
    startDate = signal('');
    endDate = signal('');
    totalPrice = signal(0);
    isBooking = signal(false);

    // Availability State
    existingBookings = signal<Booking[]>([]);
    isDateConflict = signal(false);
    private bookingsSub?: Subscription;

    // Payment Modal State
    showPaymentModal = signal(false);

    constructor() {
        this.route.paramMap.pipe(
            map(params => params.get('id')),
            switchMap(id => {
                if (id) {
                    // Fetch existing bookings for this car to check availability
                    if (this.bookingsSub) this.bookingsSub.unsubscribe();
                    this.bookingsSub = this.bookingService.getCarBookings(id).subscribe(bookings => {
                        this.existingBookings.set(bookings);
                        this.checkAvailability();
                    });

                    // In a real app we would fetch single doc, but reusing getCars for simplicity in this MVP
                    return this.carService.getCars().pipe(
                        map(cars => cars.find(c => c.id === id) || null)
                    );
                }
                return of(null);
            })
        ).subscribe(car => {
            this.car.set(car);
            if (car) {
                this.currentImage.set(car.image);
            }
        });

        // Effect to re-check availability whenever dates change
        effect(() => {
            this.startDate();
            this.endDate();
            this.checkAvailability();
        }, { allowSignalWrites: true });
    }

    ngOnDestroy() {
        if (this.bookingsSub) {
            this.bookingsSub.unsubscribe();
        }
    }

    checkAvailability() {
        if (!this.startDate() || !this.endDate()) {
            this.isDateConflict.set(false);
            return;
        }

        const requestedStart = new Date(this.startDate());
        const requestedEnd = new Date(this.endDate());
        requestedStart.setHours(0, 0, 0, 0);
        requestedEnd.setHours(23, 59, 59, 999);

        // Ensure end date is after start date
        if (requestedEnd < requestedStart) {
            this.isDateConflict.set(true);
            return;
        }

        const hasConflict = this.existingBookings().some(booking => {
            // Ignore cancelled bookings
            if (booking.status === 'cancelled') return false;

            const existingStart = new Date(booking.startDate);
            const existingEnd = new Date(booking.endDate);
            existingStart.setHours(0, 0, 0, 0);
            existingEnd.setHours(23, 59, 59, 999);

            // Two date ranges overlap if: (StartA <= EndB) and (EndA >= StartB)
            return (requestedStart <= existingEnd) && (requestedEnd >= existingStart);
        });

        this.isDateConflict.set(hasConflict);
    }

    calculatePrice() {
        if (this.startDate() && this.endDate() && this.car()) {
            const start = new Date(this.startDate());
            const end = new Date(this.endDate());
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                this.totalPrice.set(diffDays * this.car()!.price);
            } else {
                this.totalPrice.set(0);
            }
        }
    }

    async bookCar() {
        const currentUser = this.authService.currentUser();
        if (!currentUser) {
            alert('Please login to book a car');
            this.router.navigate(['/login']);
            return;
        }

        if (!this.startDate() || !this.endDate()) {
            alert('Please select valid dates');
            return;
        }

        if (this.isDateConflict()) {
            alert('The selected dates are currently unavailable. Please choose different dates.');
            return;
        }

        // Open Payment Modal instead of instantly booking
        this.showPaymentModal.set(true);
    }

    onPaymentSuccess(event: { method: string }) {
        this.showPaymentModal.set(false);
        this.isBooking.set(true);

        const currentUser = this.authService.currentUser()!;

        const booking: Booking = {
            carId: this.car()!.id!,
            userId: currentUser.uid,
            userEmail: currentUser.email || 'Unknown',
            startDate: this.startDate(),
            endDate: this.endDate(),
            totalPrice: this.totalPrice(),
            status: 'pending',
            paymentMethod: event.method,
            paymentStatus: 'paid',
            createdAt: new Date()
        };

        // Optimistic UI: Don't wait for server
        this.bookingService.createBooking(booking).then(() => {
            // Reset form
            this.startDate.set('');
            this.endDate.set('');
            this.totalPrice.set(0);
        }).catch(err => {
            console.error('Booking sync failed', err);
        });

        alert('Booking Confirmed! Total: ₹' + this.totalPrice());
        this.router.navigate(['/my-bookings']);
        this.isBooking.set(false);
    }
}
