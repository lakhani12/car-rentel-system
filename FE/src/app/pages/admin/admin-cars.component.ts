import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car, CarService } from '../../services/car.service';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-admin-cars',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-cars.component.html'
})
export class AdminCarsComponent implements OnInit {
    carService = inject(CarService);
    projectId = environment.firebase.projectId;

    // Data state
    cars = signal<Car[]>([]);
    dbStatus = signal<'connecting' | 'connected' | 'error'>('connecting');
    dbErrorMessage = signal('');

    // Form state
    name = signal('');
    category = signal('');
    price = signal(0);
    image = signal('');
    images = signal<string[]>([]);
    transmission = signal<'Automatic' | 'Manual'>('Automatic');
    fuelType = signal<'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'>('Petrol');
    seats = signal(4);
    description = signal('');
    editingId = signal<string | null>(null);

    // UI state
    isLoading = signal(false);

    ngOnInit() {
        this.loadCars();
    }

    loadCars() {
        this.dbStatus.set('connecting');
        this.carService.getCars().subscribe({
            next: (data) => {
                this.cars.set(data);
                this.dbStatus.set('connected');
            },
            error: (err) => {
                console.error('Firestore Read Error:', err);
                this.dbStatus.set('error');
                this.dbErrorMessage.set(err.message || 'Unknown permission error. Check Firebase Rules.');
            }
        });
    }

    async handleSubmit() {
        this.isLoading.set(true);

        if (!this.name() || !this.category() || !this.price() || !this.image()) {
            alert('Please fill in required fields');
            this.isLoading.set(false);
            return;
        }

        const carData: Car = {
            name: this.name(),
            category: this.category(),
            price: this.price(),
            image: this.image(),
            images: this.images().filter(img => img.trim() !== ''),
            transmission: this.transmission(),
            fuelType: this.fuelType(),
            seats: this.seats(),
            description: this.description() || ''
        };

        try {
            if (this.editingId()) {
                await this.carService.updateCar(this.editingId()!, carData);
                alert('Car updated successfully!');
            } else {
                await this.carService.addCar(carData);
                alert('Car added successfully!');
            }
            this.resetForm();
        } catch (error: any) {
            console.error('DATABASE ERROR:', error);
            alert('DATABASE ERROR: ' + (error.message || error));
            this.dbStatus.set('error');
            this.dbErrorMessage.set(error.message);
        } finally {
            this.isLoading.set(false);
        }
    }

    editCar(car: Car) {
        this.editingId.set(car.id!);
        this.name.set(car.name);
        this.category.set(car.category);
        this.price.set(car.price);
        this.image.set(car.image);
        this.images.set(car.images || []);
        this.transmission.set(car.transmission || 'Automatic');
        this.fuelType.set(car.fuelType || 'Petrol');
        this.seats.set(car.seats || 4);
        this.description.set(car.description || '');
    }

    async deleteCar(id: string) {
        if (confirm('Are you sure?')) {
            try {
                await this.carService.deleteCar(id);
            } catch (error: any) {
                alert('Delete failed: ' + error.message);
            }
        }
    }

    resetForm() {
        this.editingId.set(null);
        this.name.set('');
        this.category.set('');
        this.price.set(0);
        this.image.set('');
        this.images.set([]);
        this.transmission.set('Automatic');
        this.fuelType.set('Petrol');
        this.seats.set(4);
        this.description.set('');
        this.isLoading.set(false);
    }

    addImage() {
        this.images.update(imgs => [...imgs, '']);
    }

    updateImage(index: number, value: string) {
        this.images.update(imgs => {
            const newImgs = [...imgs];
            newImgs[index] = value;
            return newImgs;
        });
    }

    removeImage(index: number) {
        this.images.update(imgs => imgs.filter((_, i) => i !== index));
    }
}
