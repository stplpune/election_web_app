import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appOnlyAlphapetsNoSpace]'
})
export class OnlyAlphapetsNoSpaceDirective
{

  private onChange!: (val: string) => void;
  private onTouched!: () => void;
  private value!: string;
  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  @HostListener('input', ['$event.target.value'])
  onInputChange(value: string)
  {
    const filteredValue: string = this.filterValue(value);
    this.updateTextInput(filteredValue, this.value !== filteredValue);
  }

  @HostListener('blur')
  onBlur()
  {
    this.onTouched();
  }

  private updateTextInput(value: string, propagateChange: boolean)
  {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
    if (propagateChange)
    {
      this.onChange(value);
    }
    this.value = value;
  }

  registerOnChange(fn: any): void
  {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void
  {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void
  {
    this.renderer.setProperty(
      this.elementRef.nativeElement,
      'disabled',
      isDisabled
    );
  }

  writeValue(value: any): void
  {
    value = value ? String(value) : '';
    this.updateTextInput(value, false);
  }
  filterValue(value: any): string
  {
    return value.replace(/[^A-Za-z-]/g, '');
  }


}
