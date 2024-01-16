import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Self,
} from '@angular/core';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzTreeSelectComponent } from 'ng-zorro-antd/tree-select';
import { FUploadHandler } from 'src/app/core/communication/communication.api';
import {
  EE_EAdjustType,
  EE_EAdjustType_Options,
  EE_EAreaEntryMode,
  EE_EAreaEntryMode_Options,
  EE_EChangeType,
  EE_EChangeType_Options,
  EE_EEquipmentEntryMode,
  EE_EEquipmentEntryMode_Options,
  EE_EEventType,
  EE_EEventType_Options,
  EE_ENodeEntryMode,
  EE_ENodeEntryMode_Options,
  EE_IClassificationItem,
  EE_IEventAdditionInfo,
  EE_IEventBaseInfo,
  EE_IRelationItem,
} from '../energy-event.api';
import { EnergyEventFormService } from './energy-event-form.service';

@Component({
  selector: 'ems-energy-event-form',
  templateUrl: './energy-event-form.component.html',
  styleUrls: ['./energy-event-form.component.less'],
  providers: [EnergyEventFormService],
})
export class EnergyEventFormComponent implements OnInit {
  @Input('id')
  public id?: number;

  @Input('boundaryId')
  public boundaryId?: string;

  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isInvalid(): boolean {
    return this.service.isInvalid;
  }

  public get item(): EE_IEventBaseInfo {
    return this.service.item;
  }

  public get addition(): EE_IEventAdditionInfo {
    return this.service.addition;
  }

  public get acceptSuffixList(): string[] {
    return this.service.acceptSuffixList;
  }

  public get typeOptions(): { label: string; value: EE_EEventType }[] {
    return EE_EEventType_Options.filter(({ value }) =>
      this.service.types.includes(value)
    );
  }

  public get classifications(): EE_IClassificationItem[] {
    return this.service.classifications;
  }

  public get equipments(): { label: string; value: string }[] {
    return this.service.equipments;
  }

  public get nodes(): NzTreeNodeOptions[] {
    return this.service.nodes;
  }
  public get expands(): string[] {
    return this.service.expands;
  }

  public get changeTypeOptions(): { label: string; value: EE_EChangeType }[] {
    return EE_EChangeType_Options;
  }
  public get adjustTypeOptions(): { label: string; value: EE_EAdjustType }[] {
    return EE_EAdjustType_Options;
  }

  public get equipmentEntryModeOptions(): {
    label: string;
    value: EE_EEquipmentEntryMode;
  }[] {
    return EE_EEquipmentEntryMode_Options;
  }
  public get areaEntryModeOptions(): {
    label: string;
    value: EE_EAreaEntryMode;
  }[] {
    return EE_EAreaEntryMode_Options;
  }
  public get nodeEntryModeOptions(): {
    label: string;
    value: EE_ENodeEntryMode;
  }[] {
    return EE_ENodeEntryMode_Options;
  }

  public get uploadTooltip(): string {
    return `支持上传${this.acceptSuffixList
      .join('、')
      .replace(/\./g, '')}格式文件；照片最多支持上传6张`;
  }

  public get descriptionCount(): string {
    return `${this.item?.description?.length ?? 0}/200`;
  }

  public get canShowAreaAddition(): boolean {
    return (
      EE_EEventType.用能区域变化 === this.item.type &&
      EE_EEventType.用能区域变化 === this.addition?.event
    );
  }
  public get canShowEquipmentAddition(): boolean {
    return (
      EE_EEventType.大功率用能设备变更 === this.item.type &&
      EE_EEventType.大功率用能设备变更 === this.addition?.event
    );
  }
  public get canShowBusinessAddition(): boolean {
    return (
      EE_EEventType.区域业务调整 === this.item.type &&
      EE_EEventType.区域业务调整 === this.addition?.event
    );
  }
  public get canShowConditionerAddition(): boolean {
    return (
      EE_EEventType.空调供应时段调整 === this.item.type &&
      EE_EEventType.空调供应时段调整 === this.addition?.event
    );
  }
  public get canShowOtherAddition(): boolean {
    return (
      EE_EEventType.其他调整 === this.item.type &&
      EE_EEventType.其他调整 === this.addition?.event
    );
  }

  public get canShowRelationList(): boolean {
    return [
      EE_EEquipmentEntryMode.人工录入,
      EE_EAreaEntryMode.人工录入,
      EE_ENodeEntryMode.人工录入,
    ].includes(this.addition?.mode);
  }

  public get canAddRelation(): boolean {
    return this.addition.relations.length < this.classifications.length;
  }

  constructor(
    private cdf: ChangeDetectorRef,
    @Self() private service: EnergyEventFormService
  ) {}

  ngOnInit(): void {
    if (this.id) {
      this.service.doRetrieve(this.id);
    }
  }

  public onSelectType(): void {
    this.service.resetAddition();
  }

  public onSelectAdjustType(): void {
    this.addition.from = null;
    this.addition.to = null;
  }

  public onSelectMode(): void {
    this.addition.id = null;
    this.addition.ids = [];
    this.addition.relations = [];
    this.service.doAddRelation();
  }

  public onSelectClassification(target: EE_IRelationItem): void {
    const item = this.service.classifications.find(
      (classification) => classification.code === target.code
    );
    target.name = item.name;
    target.unit = item.unit;
  }

  public onAddEquipment(element: NzSelectComponent): void {
    if (!this.service.verifyIds()) {
      const ids = element.listOfValue;
      const items = element.listOfTopItem;
      ids.splice(10, ids.length - 10);
      items.splice(10, items.length - 10);
    }
  }

  public onAddArea(element: NzTreeSelectComponent): void {
    if (!this.service.verifyIds()) {
      const ids = element.value;
      const nodes = element.selectedNodes;
      ids.splice(10, ids.length - 10);
      nodes.splice(10, nodes.length - 10);
    }
  }

  public toAddRelation(): void {
    if (this.isLoading) {
      return;
    }

    if (this.canAddRelation) {
      this.service.doAddRelation();
    }
  }

  public toDeleteRelation(index: number): void {
    if (this.isLoading) {
      return;
    }

    index && this.service.doDeleteRelation(index);
  }

  public async toUpdate(): Promise<boolean> {
    if (this.isLoading) {
      return false;
    }
    const res = await this.service.doUpdate();
    if (this.boundaryId) {
      this.service.establishRelationShip(this.boundaryId, res?.eventId);
    }
    return res?.success;
  }

  public async toUpload(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    try {
      const file = await FUploadHandler(this.acceptSuffixList.join());
      this.service.doUpload(file);
    } catch (error) {
      console.warn(error);
    }
  }

  public toDeletePhoto(index: number): void {
    const photo = this.item.photos[index];
    if (photo?.id) {
      this.item.deleteAttaches.push(photo.id);
    } else {
      URL.revokeObjectURL(photo.src);
    }
    this.item.photos.splice(index, 1);
  }

  public toDeleteFile(index: number): void {
    const file = this.item.files[index];
    if (file?.id) {
      this.item.deleteAttaches.push(file.id);
    }
    this.item.files.splice(index, 1);
  }

  public mapDateAfterToday(): (date: Date) => boolean {
    return (date) =>
      new Date(date.toLocaleDateString()) >
      new Date(new Date().toLocaleDateString());
  }

  public mapBeginDisabled(target: Date): (date: Date) => boolean {
    return (date) => {
      if (
        new Date(date.toLocaleDateString()) >
        new Date(new Date().toLocaleDateString())
      ) {
        return true;
      }

      return target
        ? date.getFullYear() !== target.getFullYear() ||
            new Date(date.toLocaleDateString()) >
              new Date(target.toLocaleDateString())
        : false;
    };
  }

  public mapEndDisabled(target: Date): (date: Date) => boolean {
    return (date) => {
      if (
        new Date(date.toLocaleDateString()) >
        new Date(new Date().toLocaleDateString())
      ) {
        return true;
      }

      return target
        ? date.getFullYear() !== target.getFullYear() ||
            new Date(date.toLocaleDateString()) <
              new Date(target.toLocaleDateString())
        : false;
    };
  }

  public mapOriginalDateDisabled(target: Date): (date: Date) => boolean {
    switch (this.addition.type) {
      case EE_EAdjustType.提早开:
        return (date) =>
          target
            ? date.getFullYear() !== target.getFullYear() ||
              new Date(date.toLocaleDateString()) <
                new Date(target.toLocaleDateString())
            : false;
      case EE_EAdjustType.推迟关:
        return (date) =>
          target
            ? date.getFullYear() !== target.getFullYear() ||
              new Date(date.toLocaleDateString()) >
                new Date(target.toLocaleDateString())
            : false;
      default:
        return (date) => true;
    }
  }

  public mapAdjustDateDisabled(target: Date): (date: Date) => boolean {
    switch (this.addition.type) {
      case EE_EAdjustType.提早开:
        return (date) =>
          target
            ? date.getFullYear() !== target.getFullYear() ||
              new Date(date.toLocaleDateString()) >
                new Date(target.toLocaleDateString())
            : false;
      case EE_EAdjustType.推迟关:
        return (date) =>
          target
            ? date.getFullYear() !== target.getFullYear() ||
              new Date(date.toLocaleDateString()) <
                new Date(target.toLocaleDateString())
            : false;
      default:
        return (date) => true;
    }
  }

  public mapClassificationDisabled(code: string, select: string): boolean {
    if (code === select) {
      return false;
    }

    const codes = this.addition.relations.map((relation) => relation.code);
    return codes.includes(code);
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

  public autoScroll(event: Event): void {
    const element = event.target as HTMLTextAreaElement;
    element.scrollTop = element.scrollHeight;
  }
}
