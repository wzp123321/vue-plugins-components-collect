import { Component, Input, OnInit, Self } from '@angular/core';
import {
  ML_EExecutionPeriod,
  ML_EExecutionPeriod_Options,
  ML_EMeasureState,
  ML_EMeasureState_Options,
  ML_EMeasureSystem,
  ML_EMeasureSystem_Options,
  ML_ERelatedFunction,
  ML_ERelatedFunction_Options,
  ML_IMeasureItem,
} from '../measure-library.api';
import { MeasureLibraryFormService } from './measure-library-form.service';

@Component({
  selector: 'ems-measure-library-form',
  templateUrl: './measure-library-form.component.html',
  styleUrls: ['./measure-library-form.component.less'],
  providers: [MeasureLibraryFormService],
})
export class MeasureLibraryFormComponent implements OnInit {
  public get isSaving(): boolean {
    return this.service.isSaving;
  }

  @Input()
  public set isReadonly(v: boolean) {
    this.service.isReadonly = v;
  }
  public get isReadonly(): boolean {
    return this.service.isReadonly;
  }

  public get isInvalid(): boolean {
    return this.service.isInvalid;
  }

  @Input()
  public set item(v: ML_IMeasureItem) {
    this.service.item = { ...v };
  }
  public get item(): ML_IMeasureItem {
    return this.service.item;
  }

  public get descriptionCount(): string {
    return `${this.item?.description?.length ?? 0}/2000`;
  }

  public get systemOptions(): { label: string; value: ML_EMeasureSystem }[] {
    return ML_EMeasureSystem_Options.filter(({ value }) => value !== ML_EMeasureSystem.全部);
  }

  public get periodOptions(): { label: string; value: ML_EExecutionPeriod }[] {
    return ML_EExecutionPeriod_Options;
  }

  public get stateOptions(): { label: string; value: ML_EMeasureState }[] {
    return ML_EMeasureState_Options.filter(({ value }) => value !== ML_EMeasureState.全部);
  }

  public get relationOptions(): { label: string; value: ML_ERelatedFunction }[] {
    return ML_ERelatedFunction_Options;
  }

  constructor(@Self() private service: MeasureLibraryFormService) {}

  ngOnInit(): void {}

  public async toCreate(): Promise<boolean> {
    if (this.isSaving || this.isReadonly) {
      return false;
    }

    return await this.service.doCreate();
  }

  public async toUpdate(): Promise<boolean> {
    if (this.isSaving || this.isReadonly) {
      return false;
    }

    return await this.service.doUpdate();
  }

  public autoScroll(event: Event): void {
    const element = event.target as HTMLTextAreaElement;
    element.scrollTop = element.scrollHeight;
  }
}
