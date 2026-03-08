import { FormGroup } from '@angular/forms';

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
