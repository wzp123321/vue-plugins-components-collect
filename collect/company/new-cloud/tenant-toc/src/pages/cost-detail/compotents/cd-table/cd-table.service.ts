import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { HTTP_EState, HTTP_IResult, HTTP_SCommon } from 'web-core';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import message from '@/utils/message';
import { ElMessageBox } from 'element-plus';

import { CD_CostDetailRes, CD_CostDetailConvertVO, CD_CostDetailVO, CD_QueryParams, ESplitFlag } from './cd-table.api';
import { CD_TS_SelectVO, CD_TS_ICodeName } from './cd-t-screen/cd-t-screen.api';
import { checkAxiosPermission, postRequest } from '@/service/request';

import { EPath, COLUMN_KEYS, PAGES } from './constant';
import { FORBIDDEN_CODES } from '@/config';

interface CD_PaginationVO {
  page: number;
  pageSize: number;
}

/**
 * 表格服务
 * @description  成本明细表格服务
 * @default TableService 表单服务（单例模式）
 */
export class TableService {
  readonly destroy: any;
  public readonly pageSizes = PAGES;
  private _paginationVO = ref<CD_PaginationVO>({
    page: 1,
    pageSize: PAGES[PAGES.length - 1],
  });
  private _ledgerNameList = ref<CD_TS_ICodeName[]>([]);
  private _costNodeList = ref<string[]>([]);
  private _departmentList = ref<CD_TS_ICodeName[]>([]);
  private _employeeTypeList = ref<CD_TS_ICodeName[]>([]);
  public readonly COLUMN_KEYS = COLUMN_KEYS;

  public get ledgerNameList(): CD_TS_ICodeName[] {
    return this._ledgerNameList.value;
  }
  public get costNodeList(): string[] {
    return this._costNodeList.value;
  }
  public get departmentList(): CD_TS_ICodeName[] {
    return this._departmentList.value;
  }
  public get employeeTypeList(): CD_TS_ICodeName[] {
    return this._employeeTypeList.value;
  }
  // 表格
  private _http: HTTP_SCommon<CD_CostDetailRes<CD_CostDetailVO>, CD_CostDetailRes<CD_CostDetailConvertVO>>;
  private _editCellHttp: HTTP_SCommon<number>;
  private _saveRowHttp: HTTP_SCommon<number>;
  private _deleteHttp: HTTP_SCommon<number>;
  private _ledgerCodeHttp: HTTP_SCommon<string[], CD_TS_ICodeName[]>;
  private _departmentHttp: HTTP_SCommon<string[], CD_TS_ICodeName[]>;
  private _employeeTypeHttp: HTTP_SCommon<string[], CD_TS_ICodeName[]>;

  //#region 状态
  // 数据加载loading
  public get isLoading(): Observable<boolean> {
    return (this._http.state$ as unknown as Observable<HTTP_EState>).pipe(map((v) => v === HTTP_EState.block));
  }
  // 删除操作loading
  public get deleteLoading(): Observable<boolean> {
    return (this._deleteHttp.state$ as unknown as Observable<HTTP_EState>).pipe(map((v) => v === HTTP_EState.block));
  }
  // 单元格编辑操作loading
  public get editCellLoading(): Observable<boolean> {
    return (this._editCellHttp.state$ as unknown as Observable<HTTP_EState>).pipe(map((v) => v === HTTP_EState.block));
  }
  // 整行保存操作loading
  public get saveRowLoading(): Observable<boolean> {
    return (this._saveRowHttp.state$ as unknown as Observable<HTTP_EState>).pipe(map((v) => v === HTTP_EState.block));
  }
  public get isEmpty(): Observable<boolean> {
    return (this._http.result$ as unknown as Observable<HTTP_IResult<CD_CostDetailRes<CD_CostDetailConvertVO>>>).pipe(
      map((v) => !!v.state && !v.data?.financialDataVO.total),
    );
  }
  public get data() {
    return this._http.data$ as unknown as Observable<CD_CostDetailRes<CD_CostDetailConvertVO> | null>;
  }
  public get editCellResult() {
    return this._editCellHttp.result$ as unknown as Observable<HTTP_IResult<CD_CostDetailVO[]>>;
  }
  public get saveRowResult() {
    return this._saveRowHttp.result$ as unknown as Observable<HTTP_IResult<CD_CostDetailVO[]>>;
  }
  public get deleteResult() {
    return this._deleteHttp.result$ as unknown as Observable<HTTP_IResult<boolean>>;
  }
  public get paginationVO(): CD_PaginationVO {
    return this._paginationVO.value;
  }
  public set paginationVO(value: CD_PaginationVO) {
    this._paginationVO.value = value;
  }

  constructor() {
    this.destroy = new Subject<void>();

    this._paginationVO.value = {
      page: 1,
      pageSize: PAGES[PAGES.length - 1],
    };

    this._http = new HTTP_SCommon({
      url: EPath.查询年度详情表格数据,
      converter: (data) =>
        data
          ? {
              columnList:
                data?.columnList?.map((item) => ({
                  enName: item?.enName ?? '',
                  name: item?.name ?? '',
                })) ?? [],
              financialDataVO: {
                pageNum: data?.financialDataVO?.pageNum ?? 0,
                pageSize: data?.financialDataVO?.pageSize ?? 0,
                pages: data?.financialDataVO?.pages ?? 0,
                total: data?.financialDataVO?.total ?? 0,
                list: this.converter(data?.financialDataVO?.list as CD_CostDetailVO[]),
              },
              totalBalance: data?.totalBalance ?? '',
            }
          : null,
    });

    this._editCellHttp = new HTTP_SCommon({
      url: EPath.页面修改,
      converter: (data) => data ?? 0,
    });

    this._saveRowHttp = new HTTP_SCommon({
      url: EPath.复制行,
      converter: (data) => data ?? 0,
    });

    this._deleteHttp = new HTTP_SCommon({
      url: EPath.删除数据,
      converter: (data) => data ?? 0,
    });

    this._ledgerCodeHttp = new HTTP_SCommon({
      url: EPath.获取行中某个字段可选选项,
      converter: (data) => data?.map((item) => ({ code: item ?? '', name: item ?? '' })) ?? [],
    });

    this._departmentHttp = new HTTP_SCommon({
      url: EPath.获取行中某个字段可选选项,
      converter: (data) => data?.map((item) => ({ code: item ?? '', name: item ?? '' })) ?? [],
    });

    this._employeeTypeHttp = new HTTP_SCommon({
      url: EPath.获取行中某个字段可选选项,
      converter: (data) => data?.map((item) => ({ code: item ?? '', name: item ?? '' })) ?? [],
    });

    this._ledgerCodeHttp.data$.subscribe((v) => {
      this._ledgerNameList.value = v ?? [];
    });

    this._departmentHttp.data$.subscribe((v) => {
      this._departmentList.value = v ?? [];
    });

    this._employeeTypeHttp.data$.subscribe((v) => {
      this._employeeTypeList.value = v ?? [];
    });

    /**
     * 订阅result
     */
    this._http.result$.pipe(takeUntil(this.destroy) as any).subscribe((v: any) => {
      if (FORBIDDEN_CODES?.includes(v?.code)) {
        checkAxiosPermission(v?.code, v?.message);
      }
    });
    this._ledgerCodeHttp.result$.pipe(takeUntil(this.destroy) as any).subscribe((v: any) => {
      if (FORBIDDEN_CODES?.includes(v?.code)) {
        checkAxiosPermission(v?.code, v?.message);
      }
    });
    this._departmentHttp.result$.pipe(takeUntil(this.destroy) as any).subscribe((v: any) => {
      if (FORBIDDEN_CODES?.includes(v?.code)) {
        checkAxiosPermission(v?.code, v?.message);
      }
    });
    this._employeeTypeHttp.result$.pipe(takeUntil(this.destroy) as any).subscribe((v: any) => {
      if (FORBIDDEN_CODES?.includes(v?.code)) {
        checkAxiosPermission(v?.code, v?.message);
      }
    });
  }

  public converter(list: CD_CostDetailVO[]): CD_CostDetailConvertVO[] {
    return (
      list?.map((childItem) => ({
        id: childItem?.id ?? 0,
        projectNumber: childItem?.projectNumber ?? '',
        projectTaskName: childItem?.projectTaskName ?? '',
        ledgerCode: childItem?.ledgerCode ?? '',
        ledgerName: childItem?.ledgerName ?? '',
        costNode: childItem?.costNode ?? '',
        employeeCode: childItem?.employeeCode ?? '',
        employeeName: childItem?.employeeName ?? '',
        employeeDepartment: childItem?.employeeDepartment ?? '',
        employeeType: childItem?.employeeType ?? '',
        productCode: childItem?.productCode ?? '',
        productName: childItem?.productName ?? '',
        productType: childItem?.productType ?? '',
        productTypeName: childItem?.productTypeName ?? '',
        billDate: childItem?.billDate ?? '',
        billYear: childItem?.billYear ?? '',
        billMonth: childItem?.billMonth ?? '',
        billCode: childItem?.billCode ?? '',
        billTypeName: childItem?.billTypeName ?? '',
        billTitleContent: childItem?.billTitleContent ?? '',
        billProjectContent: childItem?.billProjectContent ?? '',
        recordTime: childItem?.recordTime ?? '',
        balance: childItem?.balance ?? '',
        amount: childItem?.amount ?? '',
        costType: childItem?.costType ?? '',
        listOrder: childItem?.listOrder ?? null,
        actualBillDate: childItem?.actualBillDate ?? '',
        hasLog: childItem?.hasLog ?? false,
        splitFlag: childItem?.splitFlag ?? ESplitFlag.未拆分,

        formatBillDate: childItem?.billDate ? childItem?.billDate : '',
        formatRecordTime: childItem?.recordTime ? childItem?.recordTime : '',
        editing: false,
        addUpFlag: false,
      })) ?? []
    );
  }
  resetPage() {
    this._paginationVO.value.page = 1;
    this._paginationVO.value.pageSize = PAGES[PAGES.length - 1];
  }
  /**
   * 查询指定页码
   * @param page
   */
  queryByPage(page: number, districts: string[]) {
    this._paginationVO.value.page = page;
    this._paginationVO.value.pageSize = PAGES[PAGES.length - 1];

    this.query(districts, new Map());
  }
  /**
   * 查询列表数据
   * @param map 勾选的列筛选
   */
  public async query(districts: string[], map?: Map<string, CD_TS_SelectVO>): Promise<void> {
    const { page, pageSize } = this._paginationVO.value;
    let param: CD_QueryParams = {
      districts,
      orders: [{ asc: true, column: '' }],
      pageNum: page,
      pageSize: pageSize,
      searchCount: true,
    };
    if (map?.size) {
      map.forEach((v, k) => {
        if (v?.checkList?.length) {
          param = {
            ...param,
            [k]: !v?.isActive ? [] : v?.checkList,
          };
        }
      });
    }
    this._http.send(JSON.stringify(param));
  }
  /**
   * 接口数据转换
   * @param row 每一条数据
   * @returns
   */
  convertSaveParams(row: CD_CostDetailConvertVO): CD_CostDetailVO {
    const changeColumns = cloneDeep(row?.changeColumns) ?? [];
    if (changeColumns?.includes('ledgerName')) {
      changeColumns.push('ledgerCode');
    }
    if (changeColumns?.includes('employeeDepartment')) {
      changeColumns.push('employeeType');
    }

    return {
      id: row?.id ?? null,
      projectNumber: row?.projectNumber ?? '',
      projectTaskName: row?.projectTaskName ?? '',
      ledgerCode: row?.ledgerCode ?? '',
      ledgerName: row?.ledgerName ?? '',
      costNode: row?.costNode ?? '',
      employeeCode: row?.employeeCode ?? '',
      employeeName: row?.employeeName ?? '',
      employeeDepartment: row?.employeeDepartment ?? '',
      employeeType: row?.employeeType ?? '',
      productCode: row?.productCode ?? '',
      productName: row?.productName ?? '',
      productType: row?.productType ?? '',
      productTypeName: row?.productTypeName ?? '',
      billDate: row?.billDate !== '' ? row?.billDate : null,
      billYear: row?.billYear ?? '',
      billMonth: row?.billMonth ?? '',
      billCode: row?.billCode ?? '',
      billTypeName: row?.billTypeName ?? '',
      billTitleContent: row?.billTitleContent ?? '',
      billProjectContent: row?.billProjectContent ?? '',
      recordTime: row?.recordTime !== '' ? row?.recordTime : null,
      balance: row?.balance ?? null,
      amount: row?.amount ?? '',
      costType: row?.costType ?? '',
      listOrder: row?.listOrder ?? null,
      addUpFlag: row?.addUpFlag ?? null,
      actualBillDate: row?.actualBillDate ?? '',
      hasLog: row?.hasLog ?? false,
      splitFlag: row?.splitFlag ?? ESplitFlag.未拆分,

      changeColumns,
    };
  }
  //#region
  /**
   * 切换加载条数查询
   * @param value
   * @param map
   */
  pageSizeChange = (value: number, districts: string[], map: Map<string, CD_TS_SelectVO>) => {
    this._paginationVO.value.pageSize = value;
    this._paginationVO.value.page = 1;
    const ele = document.querySelector('.vxe-table--body-wrapper.body--wrapper');
    if (ele) {
      ele?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
    this.query(districts, map);
  };
  /**
   * 分页查询
   * @param value
   * @param map
   */
  pageNumChange = (value: number, districts: string[], map: Map<string, CD_TS_SelectVO>) => {
    this._paginationVO.value.page = Math.floor(value);
    const ele = document.querySelector('.vxe-table--body-wrapper.body--wrapper');
    if (ele) {
      ele?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
    this.query(districts, map);
  };
  //#endregion
  //#region
  /**
   * 保存数据
   * @param row 行数据
   * @returns
   */
  save(row: CD_CostDetailConvertVO) {
    if (!row) {
      return;
    }
    if (!row?.projectNumber) {
      message.error('请填写项目编码');
      return;
    }
    const params = this.convertSaveParams(row);
    if (row?.id) {
      this._editCellHttp.send(JSON.stringify(params));
    } else {
      this._saveRowHttp.send(JSON.stringify(params));
    }
  }
  /**
   * 删除当前行
   * @param id id
   */
  delete(id: number) {
    ElMessageBox.confirm('该行删除后无法找回，确定删除吗？', '删除该行', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      customClass: 'cost-delete-confirm',
    })
      .then((res) => {
        if (res === 'confirm') {
          this._deleteHttp.send(String(id));
        }
      })
      .catch((error) => {
        console.log('cacel', error);
      });
  }
  //#endregion
  //#region 字典
  queryLedgerName() {
    if (this._ledgerNameList.value?.length === 0) {
      this._ledgerCodeHttp.send('ledgerName');
    }
  }
  queryLedgerNameByCode(ledgerName: string): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        const res = await postRequest(EPath.根据总账科目名称获取总账科目编号, ledgerName);
        if (res?.code === 200 && res?.data?.length) {
          resolve(res?.data ?? '');
        } else {
          resolve('');
        }
      } catch (error) {
        resolve('');
      }
    });
  }
  queryCostNode(row: {
    costType: string;
    id?: number;
    [key: string]: string | number | undefined | null | boolean | string[];
  }): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        const res = await postRequest(EPath.根据成本类别获取成本明细, {
          id: row?.id ?? null,
          projectNumber: row?.projectNumber ?? '',
          projectTaskName: row?.projectTaskName ?? '',
          ledgerCode: row?.ledgerCode ?? '',
          ledgerName: row?.ledgerName ?? '',
          costNode: row?.costNode ?? '',
          employeeCode: row?.employeeCode ?? '',
          employeeName: row?.employeeName ?? '',
          employeeDepartment: row?.employeeDepartment ?? '',
          employeeType: row?.employeeType ?? '',
          productCode: row?.productCode ?? '',
          productName: row?.productName ?? '',
          productType: row?.productType ?? '',
          productTypeName: row?.productTypeName ?? '',
          billDate: row?.billDate !== '' ? row?.billDate : null,
          billYear: row?.billYear ?? '',
          billMonth: row?.billMonth ?? '',
          billCode: row?.billCode ?? '',
          billTypeName: row?.billTypeName ?? '',
          billTitleContent: row?.billTitleContent ?? '',
          billProjectContent: row?.billProjectContent ?? '',
          recordTime: row?.recordTime !== '' ? row?.recordTime : null,
          balance: row?.balance ?? null,
          amount: row?.amount ?? '',
          costType: row?.costType ?? '',
          listOrder: row?.listOrder ?? null,
          actualBillDate: row?.actualBillDate ?? '',
        });
        if (res?.code === 200 && res?.data?.length) {
          this._costNodeList.value = res?.data ?? [];
          resolve(res?.data[0]);
        } else {
          this._costNodeList.value = [];
          resolve('');
        }
      } catch (error) {
        resolve('');
      }
    });
  }
  queryDepartment() {
    if (this._departmentList.value?.length === 0) {
      this._departmentHttp.send('employeeDepartment');
    }
  }
  queryEmployeeType() {
    if (this._employeeTypeList.value?.length === 0) {
      this._employeeTypeHttp.send('employeeType');
    }
  }
  queryEmployeeCodeByDepartment(employeeDepartment: string): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        const res = await postRequest(EPath.根据人员部门获取人员类别, employeeDepartment);
        if (res?.code === 200 && res?.data?.length) {
          resolve(res?.data);
        } else {
          resolve('');
        }
      } catch (error) {
        resolve('');
      }
    });
  }
  queryCostType(): Promise<CD_TS_ICodeName[]> {
    return new Promise(async (resolve) => {
      try {
        const res = await postRequest(EPath.查询成本类型);
        if (res?.code === 200 && res?.data?.length) {
          resolve(res?.data ?? []);
        } else {
          resolve([]);
        }
      } catch (error) {
        resolve([]);
      }
    });
  }
  //#endregion
  destroyInstance() {
    this.destroy.next();
    this.destroy.complete();
  }
}
