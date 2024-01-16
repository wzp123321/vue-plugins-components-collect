import { Component, Input, OnInit, Self } from '@angular/core';
import {
  EE_EAdjustType,
  EE_EAreaEntryMode,
  EE_EChangeType,
  EE_EEquipmentEntryMode,
  EE_EEventType,
  EE_ENodeEntryMode,
  EE_IAttachItem,
  EE_IDetailInfo,
  EE_IDetailTable,
} from '../energy-event.api';
import { EnergyEventDetailService } from './energy-event-detail.service';

@Component({
  selector: 'ems-energy-event-detail',
  templateUrl: './energy-event-detail.component.html',
  styleUrls: ['./energy-event-detail.component.less'],
  providers: [EnergyEventDetailService],
})
export class EnergyEventDetailComponent implements OnInit {
  @Input('id')
  public id: number;

  public get isLoading(): boolean {
    return this.service.isLoading;
  }
  public get isDownloading(): boolean {
    return this.service.isDownloading;
  }

  public get item(): EE_IDetailInfo {
    return this.service.item;
  }

  public get table(): EE_IDetailTable {
    return this.service.table;
  }

  public get canShowAreaAddition(): boolean {
    return EE_EEventType.用能区域变化 === this.item.type;
  }
  public get canShowEquipmentAddition(): boolean {
    return EE_EEventType.大功率用能设备变更 === this.item.type;
  }
  public get canShowBusinessAddition(): boolean {
    return EE_EEventType.区域业务调整 === this.item.type;
  }
  public get canShowConditionerAddition(): boolean {
    return EE_EEventType.空调供应时段调整 === this.item.type;
  }
  public get canShowOtherAddition(): boolean {
    return EE_EEventType.其他调整 === this.item.type;
  }

  public get canShowRelationList(): boolean {
    return [EE_EEquipmentEntryMode.人工录入, EE_EAreaEntryMode.人工录入, EE_ENodeEntryMode.人工录入].includes(
      this.item?.mode
    );
  }

  constructor(@Self() private service: EnergyEventDetailService) {}

  ngOnInit(): void {
    this.service.doRetrieve(this.id);
  }

  public toDownload(file: EE_IAttachItem): void {
    if (this.isLoading || this.isDownloading) {
      return;
    }

    this.service.doDownload(file.src, file.name);
  }

  public mapEventType(type: EE_EEventType): string {
    return EE_EEventType[type];
  }

  public mapChangeType(type: EE_EChangeType): string {
    return EE_EChangeType[type];
  }

  public mapAdjustType(type: EE_EAdjustType): string {
    return EE_EAdjustType[type];
  }

  public mapEquipmentEntryMode(mode: EE_EEquipmentEntryMode | EE_EAreaEntryMode | EE_ENodeEntryMode): string {
    return EE_EEquipmentEntryMode[mode];
  }

  public mapAreaEntryMode(mode: EE_EEquipmentEntryMode | EE_EAreaEntryMode | EE_ENodeEntryMode): string {
    return EE_EAreaEntryMode[mode];
  }

  public mapNodeEntryMode(mode: EE_EEquipmentEntryMode | EE_EAreaEntryMode | EE_ENodeEntryMode): string {
    return EE_ENodeEntryMode[mode];
  }

  public mapFileTypeIcon(name: string): string {
    const prefix = 'assets/icon/common/common-file-suffix-';
    switch (name.split('.').pop()) {
      case 'xls':
      case 'xlsx':
        return `${prefix}excel.svg`;
      case 'pdf':
        return `${prefix}pdf.svg`;
      case 'doc':
        return `${prefix}word.svg`;
      case 'pptx':
        return `${prefix}ppt.svg`;
      default:
        return `${prefix}unknown.svg`;
    }
  }
}
