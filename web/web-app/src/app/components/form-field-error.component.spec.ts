import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FormFieldErrorComponent } from './form-field-error.component';

describe('FormFieldErrorComponent', () => {
  let component: FormFieldErrorComponent;
  let fixture: ComponentFixture<FormFieldErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldErrorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldErrorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('shouldShowError', () => {
    it('should return false when control is null', () => {
      component.control = null;
      expect(component.shouldShowError()).toBe(false);
    });

    it('should return false when control is valid', () => {
      component.control = new FormControl('valid value');
      expect(component.shouldShowError()).toBe(false);
    });

    it('should return false when control is invalid but not touched', () => {
      component.control = new FormControl('', Validators.required);
      expect(component.shouldShowError()).toBe(false);
    });

    it('should return true when control is invalid and touched', () => {
      component.control = new FormControl('', Validators.required);
      component.control.markAsTouched();
      expect(component.shouldShowError()).toBe(true);
    });

    it('should return true when showOnSubmit is true, submitted is true, and control is invalid and touched', () => {
      component.control = new FormControl('', Validators.required);
      component.control.markAsTouched();
      component.showOnSubmit = true;
      component.submitted = true;
      expect(component.shouldShowError()).toBe(true);
    });

    it('should return false when showOnSubmit is true but submitted is false', () => {
      component.control = new FormControl('', Validators.required);
      component.control.markAsTouched();
      component.showOnSubmit = true;
      component.submitted = false;
      expect(component.shouldShowError()).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return empty string when control is null', () => {
      component.control = null;
      expect(component.getErrorMessage()).toBe('');
    });

    it('should return empty string when control has no errors', () => {
      component.control = new FormControl('valid value');
      expect(component.getErrorMessage()).toBe('');
    });

    it('should return required error message', () => {
      component.control = new FormControl('', Validators.required);
      component.fieldName = 'Email';
      expect(component.getErrorMessage()).toBe('Email is required.');
    });

    it('should return email error message', () => {
      component.control = new FormControl('invalid-email', Validators.email);
      expect(component.getErrorMessage()).toBe('Please enter a valid email address.');
    });

    it('should return minlength error message', () => {
      component.control = new FormControl('ab', Validators.minLength(3));
      component.fieldName = 'Password';
      expect(component.getErrorMessage()).toBe('Password must be at least 3 characters long.');
    });

    it('should return maxlength error message', () => {
      component.control = new FormControl('very long text', Validators.maxLength(5));
      component.fieldName = 'Name';
      expect(component.getErrorMessage()).toBe('Name must not exceed 5 characters.');
    });

    it('should return pattern error message', () => {
      component.control = new FormControl('123', Validators.pattern(/^[a-zA-Z]+$/));
      component.fieldName = 'Username';
      expect(component.getErrorMessage()).toBe('Username format is invalid.');
    });

    it('should return min error message', () => {
      component.control = new FormControl(5, Validators.min(10));
      component.fieldName = 'Age';
      expect(component.getErrorMessage()).toBe('Age must be at least 10.');
    });

    it('should return max error message', () => {
      component.control = new FormControl(15, Validators.max(10));
      component.fieldName = 'Score';
      expect(component.getErrorMessage()).toBe('Score must not exceed 10.');
    });

    it('should return generic error message for unknown errors', () => {
      component.control = new FormControl('test');
      component.control.setErrors({ customError: true });
      component.fieldName = 'Field';
      expect(component.getErrorMessage()).toBe('Field is invalid.');
    });
  });

  describe('template rendering', () => {
    it('should not render error message when shouldShowError returns false', () => {
      component.control = new FormControl('valid value');
      fixture.detectChanges();
      
      const errorElement = fixture.nativeElement.querySelector('.p-error');
      expect(errorElement).toBeNull();
    });

    it('should render error message when shouldShowError returns true', () => {
      component.control = new FormControl('', Validators.required);
      component.control.markAsTouched();
      component.fieldName = 'Email';
      fixture.detectChanges();
      
      const errorElement = fixture.nativeElement.querySelector('.p-error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent.trim()).toBe('Email is required.');
    });

    it('should apply correct CSS classes', () => {
      component.control = new FormControl('', Validators.required);
      component.control.markAsTouched();
      fixture.detectChanges();
      
      const errorElement = fixture.nativeElement.querySelector('.p-error');
      expect(errorElement.classList.contains('p-error')).toBe(true);
      expect(errorElement.classList.contains('mt-1')).toBe(true);
      expect(errorElement.classList.contains('block')).toBe(true);
    });
  });
});
