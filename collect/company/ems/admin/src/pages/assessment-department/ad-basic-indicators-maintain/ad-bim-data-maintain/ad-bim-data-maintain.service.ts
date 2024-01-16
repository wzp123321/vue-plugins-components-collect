/*
 * @Description: 基础指标维护服务
 * @Author: zpwan
 * @Date: 2022-10-13 08:56:40
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-11-18 17:19:32
 */
import { ref, nextTick } from 'vue';
import {
  ADBIM_IDataMaintainTableVO,
  ADBIM_ICellEditorVO,
  ADBIM_IDataMaintainRes,
  ADBIM_IDataMaintainColumnVO,
  ADBIM_IExceptionVO,
} from './ad-bim-data-maintain.api';
import { postRequest } from '@/services/request';
import { EXCEL_ACCEPT_EXTENSIONS, MAXIMUN_SIZE, MAXIMUN_TOTAL_SIZE } from '../../../../services/common/common-api';

import { FUploadHandler, verifyUpload } from '@/utils/token';
import message from '@/utils/message';
import { FGetSession } from '@/utils/token';
import { cloneDeep } from 'lodash';

enum EPath {
  基础指标维护模板查询 = '/admin/apportion/basicIndex/maintain/data/list',
  基础指标维护页面单点数据修改 = '/admin/apportion/basicIndex/maintain/data/modify',
  基础指标维护导入模板 = '/admin/apportion/basicIndex/maintain/import',
}

export class DataMaintainService {
  //#region
  private _dataSource = ref<ADBIM_IDataMaintainTableVO[]>([]);

  private _columns = ref<ADBIM_IDataMaintainColumnVO[]>([]);

  private _lockColumns = ref<string[]>([]);

  private _rowSpans = ref<number[][]>([]);

  private _loading = ref<boolean>(false);

  private _importing = ref<boolean>(false);

  private _editing = ref<boolean>(false);

  private _templateVO = ref<ADBIM_IDataMaintainRes>({
    hiddenColumns: [],
    lockColumns: [],
    tableData: [],
    mergeDTOList: [],
    tableHeads: [],
  });

  private _editorVO = ref<ADBIM_ICellEditorVO>({
    rowIndex: -1,
    colunKey: '',
    originValue: '',
  });

  private _exceptionList = ref<ADBIM_IExceptionVO[]>([]);

  private _exceptionVisible = ref<boolean>(false);

  public get dataSource(): ADBIM_IDataMaintainTableVO[] {
    return this._dataSource.value;
  }

  public get columns(): ADBIM_IDataMaintainColumnVO[] {
    return this._columns.value;
  }

  public get lockColumns(): string[] {
    return this._lockColumns.value;
  }

  public get rowSpans(): number[][] {
    return this._rowSpans.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get importing(): boolean {
    return this._importing.value;
  }

  public get editing(): boolean {
    return this._editing.value;
  }

  public get editorVO(): ADBIM_ICellEditorVO {
    return this._editorVO.value;
  }

  public get templateVO(): ADBIM_IDataMaintainRes {
    return this._templateVO.value;
  }

  public get exceptionList(): ADBIM_IExceptionVO[] {
    return this._exceptionList.value;
  }

  public get exceptionVisible(): boolean {
    return this._exceptionVisible.value;
  }

  public set exceptionVisible(value: boolean) {
    this._exceptionVisible.value = value;
  }
  //#endregion

  constructor() {
    this._dataSource.value = [];
    this._columns.value = [];
  }

  async query() {
    try {
      const resordId = FGetSession('id') ?? '';
      this._columns.value = [];
      this._dataSource.value = [];
      this._exceptionList.value = [];
      this._lockColumns.value = [];
      this._rowSpans.value = [];
      this._loading.value = true;
      const res = await postRequest(EPath.基础指标维护模板查询, resordId);
      if (res?.code === 200 && res?.data) {
        this._templateVO.value = res?.data;
        this.convertTable(res?.data);
        this.convertColumn(res?.data?.tableHeads, res?.data?.lockColumns, res?.data?.hiddenColumns);
      } else {
        this._templateVO.value = {
          hiddenColumns: [],
          lockColumns: [],
          mergeDTOList: [],
          tableData: [],
          tableHeads: [],
        };
      }
    } catch (error) {
      this._templateVO.value = {
        mergeDTOList: [],
        hiddenColumns: [],
        lockColumns: [],
        tableData: [],
        tableHeads: [],
      };
    } finally {
      this._loading.value = false;
    }
  }

  convertTable(res: ADBIM_IDataMaintainRes): void {
    try {
      // 生成二维合并列数组
      this._rowSpans.value = res?.tableData?.map((item) => {
        return item?.map(() => {
          return 1;
        });
      });

      if (res?.tableData?.length) {
        res?.tableData?.forEach((item: string[], index: number) => {
          /**
           * 生成一个包含各个列名的对象
           * 如果与前一个楼栋名不同 则斑马纹+1
           */
          let obj: ADBIM_IDataMaintainTableVO = {
            stripeIndex: 0,
          };
          item?.forEach((childItem: string, childIndex: number) => {
            obj = {
              ...obj,
              [`${res?.tableHeads[childIndex]?.[0]}`]: childItem,
              [`${res?.tableHeads[childIndex]?.[0]}-changeIndex`]: childIndex,
            };
            // 如果有id
            if (res?.tableHeads[childIndex]?.[1]) {
              obj = {
                ...obj,
                [`${res?.tableHeads[childIndex]?.[0]}-ID`]: res?.tableHeads[childIndex]?.[1],
              };
            }
          });
          this._dataSource.value.push(obj);
        });

        // 如果mergeDTOList不为空则是有合并项
        if (res?.mergeDTOList?.length) {
          // 拿到列索引为0的 就是树节点名称（需要判断是否合并的列）
          const minColumn = res?.mergeDTOList?.filter((item) => {
            return item?.endColumn === 0;
          });
          /**
           * 在范围内的 判断开始行的前一条是否有数据 如果有则在前一行的基础上加1 如果没有则是0
           * 不在范围内的且不在第一行的 在当前范围结束行的基础上加1
           */
          let map = new Map();
          function checkInScope(index: number) {
            let i = minColumn?.findIndex((item) => {
              return index >= item.startRow && index <= item.endRow;
            });

            return {
              start: i === -1 ? -1 : minColumn[i].startRow === index && index !== 0 ? index - 1 : minColumn[i].startRow,
              isStartFlag: i !== -1 && minColumn[i].startRow === index,
            };
          }

          this._dataSource.value = this._dataSource.value?.map((childItem, childIndex) => {
            let { start, isStartFlag } = checkInScope(childIndex);
            // 如果没有在合并范围中的 则返回-1 取它当前索引前一条的stripeIndex再+1
            // 如果再范围的判断是不是等于开始行 如果等于则取它当前索引前一条的stripeIndex再+1 如果不等于开始行则使用开始行
            if (start !== -1) {
              childItem.stripeIndex = childIndex === 0 ? 0 : map.get(start) + (isStartFlag ? 1 : 0);
              map.set(childIndex, childItem.stripeIndex);
            } else {
              if (childIndex !== 0) {
                childItem.stripeIndex = map.get(childIndex - 1) + 1;
              }
              map.set(childIndex, childItem.stripeIndex);
            }
            return childItem;
          });
          console.log(map);
        } else {
          // 如果为空则只需要隔行斑马纹即可
          if (this._dataSource.value?.length > 1) {
            // let stripeIndex = 0;
            this._dataSource.value = this._dataSource.value.map((item, index) => {
              // const cItem: any = cloneDeep(item);
              // // 不是最后一条
              // cItem.stripeIndex = stripeIndex;
              // if (index !== this._dataSource.value?.length - 1) {
              //   // 如果当前两行都有值且不为null 则代表是不同颜色行  如果当前值是null下一行不为null则也代表是不同颜色行
              //   if (
              //     cItem?.[res?.tableHeads?.[0]?.[0]] !== this._dataSource.value[index + 1]?.[res?.tableHeads?.[0]?.[0]]
              //   ) {
              //     stripeIndex += 1;
              //   }
              // }
              // return cItem;
              item.stripeIndex = index;
              return item;
            });
          }
        }

        // 需要处理到的最大列
        // Todo合并行如果没有返回mergeDTOList 需要自己算！！！！！！！
        const maxColumn = res?.mergeDTOList?.[res?.mergeDTOList?.length - 1]?.endColumn;
        for (let i = 0; i <= maxColumn; i++) {
          const arr = res?.mergeDTOList?.filter((item) => {
            return item?.endColumn === i;
          });
          // 遍历每一列需要处理的数据
          arr.forEach((item) => {
            // 开始行需要合并的列是结束行-开始行+1
            this._rowSpans.value[item?.startRow][i] = item?.endRow - item?.startRow + 1;
            for (let j = item?.startRow; j <= item?.endRow; j++) {
              // 大于开始行的置0
              if (j !== item?.startRow) {
                this._rowSpans.value[j][i] = 0;
              }
            }
          });
        }
        this._rowSpans.value = this._rowSpans.value?.map((item) => {
          return item?.filter((childItem, childIndex) => {
            return !res?.hiddenColumns?.includes(childIndex);
          });
        });
      }

      console.log(this._dataSource.value);
    } catch (error) {
      console.warn('convert---table------------', '--error-->', error);
    }
  }

  convertColumn(tableHeads: string[][], lockColumns: number[], hiddenColumns: number[]) {
    this._columns.value = [];
    this._lockColumns.value = [];
    if (tableHeads?.length === 0) {
      return;
    }
    tableHeads?.forEach((item: string[], index: number) => {
      // 处理列
      if (!hiddenColumns?.includes(index)) {
        this._columns.value.push({
          title: item?.[0] ?? '',
          isLock: lockColumns?.includes(index),
        });
      }
    });
    lockColumns.forEach((item) => {
      this._lockColumns.value.push(tableHeads[item]?.[0]);
    });
  }

  // 模板导入
  importFile = () => {
    return new Promise(async (resolve) => {
      const file = await FUploadHandler(Object.keys(EXCEL_ACCEPT_EXTENSIONS).join());
      if (!verifyUpload([], file, MAXIMUN_SIZE, EXCEL_ACCEPT_EXTENSIONS, MAXIMUN_TOTAL_SIZE)) {
        return false;
      }
      this._importing.value = true;
      const messageInstance = message.loading('正在导入');
      try {
        const formData = new FormData();
        const tableHeadCodes: string[] = this._templateVO.value.tableHeads?.map((item) => {
          return item?.[1];
        });
        const tableHeadNames: string[] = this._templateVO.value.tableHeads?.map((item) => {
          return item?.[0];
        });
        formData.append('file', file);

        formData.append('lockColumns', this._templateVO.value.lockColumns?.join(','));
        formData.append('recordId', FGetSession('id') as string);
        formData.append('tableHeadCodes', tableHeadCodes.join(','));
        formData.append('tableHeadNames', tableHeadNames.join(','));

        const res = await postRequest(EPath.基础指标维护导入模板, formData);
        if (res && res.code === 200 && res.success) {
          if (Array.isArray(res.data)) {
            this._exceptionList.value = res.data ?? [];
            this._exceptionVisible.value = true;
            resolve(false);
          } else {
            resolve(true);
            message.success(res?.data ?? '导入成功');
          }
        } else {
          resolve(false);
          message.error(res.message ?? '导入失败');
        }
      } catch (error) {
        resolve(false);
        message.error('导入失败');
      } finally {
        messageInstance.close();
        this._importing.value = false;
      }
    });
  };

  handleClose = () => {
    this._exceptionList.value = [];
    this._exceptionVisible.value = false;
  };

  /**
   * 根据行列判断 当前单元格是否可编辑,要考虑被隐藏的
   * lockColumns： [0, 8, 12, 14]
   * 1-7列的根据0列是否有值判断是否可编辑
   * 9-11列的根据8列是否有值判断是否可编辑
   * 13列的根据12列是否有值判断是否可编辑
   * @param row
   * @param column
   * @returns true-可编辑  false-不可编辑
   */
  checkEditable(row: number, key: string) {
    const column = this._templateVO.value?.tableHeads?.findIndex((item) => {
      return item?.includes(key);
    });

    let columnName = '';
    if (this._templateVO.value?.lockColumns?.includes(column)) {
      return false;
    }
    // 比最后一列大
    if (column > this._templateVO.value?.lockColumns[this._templateVO.value?.lockColumns?.length - 1]) {
      columnName =
        this._templateVO.value?.tableHeads?.[
          this._templateVO.value?.lockColumns[this._templateVO.value?.lockColumns?.length - 1]
        ]?.[0];

      return !!this._dataSource.value?.[row]?.[columnName];
    }
    // 先判断在哪个区间
    let idx = 0;
    this._templateVO.value?.lockColumns?.forEach((item, index) => {
      if (column > item && column < this._templateVO.value?.lockColumns?.[index + 1]) {
        idx = index;
      }
    });
    columnName = this._templateVO.value?.tableHeads?.[this._templateVO.value?.lockColumns[idx]]?.[0];
    return !!this._dataSource.value?.[row]?.[columnName];
  }

  /**
   * 单元格编辑
   * @param rowIndex 行索引
   * @param key 字段key
   * @param value 原始值
   */
  handleEditorShow(e: Event, rowIndex: number, key: string, value: string | number) {
    if (this._editing.value) {
      message.error('数据编辑中');
      return;
    }

    this._editorVO.value.rowIndex = rowIndex;
    this._editorVO.value.colunKey = key;
    this._editorVO.value.originValue = value ? String(value) : '';

    nextTick(() => {
      (e.target as HTMLElement).parentNode?.querySelector('input')?.focus();
    });
  }

  /**
   * 单元格编辑 如果前后数据没有变化则不进行编辑
   * 编辑成功后需要同步修改原始数据
   * 编辑失败后需要重置数据
   * @param value
   * @returns
   */
  async handleCellEdit(value: string | number) {
    const { lockColumns, tableData } = this._templateVO.value;
    const { rowIndex, colunKey, originValue } = this._editorVO.value;
    if (value === originValue || (!value && !originValue)) {
      this._editorVO.value.rowIndex = -1;
      this._editorVO.value.colunKey = '';
      this._editorVO.value.originValue = '';
      this._editing.value = false;
      return;
    }

    try {
      const changeIndex = this._dataSource.value?.[rowIndex]?.[`${colunKey}-changeIndex`];
      let newTable = cloneDeep(tableData[rowIndex]);
      newTable[changeIndex] = String(value);
      const params = {
        basicIndexId: this._dataSource.value[rowIndex][`${colunKey}-ID`],
        changeIndex,
        dataAfterChange: newTable,
        dataBeforeChange: tableData[rowIndex],
        lockColumns,
        recordId: FGetSession('id'),
      };

      this._editing.value = true;
      const res = await postRequest(EPath.基础指标维护页面单点数据修改, params);
      if (res?.code === 200) {
        message.success('编辑成功');
        this._templateVO.value.tableData[rowIndex][changeIndex] = !!value ? String(value) : '';
        this._editorVO.value.rowIndex = -1;
        this._editorVO.value.colunKey = '';
        this._editorVO.value.originValue = String(value);
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res?.message ?? '编辑失败');
        }
        this._dataSource.value[rowIndex] = {
          ...this._dataSource.value[rowIndex],
          [colunKey]: originValue,
        };
      }
    } catch (error) {
      message.error('编辑失败');
      this._dataSource.value[rowIndex] = {
        ...this._dataSource.value[rowIndex],
        [colunKey]: originValue,
      };
      console.log('编辑----------', 'error---->', error);
    } finally {
      this._editing.value = false;
    }
  }
}
