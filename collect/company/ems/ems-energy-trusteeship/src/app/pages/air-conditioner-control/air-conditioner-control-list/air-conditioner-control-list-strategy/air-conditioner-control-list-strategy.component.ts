import { Component, HostListener, Input, OnInit } from '@angular/core';
import { map, switchMap, fromEvent } from 'rxjs';
import { ACC_EStrategyState, ACC_EStrategyType, ACC_IStrategyItem } from '../../air-conditioner-control.api';
import { ExcutionDetailsType, StrategyDetailType, TrategyProcessItemType } from '../air-conditioner-control-list.type';
import * as lodash from 'lodash';
import { AirConditionerControlListService } from '../air-conditioner-control-list.service';
@Component({
  selector: 'ems-air-conditioner-control-list-strategy',
  templateUrl: './air-conditioner-control-list-strategy.component.html',
  styleUrls: ['./air-conditioner-control-list-strategy.component.less'],
})
export class AirConditionerControlListStrategyComponent implements OnInit {
  @Input() todayStrategyData: StrategyDetailType[];
  @Input() moreData: Array<{ date: string; list: StrategyDetailType[] }>;
  @Input() moreIndex: number;
  showPopver: boolean;
  strategyProcessData: ExcutionDetailsType[]; //获取策略执行进度
  exceptionMsg: string; // 进度提示
  // 每个月的参数
  monthDataChartParam: any;
  // 进度的位置
  popoverStyle: any = {};

  strategyShowPopver: boolean = false;
  selectStrategy: any = null;
  public get loading(): boolean {
    return this.accListService.strategyLoading;
    // return true;
  }

  public get strategyListData(): TrategyProcessItemType {
    return this.accListService.strategyList;
  }

  public get isEmpty(): boolean {
    return this.accListService.strategyEmpty;
  }

  constructor(private accListService: AirConditionerControlListService) {}

  ngOnInit(): void {
    console.log(this.todayStrategyData);

    if (this.moreData) {
      if (this.moreData && this.moreData.length > 0) {
        if (this.moreData[0].list[0] && this.moreData[0].list.length > 0) {
          this.moreData[0].list[0].collapse = true;
        }
      }
    } else {
      if (this.todayStrategyData && this.todayStrategyData.length > 0) {
        if (this.todayStrategyData[0].details && this.todayStrategyData[0].details.length > 0) {
          this.todayStrategyData[0].collapse = true;
        }
      }
    }
  }
  // 下标
  trackByIndex(index: number) {
    return index;
  }
  collapseChange(item: StrategyDetailType) {
    // 除了自己其他的都关闭
    if (!this.moreData) {
      this.todayStrategyData = lodash.forEach(this.todayStrategyData, (data, i) => {
        if (data.id !== item.id) {
          data.collapse = false;
        }
      });
    }

    if (this.moreData) {
      lodash.forEach(this.moreData, (data, i) => {
        lodash.forEach(data.list, (item2) => {
          if (item2.id !== item.id) {
            item2.collapse = false;
          }
        });
      });
    }

    item.collapse = !item.collapse;
  }

  /**
   * 自动、手动状态
   */
  typeList(item: number) {
    return ACC_EStrategyType[item];
  }
  /**
   * 状态
   * @param item
   * @returns
   */
  statusList(item: ACC_EStrategyState) {
    return ACC_EStrategyState[item];
  }
  strategyChange(strItem: ExcutionDetailsType, item: StrategyDetailType, e: Event, pIndex: number, index: number) {
    const el = e.target as HTMLDivElement;
    if (el.className?.includes?.('backdrop')) {
      return;
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }
    // 获得位置
    const pNode = document.getElementById(this.nodeId(pIndex, index));
    const pNodePosition = pNode.getBoundingClientRect();
    const windowHeighth = document.body.clientHeight;
    const windowWidth = document.body.clientWidth;
    const surplusHeight = windowHeighth - pNodePosition.top;

    let pRight;
    if (this.moreData) {
      pRight = Number(windowWidth - pNodePosition.right) + 'px';
    } else {
      pRight = Number(windowWidth - pNodePosition.right) + 'px';
    }

    if (surplusHeight > 220) {
      this.popoverStyle = {
        top: pNodePosition.top + 8 + 'px',
        right: pRight,
      };
    } else {
      this.popoverStyle = {
        bottom: windowHeighth - pNodePosition.top + 'px',
        right: pRight,
        'margin-bottom': '30px',
      };
    }

    // 获得位置结束
    if (this.moreData) {
      lodash.forEach(this.moreData, (data, i) => {
        lodash.forEach(data.list, (itemS) => {
          lodash.forEach(itemS.details, (item2) => {
            item2.showPopver = false;
          });
        });
      });
    } else {
      lodash.forEach(item.details, (data, i) => {
        data.showPopver = false;
      });
    }

    if (strItem.showPopver) {
      this.selectStrategy = null;
      strItem.showPopver = false;
      this.strategyShowPopver = false;
    } else {
      this.selectStrategy = strItem;
      strItem.showPopver = true;
      this.strategyShowPopver = true;
      // 每次点击清空进组数据，重新调用接口

      this.accListService.setStrategyList = null;
      this.accListService.queryStrategyProcessList(strItem.id);
    }
  }
  backdrop(e: Event) {
    if (e) {
      (e.target as HTMLDivElement)?.className?.includes?.('backdrop') && (this.strategyShowPopver = false);
    } else {
      this.strategyShowPopver = false;
    }
    this.selectStrategy = null;
  }
  /**
   *
   * @param pIndex 父级的下标
   * @param index 自己父级的下标
   * @returns
   */
  nodeId(pIndex: number, index: number) {
    if (this.moreData) {
      return `accls-list-content-more-${this.moreIndex}-${pIndex}-${index}`;
    } else {
      return `accls-list-content-${pIndex}-${index}`;
    }
  }
  /**
   * close
   * @param item
   */
  startegyClose(e: Event) {
    this.selectStrategy = null;

    this.strategyShowPopver = false;
  }

  mapColor(state: ACC_EStrategyState): string {
    switch (state) {
      case ACC_EStrategyState.执行失败:
        return 'rgba(245, 34, 45, 100)';
      case ACC_EStrategyState.下发失败:
        return 'rgba(245, 34, 45, 100)';
      case ACC_EStrategyState.未下发:
        return 'rgba(241, 158, 29, 100)';
      default:
        return null;
    }
  }

  strategyIndex(item: any) {
    lodash.findIndex(item, (o, i) => {
      return i + 1;
    });
  }

  typeColor(type: ACC_EStrategyType): object {
    switch (type) {
      case ACC_EStrategyType.工单:
        return {
          'background-color': 'rgba(230, 247, 255, 1)',
          color: 'rgba(24, 144, 255, 100)',
        };
      case ACC_EStrategyType.自动:
        return {
          'background-color': 'rgba(246, 255, 237, 1)',
          color: 'rgba(82, 196, 26, 1)',
        };
      default:
        return null;
    }
  }
}
