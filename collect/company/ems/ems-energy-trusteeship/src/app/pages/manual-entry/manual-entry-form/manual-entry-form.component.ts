import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Self,
  ViewChild,
} from '@angular/core';
import { ManualEntryService } from '../services/manual-entry.service';
import {
  selectDdeviceType,
  manualEntryParam,
  getObjectEnery,
} from '../manual-entry.api';
import { ManualEntryObjectService } from '../services/manual-entry-object.service';
import { ManualEntryFormService } from '../services/manual-entry-form.service';
import { differenceInCalendarDays } from 'date-fns';
import * as moment from 'moment';
import { ManualEntryToolbarService } from '../services/manual-entry-toolbar.service';

@Component({
  selector: 'app-manual-entry-form',
  templateUrl: './manual-entry-form.component.html',
  styleUrls: ['./manual-entry-form.component.less'],
  providers: [ManualEntryObjectService, ManualEntryService],
})
export class ManualEntryFormComponent implements OnInit {
  @Input() isVisibleForm: boolean;
  @Output() meOnHideModalForm = new EventEmitter<boolean>();

  // 分类分项
  public get energyExpandKeys() {
    return this.meService.energyExpandKeyData;
  }
  public get energyList() {
    return this.meService.energyData;
  }
  energyCode: string = '';

  // 录入对象
  objectData: selectDdeviceType = null;

  treeSelectNodes: any;
  treeSelectExpandedKeys: any;
  select: any;
  // 录入值类型
  public get valueTypeData() {
    return this.meService.getInputValueType;
  }
  energyType: string = '';

  // 是否分摊
  isShareType: string = '2';
  ShareType: number = null;
  disabledClick: string = '';

  // 时间类型
  public get shortCutData() {
    return this.meFormService.getShortCutData;
  }
  shortCutSelect: number = 1;

  queryDate: Date;
  dateMonth: Date;
  dateRange: any = [];
  // 不可选择范围
  disabledDate: (d: Date) => boolean;
  disabledDateType: (d: Date) => boolean;
  // 月
  disabledDateMonth: (d: Date) => boolean;
  disabledDateRange: (d: Date) => boolean;

  shareTypeTip: string;
  // 录入值
  entryValue: string = '';
  entryValueUnit: string = '';

  public get entryValueHistory() {
    return this.meFormService.getEntryValueHistory;
  }
  public get isHistroyShow() {
    return this.meFormService.getIsHistroyShow;
  }
  @ViewChild('entryValueBox', { static: false })
  entryValueBox: ElementRef<HTMLDivElement>;
  @ViewChild('inputElement', { static: false })
  inputElement: ElementRef;

  popoverStyle: any;

  constructor(
    @Self() private meService: ManualEntryService,
    @Self() private meObjectService: ManualEntryObjectService,
    private meFormService: ManualEntryFormService,
    private meToolbarService: ManualEntryToolbarService
  ) {
    // 系统时间
    this.meService.startDataValue.subscribe((data) => {
      this.dateMonth = null;
      this.queryDate = null;
      this.dateRange = [];
      let serverDate = data;

      const preTime = new Date(serverDate);
      let lastTimeData = new Date(
        preTime.getFullYear(),
        preTime.getMonth(),
        preTime.getDate() - 1
      );
      const prMonths = moment(new Date(serverDate))
        .subtract(1, 'months')
        .format('YYYY-MM-DD HH:mm:ss');
      const lastTime = new Date(prMonths);

      this.disabledDate = (current: Date) => {
        return differenceInCalendarDays(current, new Date(serverDate)) > 0;
      };
      // 消耗值 day
      this.disabledDateType = (current: Date) => {
        return differenceInCalendarDays(current, new Date(lastTimeData)) > 0;
      };
      this.disabledDateMonth = (current: Date) => {
        return differenceInCalendarDays(current, new Date(lastTime)) > 0;
      };
      this.disabledDateRange = (current: Date) => {
        return differenceInCalendarDays(current, new Date(lastTimeData)) > 0;
      };
    });

    // 新增成功之后关闭弹窗
    this.meFormService.getIsShowForm.subscribe((data) => {
      if (data) {
        this.energyCode = '';
        this.isVisibleForm = false;
        this.energyType = '';

        this.meService.setInputValueType = [];
        this.queryDate = null;
        this.dateMonth = null;
        this.dateRange = null;
        this.shortCutSelect = 1;
        this.entryValue = '';
        this.meFormService.setEntryValueHistory = null;
        this.meFormService.setIsHistroyShow = false;

        this.isVisibleForm = false;
        this.meOnHideModalForm.emit(false);
      }
    });
    this.meService.entryCodeItem.subscribe((data) => {
      this.meService.setEnergyCode = '';
      this.energyCode = '';
      setTimeout(() => {
        this.meService.setEnergyCode = data.code;
        this.energyCode = data.code;
        this.entryValueUnit = data.unit;
      });
    });
    // 打开录入弹框---需要查询全量节点，所以用00000去查询
    this.meToolbarService.modalShowType.subscribe((data) => {
      console.log('%c✨✨打开录入弹框✨✨', 'font-size: 24px', data);
      if (data) {
        this.meService.setEnergyCode = '';
        this.energyCode = '';
        this.meObjectService.setTreeClassId = 1;
        this.meObjectService.getTypeList('00000');
        this.meService.getEnergy(1, false);
      }
    });
  }

  /**
   * 监听dom点击事件
   */
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: any) {
    if (this.entryValueBox) {
      const clickedInside =
        this.entryValueBox.nativeElement.contains(targetElement);
      if (!clickedInside) {
        this.meFormService.setIsHistroyShow = false;
        this.meFormService.setEntryValueHistory = null;
      }
    }
  }

  ngOnInit(): void {}
  /**
   * 取消
   */

  handleCancel() {
    this.energyCode = '';
    this.isVisibleForm = false;
    this.energyType = '';

    this.meService.setInputValueType = [];
    this.queryDate = null;
    this.dateMonth = null;
    this.dateRange = null;
    this.shortCutSelect = 1;
    this.entryValue = '';
    this.meFormService.setEntryValueHistory = null;
    this.meFormService.setIsHistroyShow = false;

    this.meOnHideModalForm.emit(false);
  }
  /**
   * 确定
   */
  dataEntrySubmit() {
    const param = this.getParam();
    this.meFormService.getSaveObjectEnery(param);
  }

  /**
   * 能源类型选择
   * @param item
   */
  energyChange(item: string, node: any) {
    this.meService.getEnergyItem({
      code: item,
      count: false,
      unit: node?.[0]?.origin.unit,
    });
    this.meService.setEnergyCode = item;

    this.queryDate = null;
    this.dateMonth = null;
    this.dateRange = null;
    this.shortCutSelect = 1;
    this.entryValue = '';
    this.meFormService.setEntryValueHistory = null;
    this.meFormService.setIsHistroyShow = false;
  }
  /**
   * 录入值类型
   * @param item
   */
  valueTypeChange(item: any) {
    this.energyType = item;
    this.queryDate = null;
    this.entryValue = null;
    this.dateMonth = null;
    this.dateRange = [];
    this.shortCutSelect = 1;
    this.meFormService.setIsHistroyShow = false;
    this.meFormService.setEntryValueHistory = null;
  }
  /**
   * 录入对象提交
   * @param item
   */
  submitSelectChange(item: selectDdeviceType) {
    // 清空选中的所有的值，重新赋值
    this.energyType = null;
    this.meService.setInputValueType = [];
    this.queryDate = null;
    this.dateMonth = null;
    this.shortCutSelect = 1;
    this.isShareType = '2';
    this.entryValue = '';
    this.meFormService.setEntryValueHistory = null;
    this.meFormService.setIsHistroyShow = false;
    this.ShareType = null;
    this.dateRange = [];
    // 赋值
    this.objectData = item; // console.log(item)
    if (item.deviceId && item.submit) {
      const valueInputType = [
        { value: '1', name: '消耗值' },
        { value: '2', name: '表头值' },
      ];
      this.meService.setInputValueType = valueInputType;
    } else if (!item.deviceId && item.submit && item.objectId) {
      const valueInputType = [{ value: '1', name: '消耗值' }];
      this.meService.setInputValueType = valueInputType;
    } else if (!item.objectId && !item.deviceId && !item.submit) {
      const valueInputType = [
        { value: '1', name: '消耗值' },
        { value: '2', name: '表头值' },
      ];
      this.meService.setInputValueType = valueInputType;
    } else {
      const valueInputType = [
        { value: '1', name: '消耗值' },
        { value: '2', name: '表头值' },
      ];
      this.meService.setInputValueType = valueInputType;
    }
    this.energyType = '1';
    this.meFormService.setIsHistroyShow = false;
    this.meFormService.setEntryValueHistory = null;
  }
  /**
   * 分摊变化
   */
  isShareChange() {
    this.disabledClick = '';
    this.meFormService.setIsHistroyShow = false;
    this.meFormService.setEntryValueHistory = null;
  }
  /**
   * 快捷选时切换
   */
  shortcutOnSelect(item: number) {
    this.queryDate = null;
    this.dateMonth = null;
    this.dateRange = [];
    this.shortCutSelect = item;
    this.meFormService.setIsHistroyShow = false;
    this.meFormService.setEntryValueHistory = null;
  }
  /**
   * 日期区间切换
   */
  dateModelChange(item: any) {
    this.dateMonth = item;
    this.meFormService.setIsHistroyShow = false;
    this.meFormService.setEntryValueHistory = null;
    // console.log(this.isHistroyShow)
  }
  dateModelrangeChange(item: any) {
    this.dateRange = item;
  }
  /**
   * 日期切换
   */
  dateOnChange(item: any) {
    this.queryDate = item;
    this.meFormService.setIsHistroyShow = false;
    this.meFormService.setEntryValueHistory = null;
    //  console.log(this.isHistroyShow)
  }
  /**
   * 录入值历史参考值
   */
  getObjectEnery() {
    // if (this.energyType !== '1') {
    //   return;
    // } else {
    //   if (this.isShareType !== '2') {
    //     if (this.shortCutSelect !== 2) {
    //       return;
    //     }
    //   }
    // }
    // const param = this.getObjectEneryParam();
    // this.meFormService.getObjectEnery(param);
  }
  modalShowPopoer() {
    if (this.energyType !== '1') {
      return;
    } else {
      if (this.isShareType !== '2') {
        if (this.shortCutSelect !== 2) {
          return;
        }
      }
    }
    const param = this.getObjectEneryParam();
    this.meFormService.getObjectEnery(param);
    // 录入值展示弹窗
    const pNode = document.getElementById('energyValueId');
    const pNodePosition = pNode.getBoundingClientRect();
    const pTop = pNodePosition.top + 40 + 'px';
    // console.log(pNodePosition);
    this.popoverStyle = {
      top: pTop,
      left: pNodePosition.left + 'px',
    };
  }
  /**
   *  人工录入查询历史能耗值参数
   * @returns
   */
  getObjectEneryParam() {
    // 对象
    let objectId = null;
    let objectName = '';
    let objectType = '';
    if (this.objectData) {
      if (this.objectData.deviceId) {
        objectId = this.objectData.deviceId;
      } else if (this.objectData.objectId && !this.objectData.deviceId) {
        objectId = this.objectData.objectId;
      }
      objectName = this.objectData.objectName;
      objectType = this.objectData.objectType;
    }
    let satrt = '';
    if (this.shortCutSelect === 2) {
      if (this.dateMonth) {
        satrt = moment(this.dateMonth).format('YYYY-MM');
      }
    } else {
      if (this.queryDate) {
        satrt = moment(this.queryDate).format('YYYY-MM-DD'); //console.log(satrt)
      }
    }
    // console.log(this.dateMonth, this.queryDate, this.shortCutSelect)
    const param: getObjectEnery = {
      dateType: String(this.shortCutSelect),
      endDate: satrt,
      startDate: satrt,
      energyCode: this.energyCode,
      energyType: this.energyType,
      objectId: objectId,
      objectName: objectName,
      objectType: objectType,
      InputName: '录入',
    };
    if (this.energyType === '1') {
      param.allocationFlag = this.isShareType;
      if (this.isShareType === '1') {
        param.allocationRule = String(this.ShareType);
      }
    }

    if (objectType === '2') {
      param.pointNumber = this.objectData.pointNumber;
      param.standardPointCode = this.objectData.standardPointCode;
    }
    return param;
  }
  /**
   * 录入确定参数
   * @returns
   */
  getParam() {
    let satrt = '';
    let end = '';
    if (this.energyType === '1') {
      if (this.shortCutSelect === 2) {
        if (this.dateMonth) {
          satrt = moment(this.dateMonth).format('YYYY-MM');
          end = moment(this.dateMonth).format('YYYY-MM');
        }
      } else {
        if (this.isShareType === '1') {
          if (this.dateRange && this.dateRange.length > 0) {
            satrt = moment(this.dateRange[0]).format('YYYY-MM-DD');
            end = moment(this.dateRange[1]).format('YYYY-MM-DD');
          }
        } else {
          if (this.queryDate) {
            satrt = moment(this.queryDate).format('YYYY-MM-DD');
            end = moment(this.queryDate).format('YYYY-MM-DD');
          }
        }
      }
    } else if (this.energyType === '2') {
      if (this.queryDate) {
        satrt = moment(this.queryDate).format('YYYY-MM-DD');
        end = moment(this.queryDate).format('YYYY-MM-DD');
      }
    }
    if (this.isShareType === '2') {
      this.ShareType = null;
    }

    // 对象
    let objectId = null;
    let objectName = '';
    let objectType = ''; //console.log(this.objectData)
    if (this.objectData) {
      if (this.objectData.deviceId) {
        objectId = this.objectData.deviceId;
      } else if (this.objectData.objectId && !this.objectData.deviceId) {
        objectId = this.objectData.objectId;
      }
      objectName = this.objectData.objectName;
      objectType = this.objectData.objectType;
    }

    const param: manualEntryParam = {
      dateType: String(this.shortCutSelect),
      endDate: end,
      startDate: satrt,
      energyCode: this.energyCode,
      entryType: this.energyType,
      entryValue: String(this.entryValue) ? Number(this.entryValue) : -10000,
      objectId: objectId,
      objectName: objectName,
      objectType: objectType,
    };
    if (this.energyType === '1') {
      param.allocationFlag = this.isShareType;
      if (this.isShareType === '1') {
        param.allocationRule = !this.ShareType ? '' : String(this.ShareType);
      }
    }

    if (objectType === '2') {
      param.pointNumber = this.objectData.pointNumber;
      param.standardPointCode = this.objectData.standardPointCode;
    }

    return param;
  }
  /**
   * 选中历史值
   * @param item
   */
  entryValueClick(item: any) {
    this.entryValue = item;
    this.meFormService.setIsHistroyShow = false;
  }
  /**
   * 分摊时间数据提示
   * @param item
   * @returns
   */
  ShareTypeTip(item: any) {
    let tip = '';
    if (item === '1') {
      tip = '平均分摊至当月';
    } else if (item === '2') {
      tip = '同比比例分摊至去年当月';
    } else if (item === '3') {
      tip = '环比比例分摊至上月';
    }
    return tip;
  }
  /**
   * 分摊变化
   * @param item
   */
  shareTypeChange(item: any) {
    let tip = '';
    if (this.shortCutSelect === 2) {
      if (item === '1') {
        tip = '平均分摊至当月';
      } else if (item === '2') {
        tip = '同比比例分摊至去年当月';
      } else if (item === '3') {
        tip = '环比比例分摊至上月';
      }
    }

    this.shareTypeTip = tip;
  }

  backdrop(e: Event) {
    if (e) {
      (e.target as HTMLDivElement)?.className?.includes?.('backdrop') &&
        (this.meFormService.setIsHistroyShow = false);
    } else {
      this.meFormService.setIsHistroyShow = false;
      this.meFormService.setEntryValueHistory = null;
    }
  }
}
