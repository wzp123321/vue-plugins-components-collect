import { ref, nextTick } from 'vue';

import { CAR_IColumnVO, CAR_IEditStore, CAR_IRes } from './car-table.api';
import { CAR_IQueryParams } from '../car-searchbar/car-searchbar.api';
import { FResHandler, TOKEN } from '../../management-analysis/ma-annual-details/services/services.api';

import { postRequest } from '@/service/request';

enum EPath {
  查询成本补录数据 = '/financial/supplement/showTable',
  单点编辑成本补录 = '/financial/supplement/update',
}

import message from '@/utils/message';
class CarTableService {
  //#region

  private _dataSource = ref<{ [key: string]: string }[]>([]);

  private _columns = ref<CAR_IColumnVO[]>([]);

  private _height = ref<string>('400px');

  private _editStore = ref<CAR_IEditStore>({
    rowIndex: -1,
    columnKey: '',
    originValue: '',
  });

  private _loading = ref<boolean>(true);

  private _is_editing = ref<boolean>(false);

  private queryParams: CAR_IQueryParams = {
    valueType: '',
    year: new Date().getFullYear(),
  };

  public get dataSource(): { [key: string]: string }[] {
    return this._dataSource.value;
  }

  public get columns(): CAR_IColumnVO[] {
    return this._columns.value;
  }

  public get height(): string {
    return this._height.value;
  }

  public get editStore(): CAR_IEditStore {
    return this._editStore.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get is_editing(): boolean {
    return this._is_editing.value;
  }
  //#endregion

  constructor() {
    this._dataSource.value = [];
    this.mapTableHeight();
  }

  async query(params: CAR_IQueryParams) {
    if (!params?.clickTrigger) {
      return;
    }
    this.queryParams = params;
    if (!params.year && params?.clickTrigger) {
      this._loading.value = false;
      nextTick(() => {
        this.mapTableHeight();
      });
      return;
    }
    try {
      this._loading.value = true;
      const res = await postRequest(EPath.查询成本补录数据, {
        ...params,
        ...TOKEN,
      });
      const data = FResHandler<string[][]>(res);
      if (data?.length) {
        this.convertColumn(data?.length >= 1 ? data?.[0] : []);
        this.convertData(data?.length > 1 ? data?.slice(1, data?.length) : []);
      } else {
        this._columns.value = [];
        this._dataSource.value = [];
      }
    } catch (error) {
      this._columns.value = [];
      this._dataSource.value = [];
    } finally {
      this._loading.value = false;

      nextTick(() => {
        this.mapTableHeight();
      });
    }
  }

  mapTableHeight() {
    const container = document.querySelector('.car-table');
    if (container) {
      this._height.value = window.getComputedStyle(container, 'height')?.height;
      if (Number(this._height.value) < 240) {
        this._height.value = '240px';
      }
    }
  }

  convertData(list: string[][]) {
    this._dataSource.value = [];
    if (list?.length) {
      list?.forEach((item, index) => {
        let dataItem = {};
        this._columns.value.forEach((childItem, childIndex) => {
          dataItem = {
            ...dataItem,
            level: item[1],
            isLeaf: item[0] === 'true',
            [childItem.key]: item?.[childIndex + 2] ?? '',
          };
        });
        this._dataSource.value.push(dataItem);
      });
    }
  }

  convertColumn(columns: string[]) {
    this._columns.value = [];
    if (columns?.length) {
      this._columns.value = columns?.map((item, index) => {
        return {
          key: item === '成本明细' ? `${item}_${index}` : item,
          title: item === '成本明细' ? '' : item,
        };
      });
    }
  }

  setEditState(e: Event, rowIndex: number, columnKey: string, value: string) {
    if (this._is_editing.value) {
      message.error('数据编辑中');
      return;
    }
    this._editStore.value.rowIndex = rowIndex;
    this._editStore.value.columnKey = columnKey;
    this._editStore.value.originValue = value ?? '';

    nextTick(() => {
      (e.target as HTMLElement).parentNode?.parentNode?.querySelector('input')?.focus();
    });
  }

  async handleEdit(nodeValue: string) {
    if (this._is_editing.value) {
      message.error('数据编辑中');
      return;
    }
    const { rowIndex, columnKey, originValue } = this._editStore.value;
    if (nodeValue === originValue || (!nodeValue && !originValue) || nodeValue === '-') {
      this._editStore.value.rowIndex = -1;
      this._editStore.value.columnKey = '';
      this._dataSource.value[rowIndex][columnKey] = originValue;
      return;
    }

    try {
      this._is_editing.value = true;
      const { valueType, year } = this.queryParams;
      const nodeId = this._dataSource.value[rowIndex]?.['成本明细_0'];
      if (!nodeId) {
        return;
      }
      const monthArr = columnKey?.split('年');
      const monthStr = monthArr?.[1]?.split('月');
      const month = Number(monthStr?.[0]);
      const params = {
        month,
        nodeId,
        nodeValue: nodeValue === '' || isNaN(Number(nodeValue)) ? '' : Number(nodeValue),
        valueType,
        year,
        ...TOKEN,
      };
      const res: CAR_IRes<boolean> = await postRequest(EPath.单点编辑成本补录, params);
      if (res && res?.success) {
        message.success('编辑成功');
        this._editStore.value.rowIndex = -1;
        this._editStore.value.columnKey = '';

        this._dataSource.value[rowIndex][columnKey] = String(
          nodeValue === '' || isNaN(Number(nodeValue)) ? '' : Number(nodeValue),
        );
      } else {
        message.error(res?.message ?? '编辑失败');
        this._dataSource.value[rowIndex] = {
          ...this._dataSource.value[rowIndex],
          [columnKey]: originValue,
        };
      }
    } catch (error) {
      this._dataSource.value[rowIndex] = {
        ...this._dataSource.value[rowIndex],
        [columnKey]: originValue,
      };
      message.error('编辑失败');
    } finally {
      this._is_editing.value = false;
    }
  }
}

export default CarTableService;
