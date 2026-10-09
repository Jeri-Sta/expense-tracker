import { FormGroup } from '@angular/forms';

const monitoredForms = new WeakSet<HTMLFormElement>();

/**
 * Marks all controls in a FormGroup as touched to trigger validation display.
 *
 * @param form - The FormGroup whose controls should be marked as touched
 */
export function markFormGroupTouched(form: FormGroup): void {
  for (const key of Object.keys(form.controls)) {
    form.get(key)?.markAsTouched();
  }
}

export function focusFirstInvalidControl(formElement: HTMLFormElement): void {
  const syncAccessibility = (): void => {
    formElement
      .querySelectorAll<HTMLElement>(
        '.ng-invalid[formcontrolname], .ng-invalid[formControlName], [aria-invalid="true"][formcontrolname], [aria-invalid="true"][formControlName]',
      )
      .forEach((control) => {
        const invalid = control.classList.contains('ng-invalid');
        const target = control.matches('input, select, textarea, button, [tabindex]')
          ? control
          : (control.querySelector<HTMLElement>(
              'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [role="combobox"], [tabindex]:not([tabindex="-1"])',
            ) ?? control);
        if (!invalid) {
          control.removeAttribute('aria-invalid');
          control.removeAttribute('aria-describedby');
          if (target !== control) {
            target.removeAttribute('aria-invalid');
            target.removeAttribute('aria-describedby');
          }
          return;
        }

        control.setAttribute('aria-invalid', 'true');
        target.setAttribute('aria-invalid', 'true');
        const field = control.closest('.field, .form-group, .form-field') ?? control.parentElement;
        const error = field?.querySelector<HTMLElement>(
          '.p-error, .error-message, small.text-red-500',
        );
        if (error?.textContent?.trim()) {
          error.id ||= `${control.id || control.getAttribute('formcontrolname')}-error`;
          control.setAttribute('aria-describedby', error.id);
          target.setAttribute('aria-describedby', error.id);
        }
      });
  };

  syncAccessibility();
  requestAnimationFrame(syncAccessibility);
  if (!monitoredForms.has(formElement)) {
    formElement.addEventListener('input', syncAccessibility);
    formElement.addEventListener('change', syncAccessibility);
    monitoredForms.add(formElement);
  }

  const invalidControl = formElement.querySelector<HTMLElement>(
    '.ng-invalid[formcontrolname], .ng-invalid[formControlName]',
  );
  if (!invalidControl) return;

  const target = invalidControl.matches('input, select, textarea, button, [tabindex]')
    ? invalidControl
    : (invalidControl.querySelector<HTMLElement>(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [role="combobox"], [tabindex]:not([tabindex="-1"])',
      ) ?? invalidControl);
  target.focus();
  target.scrollIntoView({ block: 'center', behavior: 'auto' });
}
