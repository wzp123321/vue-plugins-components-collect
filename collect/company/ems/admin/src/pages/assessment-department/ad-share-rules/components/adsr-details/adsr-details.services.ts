import { ref } from 'vue';
import { RuleItem, ADSR_IQueryParams, ruleService } from './adsr-details.api';
import message from '@/utils/message';

export class AdsrDetailsService {
  //#region
  private _dataSource = ref<RuleItem[]>([]);
  private _total = ref<number>(0);
  public ruleItem = ref<RuleItem | null>(null);
  public title = ref('');

  private _queryParams = ref<ADSR_IQueryParams>({
    orders: [
      {
        asc: true,
        column: '',
      },
    ],
    pageNum: 1,
    pageSize: 10,
    searchCount: true,
  });

  private _loading = ref<boolean>(true);
  private _visible = ref<boolean>(false);
  private _visibleLook = ref<boolean>(false);

  private _isShowTable = ref<boolean>(true);

  public get dataSource(): RuleItem[] {
    return this._dataSource.value;
  }

  public get queryParams(): ADSR_IQueryParams {
    return this._queryParams.value;
  }

  public get total(): number {
    return this._total.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get visible(): boolean {
    return this._visible.value;
  }
  public set visible(value: boolean) {
    this._visible.value = value;
  }

  public get visibleLook(): boolean {
    return this._visibleLook.value;
  }
  public set visibleLook(value: boolean) {
    this._visibleLook.value = value;
  }

  public get isShowTable(): boolean {
    return this._isShowTable.value;
  }
  //#endregion

  constructor() {
    this.getFlag().then((data) => {
      if (data) {
        this.query();
      } else {
        this._loading.value = false;
      }
    });
  }

  //#region 查询
  async query() {
    this._loading.value = true;
    try {
      const res = await ruleService.getRuleList(this._queryParams.value);
      if (res?.code === 200) {
        this._dataSource.value = res.data?.list.map((item) => {
          return {
            description: item.description ?? '',
            formulaComponentList: item.formulaComponentList ?? [],
            id: item.id ?? 0,
            name: item.name ?? '',
            serialNumber: item.serialNumber ?? '',
          };
        });
        this._total.value = res.data?.total;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    } finally {
      this._loading.value = false;
    }
  }

  handlePageChange = (value: number) => {
    this._queryParams.value.pageNum = value;
    this.query();
  };

  handlePageSizeChange = (value: number) => {
    this._queryParams.value.pageNum = 1;
    this._queryParams.value.pageSize = value;
    this.query();
  };

  handleDialogShow() {
    this.title.value = '新增分摊规则';
    this.ruleItem.value = null;
    this._visible.value = true;
  }

  handleClose = () => {
    this.query();
    this._visible.value = false;
  };

  // 查看详情
  async seeDetail(data: RuleItem) {
    try {
      const res = await ruleService.getRuleDetails(data.id);
      if (res?.code === 200) {
        this.ruleItem.value = res.data;
        this._visibleLook.value = true;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

  // 编辑
  async editRule(data: RuleItem) {
    try {
      const res = await ruleService.getRuleDetails(data.id);
      if (res?.code === 200) {
        this.title.value = '编辑分摊规则';
        this.ruleItem.value = res.data;
        this._visible.value = true;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

  addloading = false;
  async addOrEditRule(data: RuleItem) {
    if (this.addloading) {
      return;
    }
    this.addloading = true;
    try {
      const res = await ruleService.addOrEditRule({
        description: data?.description,
        formulaComponentList: data?.formulaComponentList,
        id: data?.id,
        name: data?.name,
        updateFlag: data?.updateFlag,
      });
      if (res?.code === 200) {
        this.query();
        if (data.updateFlag === '0') {
          message.success('新增成功');
        } else {
          message.success('编辑成功');
        }
        this._visible.value = false;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    } finally {
      this.addloading = false;
    }
  }

  // 删除
  async deleteRule(scope: any) {
    try {
      const res = await ruleService.deleteRule(scope.row.id);
      if (res?.code === 200) {
        this.query();
        message.success('删除成功');
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

  //查询是否存在基础指标
  async getFlag() {
    try {
      const res = await ruleService.getFlag();
      if (res?.code === 200) {
        this._isShowTable.value = res.data;
        return res.data;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }
}
