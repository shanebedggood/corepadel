import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
    selector: 'app-form-field-error',
    standalone: true,
    imports: [CommonModule],
    template: `
        @if (shouldShowError()) {
            <small class="p-error mt-1 block">
                {{ getErrorMessage() }}
            </small>
        }
    `,
    styles: [`
        .p-error {
            color: #e24c4c;
            font-size: 0.875rem;
            line-height: 1.25rem;
        }
    `]
})
export class FormFieldErrorComponent {
    @Input() control!: AbstractControl | null;
    @Input() fieldName: string = 'Field';
    @Input() showOnSubmit: boolean = false;
    @Input() submitted: boolean = false;

    shouldShowError(): boolean {
        if (!this.control) return false;
        
        if (this.showOnSubmit) {
            return this.submitted && this.control.invalid && this.control.touched;
        }
        
        return this.control.invalid && this.control.touched;
    }

    getErrorMessage(): string {
        if (!this.control || !this.control.errors) return '';

        const errors = this.control.errors;
        
        if (errors['required']) {
            return `${this.fieldName} is required.`;
        }
        
        if (errors['email']) {
            return 'Please enter a valid email address.';
        }
        
        if (errors['minlength']) {
            const requiredLength = errors['minlength'].requiredLength;
            return `${this.fieldName} must be at least ${requiredLength} characters long.`;
        }
        
        if (errors['maxlength']) {
            const requiredLength = errors['maxlength'].requiredLength;
            return `${this.fieldName} must not exceed ${requiredLength} characters.`;
        }
        
        if (errors['min']) {
            const min = errors['min'].min;
            return `${this.fieldName} must be at least ${min}.`;
        }
        
        if (errors['max']) {
            const max = errors['max'].max;
            return `${this.fieldName} must not exceed ${max}.`;
        }
        
        if (errors['pattern']) {
            return `${this.fieldName} format is invalid.`;
        }
        
        if (errors['custom']) {
            return errors['custom'].message || 'Invalid value.';
        }
        
        // Default fallback
        return `${this.fieldName} is invalid.`;
    }
}
