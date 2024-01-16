import { ref } from 'vue';
import { CalculationIndicatoItem, ADSR_IQueryParams, calculationService } from './adsr-calculation-indicators.api';
import message from '@/utils/message';
export class AdsrCalculationIndicatorService {
  //#region
  private _dataSource = ref<CalculationIndicatoItem[]>([]);
  public indicatorItem = ref<CalculationIndicatoItem | null>(null);
  private _total = ref<number>(0);
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

  public get dataSource(): CalculationIndicatoItem[] {
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

  //#endregion

  //#region 查询
  async query() {
    this._loading.value = true;
    try {
      const res = await calculationService.getIndicatorList(this._queryParams.value);
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
  //#endregion

  //#region 新增
  handleDialogShow() {
    this.title.value = '新增计算指标';
    this.indicatorItem.value = null;
    this._visible.value = true;
  }
  handleClose = () => {
    this.query();
    this._visible.value = false;
  };
  //#endregion

  // 查看详情
  async seeDetail(data: CalculationIndicatoItem) {
    try {
      const res = await calculationService.getIndicatorDetails(data.id);
      if (res?.code === 200) {
        this.indicatorItem.value = res.data;
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
  async editIndicator(data: CalculationIndicatoItem) {
    try {
      const res = await calculationService.getIndicatorDetails(data.id);
      if (res?.code === 200) {
        this.title.value = '编辑计算指标';
        this.indicatorItem.value = res.data;
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
  async addOrEditIndicator(data: CalculationIndicatoItem) {
    if (this.addloading) {
      return;
    }
    this.addloading = true;
    try {
      const res = await calculationService.addOrEditIndicator(data);
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
  async deleteIndicator(scope: any) {
    try {
      const res = await calculationService.deleteIndicator(scope.row.id);
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
}
