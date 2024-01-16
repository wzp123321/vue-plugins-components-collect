import { Component, OnInit, Self } from '@angular/core';
import { B_IParameterItem } from '../../boiler.api';
import { BoilerMultipleParameterService } from './boiler-multiple-parameter.service';

@Component({
  selector: 'ems-boiler-multiple-parameter',
  templateUrl: './boiler-multiple-parameter.component.html',
  styleUrls: ['./boiler-multiple-parameter.component.less'],
  providers: [BoilerMultipleParameterService],
})
export class BoilerMultipleParameterComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get param(): string {
    return this.service.param;
  }

  public get list(): B_IParameterItem[] {
    return this.service.list;
  }

  constructor(@Self() private service: BoilerMultipleParameterService) {}

  ngOnInit(): void {}

  public mapIsOutOfRange(item: B_IParameterItem): boolean {
    if (!item?.average) {
      return false;
    }

    const lower = item.min ? +item.average < +item.min : false;
    const higher = item.max ? +item.average > +item.max : false;
    return lower || higher;
  }
}
