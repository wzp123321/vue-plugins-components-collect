import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ML_EExecutionPeriod, ML_EMeasureState, ML_EMeasureSystem, ML_IMeasureItem } from '../measure-library.api';
import { MeasureLibraryCommunicationService } from '../services/measure-library-communication.service';
import { MeasureLibraryDatabaseService } from '../services/measure-library-database.service';

@Injectable()
export class MeasureLibraryFormService {
  private _item: ML_IMeasureItem = {
    id: null,
    name: null,
    code: null,
    system: ML_EMeasureSystem.暖通,
    period: ML_EExecutionPeriod['工作日（周一至周五）'],
    state: ML_EMeasureState.有效,
    relation: null,
    description: null,
    canDelete: true,
  };
  public set item(v: ML_IMeasureItem) {
    v?.id && (this._item = v);
  }
  public get item(): ML_IMeasureItem {
    return this._item;
  }

  public get isSaving(): boolean {
    return this.sDatabase.State_Form_Saving;
  }

  private _Readonly = false;
  public set isReadonly(v: boolean) {
    this._Readonly = v;
  }
  public get isReadonly(): boolean {
    return this._Readonly;
  }

  private _Invalid = false;
  public get isInvalid(): boolean {
    return this._Invalid;
  }

  constructor(
    private nzMessage: NzMessageService,
    private sCommunication: MeasureLibraryCommunicationService,
    private sDatabase: MeasureLibraryDatabaseService
  ) {}

  public doCreate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.verify()) {
        const subscription = this.sDatabase.Event_Form_DataChange.subscribe(({ success }) => {
          subscription.unsubscribe();
          resolve(success);
        });
        this.sCommunication.addEnergyManagerMeasure(this.item);
      } else {
        resolve(false);
      }
    });
  }

  public doUpdate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.verify()) {
        const subscription = this.sDatabase.Event_Form_DataChange.subscribe(({ success }) => {
          subscription.unsubscribe();
          resolve(success);
        });
        this.sCommunication.updateEnergyManagerMeasure(this.item);
      } else {
        resolve(false);
      }
    });
  }

  private verify(): boolean {
    this._Invalid = false;

    const messages: string[] = [];
    if (!this.item.name) {
      messages.push('措施名称不能为空');
    }

    if (messages.length) {
      this.nzMessage.error(messages.shift());
      this._Invalid = true;
    }

    return !this._Invalid;
  }
}
