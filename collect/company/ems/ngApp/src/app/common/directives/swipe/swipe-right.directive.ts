import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appSwipeRight]',
})
export class SwipeRightDirective {
  @Output('appSwipeRight')
  public onSwipeRight: EventEmitter<boolean> = new EventEmitter<boolean>();

  private position: [number, number] = null;

  constructor() {}

  @HostListener('touchstart', ['$event'])
  private onTouchStart(event: TouchEvent) {
    this.position = [
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY,
    ];
  }

  @HostListener('touchend', ['$event'])
  private onTouchEnd(event: TouchEvent) {
    if (this.position) {
      if (event.changedTouches[0].clientX - this.position[0] > 22) {
        if (Math.abs(this.position[1] - event.changedTouches[0].clientY) < 88) {
          this.onSwipeRight.emit(true);
        }
      }
    }
  }
}
