import { Component, OnInit, Optional, SkipSelf } from '@angular/core';
import { PaginationService } from './pagination.service';

@Component({
  selector: 'ems-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.less'],
})
export class PaginationComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service?.isLoading ?? true;
  }

  public set size(v: number) {
    this.service?.size & (this.service.size = v);
    if (this.index > this.pageCount) {
      this.index = this.pageCount;
    }
  }
  public get size(): number {
    return this.service?.size || 10;
  }

  public set index(v: number) {
    v = v < 1 ? 1 : v > this.pageCount ? this.pageCount : v;
    this.service?.index & (this.service.index = v);
  }
  public get index(): number {
    return this.service?.index || 1;
  }

  public get total(): number {
    return this.service?.total ?? 0;
  }

  public get pages(): number {
    return this.service?.total ?? 1;
  }

  public get sizeOptions(): { label: string; value: number }[] {
    return this.service?.sizeOptions ?? [{ label: '10条/页', value: 10 }];
  }

  public get pageCount(): number {
    return this.service?.pageCount ?? 1;
  }

  public get canLeft(): boolean {
    return this.index > 1;
  }
  public get canRight(): boolean {
    return this.index < this.pageCount;
  }
  public get canJumpLeft(): boolean {
    const state = this.pageCount > 7 && this.index > 4;
    if (!state) {
      this.isJumpLeftActive = false;
    }
    return state;
  }
  public get canJumpRight(): boolean {
    const state = this.pageCount > 7 && this.index < this.pageCount - 3;
    if (!state) {
      this.isJumpRightActive = false;
    }
    return state;
  }
  public get pageList(): number[] {
    if (this.pageCount > 7) {
      if (this.index < 4) {
        return [2, 3, 4, 5];
      } else if (this.pageCount - 3 < this.index) {
        return [
          this.pageCount - 4,
          this.pageCount - 3,
          this.pageCount - 2,
          this.pageCount - 1,
        ];
      } else {
        return [
          this.index - 2,
          this.index - 1,
          this.index,
          this.index + 1,
          this.index + 2,
        ];
      }
    } else {
      return Array.from({ length: this.pageCount - 2 }, (v, k) => k + 2);
    }
  }

  public isJumpLeftActive = false;
  public isJumpRightActive = false;
  public canJumpToPage = false;

  constructor(@Optional() @SkipSelf() private service: PaginationService) {}

  ngOnInit(): void {}

  public selectPage(index: number): void {
    this.index = index;
  }

  public jumpToPage(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (this.canJumpToPage) {
      this.index = +element.value;
      element.value = this.index.toString();
    } else {
      this.index = +element.value <= 0 ? 1 : +this.pageCount;
      element.value = this.index.toString();
    }
  }

  public jumpLeft(count = 1): void {
    this.index -= count;
  }

  public jumpRight(count = 1): void {
    this.index += count;
  }

  public setJumpLeftActive(state: boolean): void {
    this.isJumpLeftActive = state;
  }

  public setJumpRightActive(state: boolean): void {
    this.isJumpRightActive = state;
  }

  public setJumpVerification(state: boolean): void {
    this.canJumpToPage = state;
  }
}
