import { Directive, ElementRef, HostListener, Input, ɵɵtrustConstantResourceUrl } from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[appLimitLength]'
})
export class LimitLengthDirective {
  @Input('appLimitLength') options: number;
  vLength: number ;
  currentValue: string;
  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event'])
  onChange(e: any): void {
    let currentV = e.target.value;
    let valueArry: any = Array.from(e.target.value); 
    if (valueArry.length > 0) {
      if (valueArry.length === Number(this.options)) { 
        currentV = currentV.substr(0, ( this.options));
      }  else if (valueArry.length > this.options) { 
        currentV = currentV.substr(0, ( this.options)); 
      }
    }
    this.el.nativeElement.value = currentV;// console.log(currentV)
  //  e.detail.value = currentV;
    e.target.value = currentV;  
   // this.control.control.setValue(this.el.nativeElement.value);
  }

  // @HostListener('ionChange', ['$event']) onChange(e: any) { 
 
  //   let currentV: string = this.el.nativeElement.value ? this.el.nativeElement.value.trim() : '';
  //   let valueArry: any = Array.from(this.el.nativeElement.value);
  // // console.log( this.vLength)
  //   if (valueArry.length !== 0 ) {  
  //     if (valueArry.length === Number(this.options)) { 
  //       this.vLength = currentV.length; 
  //       currentV = currentV.substr(0,  this.vLength);console.log(currentV.length, currentV) 
  //     } else if (valueArry.length > this.options) {
  //     // console.log(this.vLength) 
  //       this.vLength = this.vLength ? this.vLength: this.options;
  //       currentV = currentV.substr(0,  this.vLength);
  //     }
     
    
     
  //   }
  //   e.detail.value = currentV;
  //   e.target.value = currentV;  
  // //  console.log(e)
  //   this.el.nativeElement.value = currentV;  
  //   this.control.control.setValue(this.el.nativeElement.value);
  // }

  /**
   * 应对输入被格式化导致不触发change事件的问题。所以这里在blur的时候也进行重新赋值
   * @param $event 事件
   */
  @HostListener('ionBlur', ['$event']) onBlur(e: any) { 
    // if (this.el.nativeElement.value) { console.log(this.options)
    //   if (this.el.nativeElement.value.length > this.options) {
    //     this.el.nativeElement.value = this.el.nativeElement.value.substr(0,  (this.options - 1));
    //   }
    // }
    // $event.detail.value = this.el.nativeElement.value;
    // $event.target.value = this.el.nativeElement.value;  
    // this.control.control.setValue(this.el.nativeElement.value);

    let currentV = e.target.value;
    let valueArry: any = Array.from(e.target.value); 
    if (valueArry.length > 0) {
      if (valueArry.length === Number(this.options)) { 
        currentV = currentV.substr(0, ( this.options));
      }  else if (valueArry.length > this.options) { 
        currentV = currentV.substr(0, ( this.options)); 
      }
    }
    this.el.nativeElement.value = currentV;// console.log(currentV)
  //  e.detail.value = currentV;
    e.target.value = currentV;  
  }
}
