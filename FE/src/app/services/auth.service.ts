import { Injectable, inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    createdAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private firestore = inject(Firestore); // New injection
    private router = inject(Router);

    user$: Observable<User | null> = user(this.auth);
    currentUser = signal<User | null>(null);

    constructor() {
        this.user$.subscribe(u => this.currentUser.set(u));
    }

    register(email: string, pass: string) {
        return createUserWithEmailAndPassword(this.auth, email, pass);
    }

    async createUserProfile(uid: string, email: string, name: string, role: 'admin' | 'user') {
        const userRef = doc(this.firestore, 'users', uid);
        await setDoc(userRef, {
            uid,
            email,
            name,
            role,
            createdAt: new Date()
        });
    }

    async getUserProfile(uid: string): Promise<UserProfile | null> {
        const userRef = doc(this.firestore, 'users', uid);
        const snapshot = await getDoc(userRef);
        return snapshot.exists() ? snapshot.data() as UserProfile : null;
    }

    login(email: string, pass: string) {
        return signInWithEmailAndPassword(this.auth, email, pass);
    }

    logout() {
        return signOut(this.auth).then(() => this.router.navigate(['/']));
    }
}
