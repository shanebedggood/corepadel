import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class FormErrorService {

    /**
     * Scroll to the first invalid field in a form
     */
    scrollToFirstError(form: FormGroup): void {
        const firstErrorField = this.getFirstErrorField(form);
        if (firstErrorField) {
            this.scrollToElement(firstErrorField);
        }
    }

    /**
     * Get the first invalid field element
     */
    private getFirstErrorField(form: FormGroup): HTMLElement | null {
        for (const controlName of Object.keys(form.controls)) {
            const control = form.get(controlName);
            if (control && control.invalid && control.touched) {
                const element = document.querySelector(`[formControlName="${controlName}"]`) as HTMLElement;
                if (element) {
                    return element;
                }
                
                // Fallback: try to find by name attribute
                const elementByName = document.querySelector(`[name="${controlName}"]`) as HTMLElement;
                if (elementByName) {
                    return elementByName;
                }
            }
        }
        return null;
    }

    /**
     * Scroll to a specific element
     */
    private scrollToElement(element: HTMLElement): void {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        
        // Focus the element after scrolling
        setTimeout(() => {
            element.focus();
        }, 300);
    }

    /**
     * Mark all form controls as touched to trigger validation display
     */
    markAllControlsAsTouched(form: FormGroup): void {
        Object.keys(form.controls).forEach(key => {
            const control = form.get(key);
            if (control) {
                control.markAsTouched();
            }
        });
    }

    /**
     * Check if form has any errors
     */
    hasFormErrors(form: FormGroup): boolean {
        return !form.valid && Object.keys(form.controls).some(key => {
            const control = form.get(key);
            return control && control.invalid && control.touched;
        });
    }

    /**
     * Get all form errors as a summary
     */
    getFormErrorsSummary(form: FormGroup): string[] {
        const errors: string[] = [];
        
        Object.keys(form.controls).forEach(key => {
            const control = form.get(key);
            if (control && control.invalid && control.touched) {
                const fieldName = this.getFieldDisplayName(key);
                const errorMessage = this.getControlErrorMessage(control, fieldName);
                if (errorMessage) {
                    errors.push(errorMessage);
                }
            }
        });
        
        return errors;
    }

    /**
     * Get display name for a field (converts camelCase to readable format)
     */
    private getFieldDisplayName(fieldName: string): string {
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Get error message for a specific control
     */
    private getControlErrorMessage(control: AbstractControl, fieldName: string): string {
        if (!control.errors) return '';

        const errors = control.errors;
        
        if (errors['required']) {
            return `${fieldName} is required.`;
        }
        
        if (errors['email']) {
            return 'Please enter a valid email address.';
        }
        
        if (errors['minlength']) {
            const requiredLength = errors['minlength'].requiredLength;
            return `${fieldName} must be at least ${requiredLength} characters long.`;
        }
        
        if (errors['maxlength']) {
            const requiredLength = errors['maxlength'].requiredLength;
            return `${fieldName} must not exceed ${requiredLength} characters.`;
        }
        
        if (errors['min']) {
            const min = errors['min'].min;
            return `${fieldName} must be at least ${min}.`;
        }
        
        if (errors['max']) {
            const max = errors['max'].max;
            return `${fieldName} must not exceed ${max}.`;
        }
        
        if (errors['pattern']) {
            return `${fieldName} format is invalid.`;
        }
        
        if (errors['custom']) {
            return errors['custom'].message || 'Invalid value.';
        }
        
        return `${fieldName} is invalid.`;
    }
}
