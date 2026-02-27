import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-payment-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './payment-modal.component.html'
})
export class PaymentModalComponent {
    @Input() isOpen = false;
    @Input() amount = 0;
    @Output() close = new EventEmitter<void>();
    @Output() paymentSuccess = new EventEmitter<{ method: string }>();

    paymentMethod = signal<'card' | 'upi'>('card');
    isProcessing = signal(false);
    isSuccess = signal(false);

    // Card Details
    cardNumber = signal('');
    expiry = signal('');
    cvc = signal('');
    cardName = signal('');

    // UPI Details
    upiId = signal('');

    closeModal() {
        if (!this.isProcessing() && !this.isSuccess()) {
            this.close.emit();
        }
    }

    setMethod(method: 'card' | 'upi') {
        if (!this.isProcessing()) {
            this.paymentMethod.set(method);
        }
    }

    async processPayment() {
        // Basic Validation
        if (this.paymentMethod() === 'card' && (!this.cardNumber() || !this.expiry() || !this.cvc())) {
            alert('Please fill out all card details (mock)');
            return;
        }
        if (this.paymentMethod() === 'upi' && !this.upiId()) {
            alert('Please enter your UPI ID');
            return;
        }

        this.isProcessing.set(true);

        // Simulate network request/gateway processing
        await new Promise(resolve => setTimeout(resolve, 2500));

        this.isProcessing.set(false);
        this.isSuccess.set(true);

        // Show success state briefly then emit
        setTimeout(() => {
            this.paymentSuccess.emit({ method: this.paymentMethod() });
            // Reset state
            this.isSuccess.set(false);
            this.cardNumber.set('');
            this.expiry.set('');
            this.cvc.set('');
            this.cardName.set('');
            this.upiId.set('');
        }, 1500);
    }
}
