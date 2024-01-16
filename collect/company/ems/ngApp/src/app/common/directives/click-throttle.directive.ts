import { Directive, Input, OnDestroy, OnInit, HostListener, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { throttleTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
 
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[clickThrottle]'
})
export class ClickThrottleDirective implements OnInit, OnDestroy {
  // tslint:disable-next-line:no-output-rename
  @Output('clickThrottle') clickCall: EventEmitter<MouseEvent> = new EventEmitter();
  @Input() duration = 2000; // 必须是数字，传入时要用绑定语法
  private $sub = new Subject<any>();
  private subscription: Subscription;
  constructor(
    private renderer: Renderer2, // Angular 2.x导入Renderer
    private element: ElementRef
  ) {  }
  ngOnInit() {
    // 如此绑定事件亦可
    // this.renderer.listen(
    //   this.element.nativeElement, 'click', event => {
    //     event.preventDefault();
    //     event.stopPropagation();
    //     this.$sub.next(event);
    //   }
    // );
    this.subscription = this.$sub.pipe(
      throttleTime(this.duration)
    ).subscribe(e => { 
      this.clickCall.emit(e);
    });
  }
  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    event.preventDefault();   // 通常是不需要冒泡的
    event.stopPropagation();
    this.$sub.next(event); 
  }
  ngOnDestroy() { 
    this.subscription.unsubscribe();
  }
}