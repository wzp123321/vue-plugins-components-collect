import { Component, OnInit, Self } from '@angular/core';
import { ManualEntryObjectService } from '../services/manual-entry-object.service';
import { ManualEntryService } from '../services/manual-entry.service';
import { selectDdeviceType, quickTime } from '../manual-entry.api';
import { differenceInCalendarDays } from 'date-fns';
import * as moment from 'moment';
import { ManualEntryTableDataService } from '../services/manual-entry-table-data.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-manual-entry-search',
  templateUrl: './manual-entry-search.component.html',
  styleUrls: ['./manual-entry-search.component.less'],
  providers: [ManualEntryObjectService],
})
export class ManualEntrySearchComponent implements OnInit {
  keyWords: string = '';
  // 分类分项
  public get energyExpandKeys() {
    return this.meService.energyExpandKeyData;
  }
  public get energyList() {
    return this.meService.energyData;
  }
  public get energyCode() {
    return this.meService.getEnergyCode;
  }
  public get energyCodeInit() {
    return this.meService.getEnergyCodeInit;
  }
  energyCodeValue: string = this.energyCode;
  initEnergy: boolean = false;
  objectData: selectDdeviceType = null;

  treeSelectNodes: any;
  treeSelectExpandedKeys: any;
  select: any;

  // 录入值类型
  public get valueTypeData() {
    return this.meService.getInputValueType;
  }
  energyType: string = '1';

  // 服务器的时间
  public get systemTime() {
    return this.meService.getSystemDate;
  }
  // 表头值下的数据时间
  disabledDate: (d: Date) => boolean = (current: Date) => {
    return differenceInCalendarDays(current, new Date(this.systemTime)) > 0;
  };
  dateRange: any;

  // 快捷时间
  quickTimeSelect: number = 2;
  public get quickTimeList(): quickTime[] {
    return this.meService.getQuickTimeList;
  }

  startDate: any;
  endDate: any;
  disabledDate1: (d: Date) => boolean = (current: Date) => {
    const preTime = new Date(this.systemTime);
    return (
      differenceInCalendarDays(
        current,
        new Date(
          preTime.getFullYear(),
          preTime.getMonth(),
          preTime.getDate() - 1
        )
      ) > 0
    );
  };
  disabledDate2: (d: Date) => boolean = (current: Date) => {
    const preTime = new Date(this.systemTime);
    const endTime = new Date(
      preTime.getFullYear(),
      preTime.getMonth(),
      preTime.getDate() - 1
    );
    return (
      differenceInCalendarDays(new Date(this.startDate), current) > 0 ||
      differenceInCalendarDays(current, endTime) > 0
    );
  };

  public get selectClasssType() {
    return this.meObjectService.treeClassId?.selectValue;
  }
  constructor(
    private meService: ManualEntryService,
    @Self() private meObjectService: ManualEntryObjectService,
    private meTableDataService: ManualEntryTableDataService
  ) {
    this.meService.startDataValue.subscribe((data) => {
      if (data) {
        const preTime = new Date(data);
        const lastTime = new Date(
          preTime.getFullYear(),
          preTime.getMonth(),
          preTime.getDate() - 1
        );
        this.startDate = moment(data).startOf('year').format('YYYY-MM-DD');
        this.endDate = moment(lastTime).format('YYYY-MM-DD');
        this.dateRange = [
          moment(data).startOf('year').format('YYYY-MM-DD'),
          moment(lastTime).format('YYYY-MM-DD'),
        ];
      } else {
        const preTime = new Date();
        const lastTime = new Date(
          preTime.getFullYear(),
          preTime.getMonth(),
          preTime.getDate() - 1
        );

        this.startDate = moment(lastTime).startOf('year').format('YYYY-MM-DD');
        this.endDate = moment(lastTime).format('YYYY-MM-DD');
        this.dateRange = [
          moment(lastTime).startOf('year').format('YYYY-MM-DD'),
          moment(lastTime).format('YYYY-MM-DD'),
        ];
      }
    });
        // 重复调用接口，2023-10-12注释
    // this.meObjectService.getTypeList('00000');

    // 能源类型
    this.meService.getEnergy(this.selectClasssType, true);
    // 订阅能源类型勾选
    this.meService.entryCodeItem.subscribe((data) => {
      this.energyCodeValue = '';

      setTimeout(() => {
        this.energyCodeValue = data.code;
        this.meObjectService.getTypeList(data.code);
      });

      if (data.count) {
        setTimeout(() => {
          const param = this.getSearchParam();
          this.meService.getSearchDataList(param);
        }, 300);
      }

      // 表格分页
      this.meTableDataService.Event_Table_PaginationChange.pipe(
        debounceTime(233)
      ).subscribe(() => {
        const param = this.getSearchParam();
        this.meService.getSearchDataList(param);
      });
    });

    // 树节点
    this.meObjectService.getTypeDataList.subscribe((data) => {
      this.treeSelectNodes = data.typeTreeData || [];
      this.treeSelectExpandedKeys = data.typeExpandKeys || [];
    });
  }

  ngOnInit(): void {}
  /**
   * 能源类型选择
   * @param item
   */
  energyChange(item: string) {
    this.meService.setEnergyCode = item;
    this.initEnergy = true;
    this.meService.getEnergyItem({
      code: item,
      count: false,
    });

    const valueInputType = [
      { value: '1', name: '消耗值' },
      { value: '2', name: '表头值' },
    ];
    this.meService.setInputValueType = valueInputType;
    // this.meObjectService.getTypeList(item);
  }
  /**
   * 录入对象提交
   * @param item
   */
  submitSelectChange(item: selectDdeviceType) {
    this.objectData = item;
    //  console.log(item);
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
    this.meService.getObjectSelectData(item);
  }
  /**
   * 录入值类型
   * @param item
   */
  valueTypeChange(item: any) {
    this.energyType = item;
    this.quickTimeSelect = 2;
    this.startDate = moment(this.systemTime)
      .startOf('year')
      .format('YYYY-MM-DD');

    const preTime = new Date(this.systemTime);
    const lastTime = new Date(
      preTime.getFullYear(),
      preTime.getMonth(),
      preTime.getDate() - 1
    );

    if (item === '1') {
      this.endDate = moment(lastTime).format('YYYY-MM-DD');
      this.dateRange = [
        moment(this.systemTime).startOf('year').format('YYYY-MM-DD'),
        moment(lastTime).format('YYYY-MM-DD'),
      ];
      // console.log(this.endDate, this.dateRange);
    } else {
      this.endDate = this.systemTime;
      this.dateRange = [
        moment(this.systemTime).startOf('year').format('YYYY-MM-DD'),
        this.systemTime,
      ];
    }
  }
  /**
   * 区间日期切换
   * @param item
   */
  dateModelChange(item: any) {
    this.dateRange = item;
  }
  /**
   * 快捷时间选择
   * @param item
   */
  shortcutOnSelect(item: number) {
    // 前一天，当天禁止选择
    const preTime = new Date(this.systemTime);
    let lastTime = new Date(
      preTime.getFullYear(),
      preTime.getMonth(),
      preTime.getDate() - 1
    );
    if (item === 1) {
      const prMonths = moment(new Date(this.systemTime))
        .subtract(1, 'months')
        .format('YYYY-MM-DD HH:mm:ss');
      lastTime = new Date(prMonths);
    } else {
      lastTime = new Date(
        preTime.getFullYear(),
        preTime.getMonth(),
        preTime.getDate() - 1
      );
    }
    this.quickTimeSelect = item;
    this.startDate = moment(lastTime).startOf('year').format('YYYY-MM-DD');
    this.endDate = moment(lastTime).format('YYYY-MM-DD');
    this.disabledDate1 = (current: Date) => {
      return differenceInCalendarDays(current, lastTime) > 0;
    };
    this.disabledDate2 = (current: Date) => {
      return (
        differenceInCalendarDays(new Date(this.startDate), current) > 0 ||
        differenceInCalendarDays(current, lastTime) > 0
      );
    };
  }
  /**
   * 开始时间变化
   * @param item
   */
  startDateOnChange(item: any) {
    this.startDate = item;
    const preTime = new Date(this.systemTime);
    let lastTime = new Date(
      preTime.getFullYear(),
      preTime.getMonth(),
      preTime.getDate() - 1
    );
    if (this.quickTimeSelect === 1) {
      const prMonths = moment(new Date(this.systemTime))
        .subtract(1, 'months')
        .format('YYYY-MM-DD HH:mm:ss');
      lastTime = new Date(prMonths);
    } else {
      lastTime = new Date(
        preTime.getFullYear(),
        preTime.getMonth(),
        preTime.getDate() - 1
      );
    }
    if (item) {
      this.disabledDate2 = (current: Date): boolean => {
        // tslint:disable-next-line

        return (
          differenceInCalendarDays(item, current) > 0 ||
          differenceInCalendarDays(current, lastTime) > 0
        );
      };
    } else {
      this.disabledDate2 = (current: Date): boolean => {
        // tslint:disable-next-line
        return differenceInCalendarDays(current, lastTime) > 0;
      };
    }
  }
  /**
   * 结束时间变化
   * @param item
   */
  endDateOnChange(item: any) {
    this.endDate = item;
    const preTime = new Date(this.systemTime);
    const lastTime = new Date(
      preTime.getFullYear(),
      preTime.getMonth(),
      preTime.getDate() - 1
    );
    if (item) {
      this.disabledDate1 = (current: Date): boolean => {
        // tslint:disable-next-line
        return (
          differenceInCalendarDays(current, item) > 0 ||
          differenceInCalendarDays(current, lastTime) > 0
        );
      };
    } else {
      this.disabledDate1 = (current: Date): boolean => {
        // tslint:disable-next-line
        return differenceInCalendarDays(current, lastTime) > 0;
      };
    }
  }
  /**
   * 查询的参数
   */
  getSearchParam() {
    let sDate = '';
    let eDate = '';
    if (this.energyType === '1') {
      if (this.quickTimeSelect === 2) {
        sDate = this.startDate
          ? moment(this.startDate).format('YYYY-MM-DD')
          : '';
        eDate = this.endDate ? moment(this.endDate).format('YYYY-MM-DD') : '';
      } else {
        sDate = this.startDate ? moment(this.startDate).format('YYYY-MM') : '';
        eDate = this.endDate ? moment(this.endDate).format('YYYY-MM') : '';
      }
    } else {
      sDate = this.dateRange[0]
        ? moment(this.dateRange[0]).format('YYYY-MM-DD')
        : '';
      eDate = this.dateRange[1]
        ? moment(this.dateRange[1]).format('YYYY-MM-DD')
        : '';
    }
    let objectId = null;
    let objectType = '';
    if (this.objectData) {
      if (this.objectData.deviceId) {
        objectId = this.objectData.deviceId;
      } else {
        objectId = this.objectData.objectId;
      }
      objectType = this.objectData.objectType;
    }

    const orders = [
      {
        asc: true,
        column: '',
      },
    ];

    const searchCount: boolean = true;
    const param = {
      startDate: sDate,
      endDate: eDate,
      energyCode: this.energyCodeValue ? this.energyCodeValue : '',
      entryType: this.energyType,
      keyWords: this.keyWords,
      objectId: objectId ? String(objectId) : '',
      orders: orders,
      searchCount: searchCount,
      pageNum: this.meTableDataService.Data_Table_Index,
      pageSize: this.meTableDataService.Data_Table_Size,
      objectType: objectType,
      dateType: this.quickTimeSelect === 2 ? 1 : 2,
    };
    return param;
  }
  /**
   * 查询
   */
  toSearch() {
    this.meTableDataService.Data_Table_Index = 1;
    this.meTableDataService.Data_Table_Size = 10;
    const param = this.getSearchParam();
    this.meService.getSearchDataList(param);
    //  this.meService.verificationParam(param);
  }
  /**
   * 重置
   */
  toReset() {
    this.meTableDataService.Data_Table_Index = 1;
    this.meTableDataService.Data_Table_Size = 10;
    this.meService.setEnergyCode = '';
    this.keyWords = '';
    this.energyType = '1';
    this.energyCodeValue = '';
    const valueInputType = [
      { value: '1', name: '消耗值' },
      { value: '2', name: '表头值' },
    ];
    this.meService.setInputValueType = valueInputType;

    this.objectData = null;
    this.quickTimeSelect = 2;
    this.startDate = moment(this.systemTime)
      .startOf('year')
      .format('YYYY-MM-DD');

    const preTime = new Date(this.systemTime);
    const lastTime = new Date(
      preTime.getFullYear(),
      preTime.getMonth(),
      preTime.getDate() - 1
    );

    this.endDate = moment(lastTime).format('YYYY-MM-DD');
    this.dateRange = [
      moment(this.systemTime).startOf('year').format('YYYY-MM-DD'),
      moment(lastTime).format('YYYY-MM-DD'),
    ];

    this.disabledDate1 = (current: Date) => {
      return differenceInCalendarDays(current, lastTime) > 0;
    };
    this.disabledDate2 = (current: Date) => {
      return (
        differenceInCalendarDays(lastTime, current) > 0 ||
        differenceInCalendarDays(current, lastTime) > 0
      );
    };
    setTimeout(() => {
      this.energyCodeValue = this.energyCodeInit;

      //  this.meService.getEnergyItem(this.energyCodeInit);
      this.meService.setEnergyCode = this.energyCodeInit;
      // 重置
      const resetParam = {
        flag: true,
        energyCode: this.energyCodeValue,
      };
      this.meService.getIsReset(resetParam);
      const param = this.getSearchParam();
      this.meService.getSearchDataList(param);
    }, 100);
  }
}
