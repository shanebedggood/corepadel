import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormErrorService } from '../services/form-error.service';

@Directive({
    selector: '[appFormSubmitUx]',
    standalone: true
})
export class FormSubmitUxDirective {
    @Input() appFormSubmitUx!: FormGroup;
    @Input() scrollToFirstError: boolean = true;
    @Input() showValidationOnSubmit: boolean = true;
    @Input() disableSubmitUntilValid: boolean = false;
    
    @Output() formSubmitAttempt = new EventEmitter<boolean>();
    @Output() formValid = new EventEmitter<boolean>();

    private submitted: boolean = false;

    constructor(private formErrorService: FormErrorService) {}

    @HostListener('submit', ['$event'])
    onSubmit(event: Event): void {
        if (!this.appFormSubmitUx) {
            console.warn('FormSubmitUxDirective: FormGroup is required');
            return;
        }

        this.submitted = true;
        this.formSubmitAttempt.emit(true);

        if (this.showValidationOnSubmit) {
            this.formErrorService.markAllControlsAsTouched(this.appFormSubmitUx);
        }

        if (this.appFormSubmitUx.invalid) {
            event.preventDefault();
            
            if (this.scrollToFirstError) {
                this.formErrorService.scrollToFirstError(this.appFormSubmitUx);
            }
            
            // Show form errors summary
            const errors = this.formErrorService.getFormErrorsSummary(this.appFormSubmitUx);
            if (errors.length > 0) {
                console.warn('Form validation errors:', errors);
            }
            
            this.formValid.emit(false);
            return;
        }

        this.formValid.emit(true);
    }

    /**
     * Check if form should be disabled based on validation state
     */
    shouldDisableSubmit(): boolean {
        if (!this.disableSubmitUntilValid) return false;
        if (!this.appFormSubmitUx) return true;
        
        return this.appFormSubmitUx.invalid;
    }

    /**
     * Get the submitted state
     */
    isSubmitted(): boolean {
        return this.submitted;
    }

    /**
     * Reset the submitted state
     */
    resetSubmitted(): void {
        this.submitted = false;
        this.formSubmitAttempt.emit(false);
    }
}
