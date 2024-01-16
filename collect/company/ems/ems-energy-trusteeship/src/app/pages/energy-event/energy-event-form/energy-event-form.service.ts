import { Injectable, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Subscription } from 'rxjs';
import {
  EE_EAdjustType,
  EE_EAreaEntryMode,
  EE_EAreaTreeType,
  EE_EChangeType,
  EE_EEquipmentEntryMode,
  EE_EEventType,
  EE_ENodeEntryMode,
  EE_IClassificationItem,
  EE_IEventAdditionInfo,
  EE_IEventBaseInfo,
} from '../energy-event.api';
import { EnergyEventCommunicationService } from '../service/energy-event-communication.service';
import { EnergyEventDatabaseService } from '../service/energy-event-database.service';

const ACCEPT_EXTENSIONS = {
  FILE: {
    '.xls': 'application/vnd.ms-excel',
    '.xlsx':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.pptx':
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  IMAGE: { '.png': 'image/png', '.jpg': 'image/jpeg' },
};
const MAXIMUN = { IMAGE: 6, SINGLE_SIZE: 10, TOTAL_SIZE: 100 }; // 文件大小单位为MB

@Injectable()
export class EnergyEventFormService implements OnDestroy {
  private _item: EE_IEventBaseInfo = {
    id: null,
    title: null,
    type: null,
    photos: [],
    files: [],
    description: null,
    deleteAttaches: [],
  };
  public get item(): EE_IEventBaseInfo {
    return this._item;
  }

  private _addition: EE_IEventAdditionInfo = { event: null, from: null };
  public get addition(): EE_IEventAdditionInfo {
    return this._addition;
  }

  private _invalid = false;
  public get isInvalid(): boolean {
    return this._invalid;
  }

  public get isLoading(): boolean {
    return (
      this.sDatabase.State_Form_Searching || this.sDatabase.State_Form_Saving
    );
  }

  public get types(): EE_EEventType[] {
    return this.sDatabase.Data_Form_Types;
  }

  public get classifications(): EE_IClassificationItem[] {
    return this.sDatabase.Data_Form_Classifications;
  }

  public get equipments(): { label: string; value: string }[] {
    return this.sDatabase.Data_Form_Equipments;
  }

  public get nodes(): NzTreeNodeOptions[] {
    return this.sDatabase.Data_Form_Nodes;
  }
  public get expands(): string[] {
    return this.sDatabase.Data_Form_Expands;
  }

  public get acceptSuffixList(): string[] {
    return [
      ...Object.keys(ACCEPT_EXTENSIONS.FILE),
      ...Object.keys(ACCEPT_EXTENSIONS.IMAGE),
    ];
  }

  private _subscriptions: Subscription[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private nzMessage: NzMessageService,
    private sCommunication: EnergyEventCommunicationService,
    private sDatabase: EnergyEventDatabaseService
  ) {
    this._subscriptions.push(
      this.sDatabase.Event_Form_DataLoad.subscribe(({ base, addition }) => {
        if (base?.id && addition?.event) {
          this._item = base;
          this.resetAddition();
          this._addition = addition;
        }
      })
    );
    this.doRetrieveTypeList();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public resetAddition(): void {
    this._invalid = false;

    switch (this.item.type) {
      case EE_EEventType.用能区域变化:
        this.doRetrieveTreeList(EE_EAreaTreeType.区域);
        this._addition = { event: this.item.type, from: null, id: null };
        break;
      case EE_EEventType.大功率用能设备变更:
        this.doRetrieveEquipmentList();
        this.doRetrieveClassificationList();
        this._addition = {
          event: this.item.type,
          from: null,
          type: EE_EChangeType.新增,
          mode: EE_EEquipmentEntryMode.绑定设备,
          ids: [],
          relations: [],
        };
        break;
      case EE_EEventType.区域业务调整:
        this.doRetrieveTreeList(EE_EAreaTreeType.区域);
        this.doRetrieveClassificationList();
        this._addition = {
          event: this.item.type,
          from: null,
          mode: EE_EAreaEntryMode.选择区域,
          id: null,
          relations: [],
          to: null,
        };
        break;
      case EE_EEventType.空调供应时段调整:
        this.doRetrieveTreeList(EE_EAreaTreeType.业态);
        this.doRetrieveClassificationList();
        this._addition = {
          event: this.item.type,
          type: EE_EAdjustType.提早开,
          from: null,
          to: null,
          mode: EE_ENodeEntryMode.绑定能耗节点,
          ids: [],
          relations: [],
        };
        break;
      case EE_EEventType.其他调整:
        this.doRetrieveClassificationList();
        this._addition = {
          event: this.item.type,
          from: null,
          relations: [{ code: null, value: null }],
          to: null,
        };
        break;
      default:
        this._addition = { event: null, from: null };
        break;
    }
  }

  public verifyIds(): boolean {
    if (this._addition.ids.length > 10) {
      this._addition.ids.splice(10, this._addition.ids.length - 10);
      this.nzMessage.error('最多可选择10个');
      return false;
    }

    return true;
  }

  public doAddRelation(): void {
    this._invalid = false;

    this.addition.relations.push({ code: null, value: null });
  }

  public doDeleteRelation(index: number): void {
    this.addition.relations.splice(index, 1);
  }

  public doUpload(file: File): void {
    switch (this.verifyUpload(file)) {
      case 'photo':
        this.item.photos.push({
          name: file.name,
          src: this.sanitizer.bypassSecurityTrustUrl(
            URL.createObjectURL(file)
          ) as string,
          file,
        });
        break;
      case 'file':
        this.item.files.push({ name: file.name, file });
        break;
      default:
        break;
    }
  }

  public doRetrieve(id: number): void {
    this.sCommunication.queryEventObject(id);
  }

  public async doUpdate(): Promise<{ success: boolean; eventId: number }> {
    return new Promise((resolve, reject) => {
      if (this.verifyData()) {
        const subscription = this.sDatabase.Event_Form_DataChange.subscribe(
          ({ success, eventId }) => {
            subscription.unsubscribe();
            resolve({ success, eventId });
          }
        );
        this.sCommunication.saveEventForm(this.item, this.addition);
      } else {
        resolve({ success: false, eventId: null });
      }
    });
  }

  public establishRelationShip(boundaryId: string, eventId: number): void {
    console.log('调用接口建立连接', {
      eventType: this.item.type,
      boundaryId,
      eventId,
    });
    this.sCommunication.saveAnomalyEventRelationShip({
      eventId,
      boundaryId,
    });
  }

  private doRetrieveTypeList(): void {
    this.sCommunication.queryEventTypeList();
  }

  private doRetrieveClassificationList(): void {
    this.sCommunication.getClassificationList();
  }

  private doRetrieveEquipmentList(): void {
    this.sCommunication.listDeviceByDeviceName();
  }

  private doRetrieveTreeList(type: EE_EAreaTreeType): void {
    this.sCommunication.getAreaTreeList(type);
  }

  private verifyData(): boolean {
    this._invalid = false;

    const messages: string[] = [];
    if (!this.item.type || !this.addition.event) {
      messages.push('事件类型不能为空');
    }
    if (!this.item.title) {
      messages.push('事件标题不能为空');
    }

    switch (this.addition.event) {
      case EE_EEventType.用能区域变化:
        if (!this.addition.from) {
          messages.push('开始时间不能为空');
        }
        if (!this.addition.id) {
          messages.push('选择区域不能为空');
        }
        break;
      case EE_EEventType.大功率用能设备变更:
        if (!this.addition.from) {
          messages.push('开始时间不能为空');
        }
        switch (this.addition.mode) {
          case EE_EEquipmentEntryMode.绑定设备:
            if (!this.addition.ids?.length) {
              messages.push('选择设备不能为空');
            }
            break;
          case EE_EEquipmentEntryMode.人工录入:
            this.addition.relations.every((relation) => {
              if (!relation.code || !relation.value) {
                messages.push('能源类型、能源用量不能为空');
                return false;
              }
              return true;
            });
            break;
          default:
            messages.push('录入方式不能为空');
            break;
        }
        break;
      case EE_EEventType.区域业务调整:
        if (!this.addition.from) {
          messages.push('开始时间不能为空');
        }
        switch (this.addition.mode) {
          case EE_EAreaEntryMode.选择区域:
            if (!this.addition.id) {
              messages.push('选择区域不能为空');
            }
            break;
          case EE_EAreaEntryMode.人工录入:
            this.addition.relations.every((relation) => {
              if (!relation.code || !relation.value) {
                messages.push('能源类型、能源用量不能为空');
                return false;
              }
              return true;
            });
            break;
          default:
            messages.push('录入方式不能为空');
            break;
        }
        break;
      case EE_EEventType.空调供应时段调整:
        if (!this.addition.from) {
          messages.push('原定时间不能为空');
        }
        if (!this.addition.to) {
          messages.push('调整时间不能为空');
        }
        switch (this.addition.mode) {
          case EE_ENodeEntryMode.绑定能耗节点:
            if (!this.addition.ids?.length) {
              messages.push('选择节点不能为空');
            }
            break;
          case EE_ENodeEntryMode.人工录入:
            this.addition.relations.every((relation) => {
              if (!relation.code || !relation.value) {
                messages.push('能源类型、能源用量不能为空');
                return false;
              }
              return true;
            });
            break;
          default:
            messages.push('录入方式不能为空');
            break;
        }
        break;
      case EE_EEventType.其他调整:
        if (!this.addition.from) {
          messages.push('开始时间不能为空');
        }
        this.addition.relations.every((relation) => {
          if (!relation.code || !relation.value) {
            messages.push('能源类型、能源用量不能为空');
            return false;
          }
          return true;
        });
        break;
      default:
        break;
    }

    if (messages.length > 1) {
      messages.unshift('请填写必填项');
    }

    if (messages.length) {
      this.nzMessage.error(messages.shift());
      this._invalid = true;
    }

    return !this._invalid;
  }

  private verifyUpload(target: File): 'photo' | 'file' {
    if (target?.size > MAXIMUN.SINGLE_SIZE * 1024 * 1024) {
      this.nzMessage.error(
        `上传${target?.name ?? ''}失败，文件大小不能超过${
          MAXIMUN.SINGLE_SIZE
        }MB！`
      );
      return null;
    }

    let total = target?.size ?? 0;
    this.item.files.forEach(
      (file) => file.file?.size && (total += file.file.size)
    );
    this.item.photos.forEach(
      (photo) => photo.file?.size && (total += photo.file.size)
    );
    if (total > MAXIMUN.TOTAL_SIZE * 1024 * 1024) {
      this.nzMessage.error(
        `上传${target?.name ?? ''}失败，待上传附件总大小不能超过${
          MAXIMUN.TOTAL_SIZE
        }MB！`
      );
      return null;
    }

    if (Object.values(ACCEPT_EXTENSIONS.IMAGE).includes(target?.type)) {
      if (this.item.photos.map((photo) => photo.name).includes(target?.name)) {
        this.nzMessage.error(
          `上传${
            target?.name ?? ''
          }失败，已存在同名文件，请修改文件名称重新上传！`
        );
        return null;
      }

      if (this.item.photos.length < MAXIMUN.IMAGE) {
        return 'photo';
      } else {
        this.nzMessage.error(
          `上传${target?.name ?? ''}失败，照片最多支持上传${MAXIMUN.IMAGE}张！`
        );
        return null;
      }
    }

    if (Object.values(ACCEPT_EXTENSIONS.FILE).includes(target?.type)) {
      if (this.item.files.map((file) => file.name).includes(target?.name)) {
        this.nzMessage.error(
          `上传${
            target?.name ?? ''
          }失败，已存在同名文件，请修改文件名称重新上传！`
        );
        return null;
      }

      return 'file';
    }

    this.nzMessage.error(
      `上传${
        target?.name ?? ''
      }失败，当前页面只支持上传${this.acceptSuffixList.join('/')}格式文件！`
    );
    return null;
  }
}
