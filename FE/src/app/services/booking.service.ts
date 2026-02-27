import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, doc, updateDoc, orderBy, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Booking {
    id?: string;
    carId: string;
    userId: string;
    userEmail: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentMethod?: string;
    paymentStatus?: 'paid' | 'unpaid';
    createdAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private firestore = inject(Firestore);

    async createBooking(booking: Booking): Promise<void> {
        const bookingsCollection = collection(this.firestore, 'bookings');
        await addDoc(bookingsCollection, booking);
    }

    getUserBookings(userId: string): Observable<Booking[]> {
        return new Observable((observer) => {
            const bookingsCollection = collection(this.firestore, 'bookings');
            const q = query(bookingsCollection, where('userId', '==', userId));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const bookings = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Booking[];
                observer.next(bookings);
            }, (error) => {
                observer.error(error);
            });
            return () => unsubscribe();
        });
    }

    getAllBookings(): Observable<Booking[]> {
        return new Observable((observer) => {
            const bookingsCollection = collection(this.firestore, 'bookings');
            const q = query(bookingsCollection, orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const bookings = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Booking[];
                observer.next(bookings);
            }, (error) => {
                observer.error(error);
            });
            return () => unsubscribe();
        });
    }

    getCarBookings(carId: string): Observable<Booking[]> {
        return new Observable((observer) => {
            const bookingsCollection = collection(this.firestore, 'bookings');
            const q = query(bookingsCollection, where('carId', '==', carId));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const bookings = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Booking[];
                observer.next(bookings);
            }, (error) => {
                observer.error(error);
            });
            return () => unsubscribe();
        });
    }

    async updateBookingStatus(id: string, status: 'confirmed' | 'cancelled'): Promise<void> {
        const docRef = doc(this.firestore, 'bookings', id);
        await updateDoc(docRef, { status });
    }
}
