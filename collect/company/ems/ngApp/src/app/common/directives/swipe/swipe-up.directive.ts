import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appSwipeUp]',
})
export class SwipeUpDirective {
  @Output('appSwipeUp')
  public onSwipeUp: EventEmitter<boolean> = new EventEmitter<boolean>();

  private position: [number, number] = null;

  constructor() {}

  @HostListener('touchstart', ['$event'])
  private onTouchStart(event: TouchEvent): void {
    this.position = [
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY,
    ];
  }

  @HostListener('touchend', ['$event'])
  private onTouchEnd(event: TouchEvent): void {
    if (this.position) {
      if (this.position[1] - event.changedTouches[0].clientY > 22) {
        if (Math.abs(this.position[0] - event.changedTouches[0].clientX) < 88) {
          this.onSwipeUp.emit(true);
        }
      }
    }
  }
}
