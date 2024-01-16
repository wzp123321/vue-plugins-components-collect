import { Inject, Injectable } from '@angular/core';

@Injectable()
export abstract class PaginationService {
  public readonly sizeOptions: { label: string; value: number }[] = [];

  public get pageCount(): number {
    return Math.ceil(this.total / this.size);
  }

  public abstract get isLoading(): boolean;

  public abstract set index(v: number);
  public abstract get index(): number;

  public abstract set size(v: number);
  public abstract get size(): number;

  public abstract get total(): number;

  constructor(@Inject(Array) sizes: number[] = [10, 20, 30, 40, 50]) {
    this.sizeOptions = sizes.map((v) => {
      return { label: `${v}条/页`, value: v };
    });
  }
}
