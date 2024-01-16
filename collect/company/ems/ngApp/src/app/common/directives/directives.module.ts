import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwipeUpDirective } from './swipe/swipe-up.directive';
import { SwipeDownDirective } from './swipe/swipe-down.directive';
import { SwipeLeftDirective } from './swipe/swipe-left.directive';
import { SwipeRightDirective } from './swipe/swipe-right.directive';
import { ClickThrottleDirective } from './click-throttle.directive';
import { DecimalOnlyDirective } from './decimal-only.directive';
import { LimitLengthDirective } from './limit-length.directive';
import { ScrollVerticalDirective } from './scroll/scroll-vertical.directive';
@NgModule({
  declarations: [
    SwipeUpDirective,
    SwipeDownDirective,
    SwipeLeftDirective,
    SwipeRightDirective,
    ClickThrottleDirective,
    DecimalOnlyDirective,
    LimitLengthDirective,
    ScrollVerticalDirective,
  ],
  imports: [CommonModule],
  exports: [
    SwipeUpDirective,
    SwipeDownDirective,
    SwipeLeftDirective,
    SwipeRightDirective,
    ClickThrottleDirective,
    DecimalOnlyDirective,
    LimitLengthDirective,
    ScrollVerticalDirective,
  ],
})
export class DirectivesModule {}
