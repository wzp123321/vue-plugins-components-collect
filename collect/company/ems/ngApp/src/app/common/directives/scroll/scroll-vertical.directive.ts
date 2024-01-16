import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appScrollVertical]',
})
export class ScrollVerticalDirective {
  @Output('appScrollVertical')
  public onScrollVertical: EventEmitter<number> = new EventEmitter<number>();

  private position: [number, number] = null;

  constructor() {}

  @HostListener('touchstart', ['$event'])
  private onTouchStart(event: TouchEvent): void {
    this.position = [
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY,
    ];
  }

  @HostListener('touchmove', ['$event'])
  private onTouchMove(event: TouchEvent): void {
    if (this.position) {
      this.onScrollVertical.emit(
        this.position[1] - event.changedTouches[0].clientY
      );
    }
  }

  @HostListener('touchend', ['$event'])
  private onTouchEnd(event: TouchEvent): void {
    this.position = null;
  }
}
