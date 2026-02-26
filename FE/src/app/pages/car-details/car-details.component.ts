import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Car, CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { BookingService, Booking } from '../../services/booking.service';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-car-details',
    standalone: true,
    imports: [CommonModule, FormsModule],
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

    constructor() {
        this.route.paramMap.pipe(
            map(params => params.get('id')),
            switchMap(id => {
                if (id) {
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

        this.isBooking.set(true);

        const booking: Booking = {
            carId: this.car()!.id!,
            userId: currentUser.uid,
            userEmail: currentUser.email || 'Unknown',
            startDate: this.startDate(),
            endDate: this.endDate(),
            totalPrice: this.totalPrice(),
            status: 'pending',
            createdAt: new Date()
        };

        // Optimistic UI: Don't wait for server
        this.bookingService.createBooking(booking).then(() => {
            console.log('Booking synced to server');
        }).catch(err => {
            console.error('Booking sync failed', err);
        });

        alert('Booking Confirmed! Total: ₹' + this.totalPrice());
        this.router.navigate(['/my-bookings']);
        this.isBooking.set(false);
    }
}
