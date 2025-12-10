import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, inject } from '@angular/core';

/**
 * Directive to apply date mask (dd/mm/yyyy or mm/yyyy) to p-calendar input
 * Automatically inserts slashes as user types
 */
@Directive({
  selector: '[appDateMask]',
})
export class DateMaskDirective implements OnInit, OnDestroy {
  @Input() appDateMask: 'date' | 'month' = 'date';

  private inputElement: HTMLInputElement | null = null;
  private observer: MutationObserver | null = null;
  private isProcessing = false;

  // Use Angular's `inject()` to satisfy @angular-eslint/prefer-inject
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    // p-calendar creates an input element inside, we need to find it
    this.findAndSetupInput();

    // Watch for DOM changes in case input is created later
    this.observer = new MutationObserver(() => {
      if (!this.inputElement) {
        this.findAndSetupInput();
      }
    });

    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
    });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private findAndSetupInput(): void {
    const input = this.el.nativeElement.querySelector('input');
    if (input && input !== this.inputElement) {
      this.inputElement = input;
      this.setupInputListeners();
    }
  }

  private setupInputListeners(): void {
    if (!this.inputElement) return;

    // Add input event listener
    this.renderer.listen(this.inputElement, 'input', (event: Event) => {
      this.onInput(event);
    });

    // Add keydown listener for better control
    this.renderer.listen(this.inputElement, 'keydown', (event: KeyboardEvent) => {
      this.onKeyDown(event);
    });
  }

  private onKeyDown(event: KeyboardEvent): void {
    // Allow: backspace, delete, tab, escape, enter, arrows
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
      return;
    }

    // Only allow numbers and slashes
    if (!/^[0-9/]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  private onInput(_event: Event): void {
    if (!this.inputElement || this.isProcessing) return;

    this.isProcessing = true;

    const input = this.inputElement;
    const value = input.value;
    const cursorPos = input.selectionStart || 0;

    // Remove all non-numeric characters
    const numbers = value.replaceAll(/[^\d]/g, '');

    // Format based on type
    const formatted = this.formatNumbers(numbers);
    const newCursorPos = this.calculateCursorPosition(value, formatted, cursorPos);

    // Only update if different
    if (input.value !== formatted) {
      input.value = formatted;

      // Restore cursor position
      const maxPos = formatted.length;
      const pos = Math.min(newCursorPos, maxPos);
      input.setSelectionRange(pos, pos);
    }

    this.isProcessing = false;
  }

  private formatNumbers(numbers: string): string {
    if (this.appDateMask === 'month') {
      // Format: mm/yyyy
      if (numbers.length === 0) return '';
      let formatted = numbers.substring(0, 2);
      if (numbers.length > 2) {
        formatted += '/' + numbers.substring(2, 6);
      }
      return formatted;
    } else {
      // Format: dd/mm/yyyy
      if (numbers.length === 0) return '';
      let formatted = numbers.substring(0, 2);
      if (numbers.length > 2) {
        formatted += '/' + numbers.substring(2, 4);
        if (numbers.length > 4) {
          formatted += '/' + numbers.substring(4, 8);
        }
      }
      return formatted;
    }
  }

  private calculateCursorPosition(oldValue: string, newValue: string, cursorPos: number): number {
    const slashesBefore = (oldValue.substring(0, cursorPos).match(/\//g) || []).length;
    const slashesAfter = (newValue.substring(0, cursorPos).match(/\//g) || []).length;
    return cursorPos + (slashesAfter - slashesBefore);
  }
}
