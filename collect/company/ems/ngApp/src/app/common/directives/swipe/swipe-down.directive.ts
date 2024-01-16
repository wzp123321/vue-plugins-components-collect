import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appSwipeDown]',
})
export class SwipeDownDirective {
  @Output('appSwipeDown')
  public onSwipeDown: EventEmitter<boolean> = new EventEmitter<boolean>();

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
      if (event.changedTouches[0].clientY - this.position[1] > 22) {
        if (Math.abs(this.position[0] - event.changedTouches[0].clientX) < 88) {
          this.onSwipeDown.emit(true);
        }
      }
    }
  }
}
