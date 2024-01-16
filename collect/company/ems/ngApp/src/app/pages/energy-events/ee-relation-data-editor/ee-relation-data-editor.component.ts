import {
  Component,
  EventEmitter,
  Host,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  SkipSelf,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NewEnergyEventService } from '../ems-new-events/new-energy-event.service';
import { IEnergyCode, IExtraEvent, IRelationData } from '../energy-events.api';
import { EnergyTypeSelectorComponent } from './energy-type-selector/energy-type-selector.component';

@Component({
  selector: 'app-ee-relation-data-editor',
  templateUrl: './ee-relation-data-editor.component.html',
  styleUrls: ['./ee-relation-data-editor.component.scss'],
})
export class EeRelationDataEditorComponent implements OnInit, OnDestroy {
  @Input() saveClick: number;
  @Output('onToggleModal')
  public onToggleModal: EventEmitter<{
    canGoBack: boolean;
    canShowFooter: boolean;
  }> = new EventEmitter<{
    canGoBack: boolean;
    canShowFooter: boolean;
  }>();
  decimalEC = '10,4';
  newData: number;
  saveLength: number;
  public isDeleteMode: boolean = false;
  public get canShowDeleteButton(): boolean {
    if (1 < this.relationDataArray.length) {
      return true;
    }
    if (this.relationDataArray[0].energyCode || this.relationDataArray[0].codeValue) {
      return true;
    }
    return this.isDeleteMode;
  }
  public get canDelete(): boolean {
    return 0 < this._waitDeleteList.size;
  }
  public get canShowEmptyMarker(): boolean {
    // this.newData = null;
    return this.service.canShowEmptyMarker;
  }

  public get relationDataArray(): IRelationData[] {
    if (!this.service.data.relationData.length) {
      this.service.data.relationData = [{ energyCode: null, codeValue: null, energyCodeName: null }];
    }
    return this.service.data.relationData;
  }
  public get energyCodeArray(): IEnergyCode[] {
    return this.service.energyCodeArray;
  }

  private _waitDeleteList: Set<number> = new Set<number>();

  private energyTypeSelector: HTMLIonModalElement = null;

  constructor(
    @Host() @SkipSelf() private service: NewEnergyEventService<IExtraEvent>,
    private ctrlModal: ModalController
  ) {
    this.service.data.relationData = [{ energyCode: null, codeValue: null, energyCodeName: null }];

    this.service.toHandleGoBack.subscribe(() => {
      if (this.energyTypeSelector) {
        this.energyTypeSelector.dismiss();
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    if (changes.saveClick) {
      this.saveClick = changes.saveClick.currentValue;
      if (this.saveClick) {
        this.newData = null;
        this.saveLength = this.relationDataArray.length;
      }
    }
  }
  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.service.toHandleGoBack.unsubscribe();
  }

  public checkInput(event: KeyboardEvent, value: string | number): void {
    const reg: RegExp = /(^\d$)|(^\.$)/;
    if (!reg.test(event.key)) {
      event.returnValue = false;
      return;
    }
    if (!value) {
      return;
    }
    value = value as string;
    if (value.includes('.')) {
      if ('.' === event.key || 1 < value.split('.')[1].length) {
        event.returnValue = false;
        return;
      }
    }
    if ('0' === event.key && '0' === value) {
      event.returnValue = false;
      return;
    }
  }

  public handleInput(event: Event): void {
    const value: string = (event as CustomEvent).detail.value;
    const target = (event as CustomEvent).target as HTMLIonInputElement;
    const reg: RegExp = /^(\d+)(\.?)(\d{0,4})$/;
    if (value && !reg.test(value)) {
      target.value = +value.slice(0, -1);
    }
    this.doCheck();
  }

  public cancelDelete(): void {
    this._waitDeleteList = new Set<number>();
    this.isDeleteMode = false;
  }

  public confirmDelete(): void {
    for (const index of this._waitDeleteList) {
      delete this.relationDataArray[index];
    }
    if (this._waitDeleteList.size === this.relationDataArray.length) {
      this.cancelDelete();
    }
    this._waitDeleteList = new Set<number>();
    this.service.data.relationData = this.relationDataArray.filter((v) => v);
  }

  public selectColumn(event: Event): void {
    const { checked, value }: { checked: boolean; value: string } = (event as CustomEvent).detail;
    if (checked) {
      this._waitDeleteList.add(+value);
    } else {
      this._waitDeleteList.delete(+value);
    }
  }

  public addColumn(): void {
    this.service.data.relationData.push({
      energyCode: null,
      codeValue: null,
      energyCodeName: null,
      energyCodeUnit: null,
    });
    const relength = this.service.data.relationData.length - 1;
    if (this.saveLength - 1 < relength) {
      this.newData = relength;
    }
    //  console.log(this.newData, this.saveLength);
    //  console.log(this.service.data.relationData);
    this.service.doCheck();
  }

  public async presentEnergyTypeSelector(index: number): Promise<void> {
    this.energyTypeSelector = await this.ctrlModal.create({
      component: EnergyTypeSelectorComponent,
      cssClass: '--energy-type-selector',
      mode: 'md',
      componentProps: {
        types: this.energyCodeArray.filter((v) => {
          return this.service.data.relationData.every((data) => data.energyCode !== v.code);
        }),
      },
    });
    await this.energyTypeSelector.present();
    this.onToggleModal.emit({
      canGoBack: false,
      canShowFooter: true,
    });
    //  console.log(this.service.data.relationData[index]);
    const type = (await this.energyTypeSelector.onDidDismiss<IEnergyCode>()).data;
    if (type) {
      // console.log(type);
      this.service.data.relationData[index].energyCode = type.code;
      this.service.data.relationData[index].energyCodeUnit = type.unit;
      this.service.data.relationData[index].energyCodeName = type.name;
      this.doCheck();
    }
    this.onToggleModal.emit({
      canGoBack: true,
      canShowFooter: true,
    });
  }

  public matchEnergyCode(code: string): string {
    if (code) {
      const temp = this.energyCodeArray.filter((v) => code === v.code);
      if (temp.length) {
        return temp[0].name;
      }
    }
    return null;
  }

  private doCheck() {
    this.service.doCheck();
  }
}
