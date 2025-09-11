import { Directive, Input, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Directive({
    selector: '[appShowErrorsOnSubmit]',
    standalone: true
})
export class ShowErrorsOnSubmitDirective implements OnInit, OnDestroy {
    @Input() appShowErrorsOnSubmit!: FormGroup;
    @Input() submitted: boolean = false;
    
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        if (!this.appShowErrorsOnSubmit) {
            console.warn('ShowErrorsOnSubmitDirective: FormGroup is required');
            return;
        }

        // Mark all controls as touched when form is submitted
        this.appShowErrorsOnSubmit.statusChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.submitted) {
                    this.markAllControlsAsTouched();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private markAllControlsAsTouched(): void {
        Object.keys(this.appShowErrorsOnSubmit.controls).forEach(key => {
            const control = this.appShowErrorsOnSubmit.get(key);
            if (control) {
                control.markAsTouched();
            }
        });
    }
}
