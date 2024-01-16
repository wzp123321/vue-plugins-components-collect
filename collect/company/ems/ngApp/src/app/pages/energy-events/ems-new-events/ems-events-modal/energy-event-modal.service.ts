import { EventEmitter, Injectable } from '@angular/core';
import { IEnergyCode, SaveType, TEnergyEvent } from '../../energy-events.api';
import { EnergyEventsService } from '../../energy-events.service';

@Injectable()
export class EnergyEventModalService {
  private _Data: TEnergyEvent = {} as TEnergyEvent;
  public get data(): TEnergyEvent {
    return this._Data;
  }

  private _Validator: string = null;
  public get canSave(): boolean {
    return !this._Validator;
  }
  public get validator(): string {
    return this._Validator;
  }
  public set validator(v: string) {
    this._Validator = v;
  }

  private _Energy_Code_Array: IEnergyCode[] = [
    { code: null, unit: null, name: null },
  ];
  public get energyCodeArray(): IEnergyCode[] {
    return this._Energy_Code_Array;
  }

  public readonly toHandleInvalid: EventEmitter<HTMLIonContentElement> =
    new EventEmitter<HTMLIonContentElement>();
  public readonly toHandleGoBack: EventEmitter<void> = new EventEmitter<void>();

  constructor(private sEnergyEvent: EnergyEventsService) {
    this.sEnergyEvent.getEnergyCodeList().then((v) => {
      this._Energy_Code_Array = v;
    });
  }

  public async save(): Promise<boolean> {
    if (this.canSave) {
      const param: { [key: string]: string } = {};

      this.data.addFileIdList = [];
      this.data.filePaths?.map((item) => {
        this.data.addFileIdList.push(item.fileId);
      });

      // 过滤多余字段
      const keys = [
        'addFileIdList',
        'adjustmentType',
        'changeType',
        'deleteFileIdList',
        'endTime',
        'energyObjects',
        'entryMode',
        'eventDetail',
        'eventTitle',
        'eventTypeId',
        'id',
        'relationData',
        'startTime',
      ];
      Object.keys(this.data).forEach((key: string) => {
        if (keys?.includes(key)) {
          param[key] = (this.data as any)[key];
        }
      });

      const res = await this.sEnergyEvent.saveEventForm(param as any);
      return res;
    }
    return false;
  }
}
