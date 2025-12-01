import { Component, Input, forwardRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Calendar } from 'primeng/calendar';

/**
 * A reusable component that combines p-inputMask with p-calendar
 * to provide both masked date input (auto-inserting slashes) and calendar popup.
 * 
 * Supports two formats:
 * - 'date': dd/mm/yyyy (mask: 99/99/9999)
 * - 'month': mm/yyyy (mask: 99/9999)
 */
@Component({
  selector: 'app-masked-calendar',
  templateUrl: './masked-calendar.component.html',
  styleUrls: ['./masked-calendar.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaskedCalendarComponent),
      multi: true
    }
  ]
})
export class MaskedCalendarComponent implements ControlValueAccessor {
  @ViewChild('calendar') calendar!: Calendar;

  /** The type of date picker: 'date' for full date, 'month' for month/year only */
  @Input() type: 'date' | 'month' = 'date';
  
  /** Placeholder text for the input */
  @Input() placeholder: string = '';
  
  /** CSS class for the container */
  @Input() styleClass: string = 'w-full';
  
  /** Whether to show the calendar icon */
  @Input() showIcon: boolean = true;
  
  /** Element ID for the input */
  @Input() inputId: string = '';
  
  /** Append calendar popup to this element */
  @Input() appendTo: string = 'body';
  
  /** Custom CSS class for invalid state */
  @Input() invalidClass: string = '';
  
  /** Slot character for empty positions in the mask */
  @Input() slotChar: string = '';

  /** Event emitted when date is selected from calendar */
  @Output() dateSelect = new EventEmitter<Date>();

  // Internal value as a Date object
  value: Date | null = null;
  
  // String representation for the masked input
  maskedValue: string = '';
  
  // Whether the component is disabled
  disabled: boolean = false;

  // Flag to track if calendar is open
  calendarVisible: boolean = false;
  
  // Computed mask based on type
  get mask(): string {
    return this.type === 'month' ? '99/9999' : '99/99/9999';
  }
  
  // Date format for p-calendar
  get dateFormat(): string {
    return this.type === 'month' ? 'mm/yy' : 'dd/mm/yy';
  }
  
  // Calendar view mode
  get view(): 'date' | 'month' | 'year' {
    return this.type === 'month' ? 'month' : 'date';
  }
  
  // Computed placeholder
  get computedPlaceholder(): string {
    if (this.placeholder) return this.placeholder;
    return this.type === 'month' ? 'mm/aaaa' : 'dd/mm/aaaa';
  }
  
  // Computed slotChar
  get computedSlotChar(): string {
    if (this.slotChar) return this.slotChar;
    return this.type === 'month' ? 'mm/aaaa' : 'dd/mm/aaaa';
  }

  // ControlValueAccessor callbacks
  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  // ControlValueAccessor implementation
  writeValue(value: Date | string | null): void {
    if (value) {
      this.value = value instanceof Date ? value : new Date(value);
      this.maskedValue = this.formatDateToMasked(this.value);
    } else {
      this.value = null;
      this.maskedValue = '';
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Called when the masked input value changes (user typing)
   */
  onMaskedInputChange(event: string): void {
    // Don't process if event is the same as current masked value (avoid loops)
    if (event === this.maskedValue) return;
    
    this.maskedValue = event;
    
    // Check if input is empty or cleared
    if (!event || event.replaceAll(/[_/]/g, '').length === 0) {
      this.value = null;
      this.onChange(null);
      return;
    }
    
    // Only process if the mask is complete (no underscores remaining)
    if (!event.includes('_')) {
      const parsedDate = this.parseMaskedDate(event);
      if (parsedDate && this.isValidDate(parsedDate)) {
        this.value = parsedDate;
        this.onChange(this.value);
      }
    }
  }

  /**
   * Called when input mask is complete
   */
  onMaskComplete(event: { originalEvent: Event; value: string }): void {
    const maskedStr = event.value;
    if (!maskedStr) return;
    
    const parsedDate = this.parseMaskedDate(maskedStr);
    if (parsedDate && this.isValidDate(parsedDate)) {
      this.value = parsedDate;
      this.maskedValue = maskedStr;
      this.onChange(this.value);
    }
  }

  /**
   * Called when input loses focus
   */
  onMaskedInputBlur(): void {
    this.onTouched();
  }

  /**
   * Called when a date is selected from the calendar popup
   */
  onCalendarSelect(date: Date): void {
    this.value = date;
    this.maskedValue = this.formatDateToMasked(date);
    this.onChange(this.value);
    this.dateSelect.emit(date);
    this.calendarVisible = false;
  }

  /**
   * Called when calendar is shown
   */
  onCalendarShow(): void {
    this.calendarVisible = true;
  }

  /**
   * Called when calendar is hidden
   */
  onCalendarHide(): void {
    this.calendarVisible = false;
  }

  /**
   * Opens the calendar popup
   */
  toggleCalendar(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.calendar) {
      // Access the calendar's internal method to show overlay
      // PrimeNG Calendar has overlayVisible property and onButtonClick method
      if ((this.calendar as any).overlayVisible) {
        (this.calendar as any).overlayVisible = false;
        this.calendarVisible = false;
      } else {
        // Trigger the calendar to show by calling onButtonClick or directly setting overlayVisible
        (this.calendar as any).onButtonClick(event);
        this.calendarVisible = true;
      }
    }
  }

  /**
   * Converts a Date to masked string format
   */
  private formatDateToMasked(date: Date): string {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
      return '';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    
    if (this.type === 'month') {
      return `${month}/${year}`;
    }
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Parses a masked string (dd/mm/yyyy or mm/yyyy) to Date
   */
  private parseMaskedDate(maskedValue: string): Date | null {
    if (!maskedValue) return null;
    
    try {
      const parts = maskedValue.split('/');
      
      if (this.type === 'month') {
        return this.parseMonthFormat(parts);
      } else {
        return this.parseDateFormat(parts);
      }
    } catch {
      return null;
    }
  }

  /**
   * Parses mm/yyyy format
   */
  private parseMonthFormat(parts: string[]): Date | null {
    if (parts.length !== 2) return null;
    
    const month = Number.parseInt(parts[0], 10);
    const year = Number.parseInt(parts[1], 10);
    
    if (Number.isNaN(month) || Number.isNaN(year)) return null;
    if (month < 1 || month > 12) return null;
    if (year < 1900 || year > 2100) return null;
    
    // Return first day of month at noon
    return new Date(year, month - 1, 1, 12, 0, 0, 0);
  }

  /**
   * Parses dd/mm/yyyy format
   */
  private parseDateFormat(parts: string[]): Date | null {
    if (parts.length !== 3) return null;
    
    const day = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10);
    const year = Number.parseInt(parts[2], 10);
    
    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (year < 1900 || year > 2100) return null;
    
    // Return date at noon to avoid timezone issues
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  /**
   * Basic date validation (not comprehensive, just sanity check)
   */
  private isValidDate(date: Date): boolean {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }
}
