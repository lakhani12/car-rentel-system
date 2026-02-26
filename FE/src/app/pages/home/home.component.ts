import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Car, CarService } from '../../services/car.service';
import { Observable, combineLatest, map, startWith, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
    carService = inject(CarService);

    // State for Search
    locationQuery = signal('');
    pickupDate = signal('');
    dropoffDate = signal('');

    // Hero Gallery State
    heroImages = [
        'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', // Premium Sports Car (Porsche)
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',  // Luxury Sedan
        'https://images.unsplash.com/photo-1503376766063-da86311ceaf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', // Sports Car Scene
        'https://images.unsplash.com/photo-1621287477969-95963c631980?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'  // Luxury SUV
    ];
    currentHeroImageIndex = signal(0);
    private intervalId: any;

    ngOnInit() {
        // Start auto-scrolling hero images every 4 seconds
        this.intervalId = setInterval(() => {
            this.currentHeroImageIndex.update(index => (index + 1) % this.heroImages.length);
        }, 4000);
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    // Observable of all cars
    allCars$: Observable<Car[]> = this.carService.getCars();

    // Subject to trigger manual search
    private searchTrigger = new BehaviorSubject<string>('');

    // Derived observable that filters cars
    filteredCars$: Observable<Car[]> = combineLatest([
        this.allCars$,
        this.searchTrigger
    ]).pipe(
        map(([cars, query]) => {
            if (!query || query.trim() === '') {
                return cars;
            }
            const lowercaseQuery = query.toLowerCase().trim();
            return cars.filter(car =>
                car.name.toLowerCase().includes(lowercaseQuery) ||
                car.category.toLowerCase().includes(lowercaseQuery)
            );
        })
    );

    onSearch() {
        this.searchTrigger.next(this.locationQuery());
        // Scroll to the featured section
        document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
    }
}
