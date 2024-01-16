import { Component, OnInit, Self } from '@angular/core';
import { F_IParameterItem } from '../../freezer.api';
import { FreezerMultipleParameterService } from './freezer-multiple-parameter.service';

@Component({
  selector: 'ems-freezer-multiple-parameter',
  templateUrl: './freezer-multiple-parameter.component.html',
  styleUrls: ['./freezer-multiple-parameter.component.less'],
  providers: [FreezerMultipleParameterService],
})
export class FreezerMultipleParameterComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get param(): string {
    return this.service.param;
  }

  public get list(): F_IParameterItem[] {
    return this.service.list;
  }

  constructor(@Self() private service: FreezerMultipleParameterService) {}

  ngOnInit(): void {}

  public mapIsOutOfRange(item: F_IParameterItem): boolean {
    if (!item?.average) {
      return false;
    }

    const lower = item.min ? +item.average < +item.min : false;
    const higher = item.max ? +item.average > +item.max : false;
    return lower || higher;
  }
}
