import { Injectable, OnDestroy } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import {
  CSearchBarItem_DatePicker,
  CSearchBarItem_MultipleSelect,
} from 'src/app/common/components/search-bar/search-bar.api';
import { SearchBarService } from 'src/app/common/components/search-bar/search-bar.service';
import { FreezerCommunicationService } from '../service/freezer-communication.service';
import { FreezerDatabaseService } from '../service/freezer-database.service';

const SEARCH_ITEMS = {
  EFFICIENCY_NODES: new CSearchBarItem_MultipleSelect<number>(
    '能效节点',
    [],
    [],
    {
      width: 380,
      placeholder: '请选择能效节点',
      max: 10,
    }
  ),
  BEGIN_DATE: new CSearchBarItem_DatePicker('开始日期', new Date(), 'date', {
    width: 240,
  }),
  END_DATE: new CSearchBarItem_DatePicker('结束日期', new Date(), 'date', {
    width: 240,
  }),
};
Object.freeze(SEARCH_ITEMS);

@Injectable()
export class FreezerSearchService
  extends SearchBarService
  implements OnDestroy
{
  public get isLoading(): boolean {
    return this.sDatabase.refEfficiencyNodes$.isLoading;
  }

  private _subscriptions: Subscription[] = [];

  constructor(
    private nzMessage: NzMessageService,
    private sCommunication: FreezerCommunicationService,
    private sDatabase: FreezerDatabaseService
  ) {
    super(Object.values(SEARCH_ITEMS));

    this._subscriptions.push(
      SEARCH_ITEMS.EFFICIENCY_NODES.eventLimitExceed.subscribe(() =>
        this.nzMessage.error('能效节点最多可选择10个')
      )
    );

    this.initSearchItems()
      .then(() => this.doSearch())
      .catch((error) => {
        if (error && !error?.toLowerCase()?.includes('login')) {
          this.nzMessage.error(`查询失败，${error}`);
        }
      });
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public doSearch(): void {
    if (this.verify()) {
      this.sDatabase.dataQuery = {
        nodes: SEARCH_ITEMS.EFFICIENCY_NODES.model,
        begin: SEARCH_ITEMS.BEGIN_DATE.model,
        end: SEARCH_ITEMS.END_DATE.model,
      };

      this.sDatabase.refSearchEvent.emit();
      if (this.sDatabase.dataQuery.nodes.length > 1) {
        this.sCommunication.queryParameterList();
      } else {
        this.sCommunication.queryConsumptionOverview();
        this.sCommunication.queryEfficiencyBenchmark();
        this.sCommunication.queryParameterLevel();
        this.sCommunication.queryEfficiencyAnalysis();
      }
    }
  }

  private async initSearchItems(): Promise<void> {
    SEARCH_ITEMS.BEGIN_DATE.disabledDate = (current) =>
      new Date(current.toLocaleDateString()) >
      new Date(new Date().toLocaleDateString());

    SEARCH_ITEMS.END_DATE.disabledDate = (current) => {
      const begin = SEARCH_ITEMS.BEGIN_DATE.model;
      return (
        new Date(current.toLocaleDateString()) >
          new Date(new Date().toLocaleDateString()) ||
        new Date(current.toLocaleDateString()) <
          new Date(begin.toLocaleDateString()) ||
        new Date(current.toLocaleDateString()) >
          new Date(begin.getFullYear(), begin.getMonth(), begin.getDate() + 30)
      );
    };

    SEARCH_ITEMS.BEGIN_DATE.modelChangeHandler = (v) => {
      const end = new Date(v.getFullYear(), v.getMonth(), v.getDate() + 30);
      const today = new Date(new Date().toLocaleDateString());
      SEARCH_ITEMS.END_DATE.model = end > today ? today : end;
    };

    return new Promise((resolve, reject) => {
      const subscription = this.sDatabase.refEfficiencyNodes$.subscribe(
        (nodes) => {
          switch (this.sDatabase.refEfficiencyNodes$.state) {
            case 'success':
              subscription.unsubscribe();

              SEARCH_ITEMS.EFFICIENCY_NODES.options =
                nodes?.map((node) => ({ label: node.name, value: node.id })) ??
                [];

              // 此处需调用目标所持有的this指针，不建议使用箭头函数
              SEARCH_ITEMS.EFFICIENCY_NODES.reset = function (): void {
                this.model = this.options.length ? [this.options[0].value] : []; // 指针指向EFFICIENCY_NODES实例
              };
              SEARCH_ITEMS.EFFICIENCY_NODES.reset();

              resolve();
              break;
            case 'error':
              reject(this.sDatabase.refEfficiencyNodes$.message);
              break;
            default:
              break;
          }
        }
      );
      this.sCommunication.queryEfficiencyNodes();
      setTimeout(() => {
        subscription.unsubscribe();
        reject('网络不佳');
      }, 2000);
    });
  }

  private verify(): boolean {
    if (!SEARCH_ITEMS.EFFICIENCY_NODES.model?.length) {
      this.nzMessage.error('请选择能效节点');
      return false;
    }

    if (SEARCH_ITEMS.EFFICIENCY_NODES.model?.length > 10) {
      this.nzMessage.error('能效节点最多可选择10个');
      return false;
    }

    return true;
  }
}
