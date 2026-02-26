import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, DocumentReference, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Car {
    id?: string;
    name: string;
    category: string;
    price: number;
    image: string;
    images?: string[]; // Array of additional image URLs
    transmission: 'Automatic' | 'Manual';
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    seats: number;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CarService {
    private firestore = inject(Firestore);

    getCars(): Observable<Car[]> {
        return new Observable((observer) => {
            const carsCollection = collection(this.firestore, 'cars');
            const unsubscribe = onSnapshot(carsCollection, (snapshot) => {
                const cars = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Car[];
                observer.next(cars);
            }, (error) => {
                observer.error(error);
            });
            return () => unsubscribe();
        });
    }

    addCar(car: Car): Promise<DocumentReference> {
        const carsCollection = collection(this.firestore, 'cars');
        return addDoc(carsCollection, car as any);
    }

    updateCar(id: string, data: Partial<Car>): Promise<void> {
        const docRef = doc(this.firestore, 'cars', id);
        return updateDoc(docRef, data);
    }

    deleteCar(id: string): Promise<void> {
        const docRef = doc(this.firestore, 'cars', id);
        return deleteDoc(docRef);
    }
}
