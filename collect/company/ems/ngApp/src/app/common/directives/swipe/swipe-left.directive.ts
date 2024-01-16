import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appSwipeLeft]',
})
export class SwipeLeftDirective {
  @Output('appSwipeLeft')
  public onSwipeLeft: EventEmitter<boolean> = new EventEmitter<boolean>();

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
      if (this.position[0] - event.changedTouches[0].clientX > 22) {
        if (Math.abs(this.position[1] - event.changedTouches[0].clientY) < 88) {
          this.onSwipeLeft.emit(true);
        }
      }
    }
  }
}
