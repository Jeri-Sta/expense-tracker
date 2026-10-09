import { FormGroup, FormControl } from '@angular/forms';
import { focusFirstInvalidControl, markFormGroupTouched } from './form.utils';

describe('form utilities', () => {
  it('focuses the first invalid field and associates its visible error', () => {
    const form = document.createElement('form');
    form.innerHTML =
      '<div class="field"><input id="name" class="ng-invalid" formcontrolname="name"><small class="p-error">Nome obrigatório</small></div>';
    document.body.append(form);
    const input = form.querySelector('input') as HTMLInputElement;
    spyOn(input, 'scrollIntoView');

    focusFirstInvalidControl(form);

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('name-error');
    expect(document.activeElement).toBe(input);
    expect(input.scrollIntoView).toHaveBeenCalled();
    form.remove();
  });

  it('applies invalid and error attributes to a nested input in a form control', () => {
    const form = document.createElement('form');
    form.innerHTML =
      '<div class="field"><p-inputnumber class="ng-invalid" formcontrolname="amount"><input id="amount-input"></p-inputnumber><small class="text-red-500">Valor obrigatório</small></div>';
    document.body.append(form);
    const input = form.querySelector('input') as HTMLInputElement;

    focusFirstInvalidControl(form);

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('amount-error');
    form.remove();
  });

  it('marks controls touched for validation feedback', () => {
    const control = new FormControl('');
    const form = new FormGroup({ name: control });

    markFormGroupTouched(form);

    expect(control.touched).toBeTrue();
  });
});
