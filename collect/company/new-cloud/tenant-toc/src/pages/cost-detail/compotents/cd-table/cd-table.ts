/*
 * @Description: 成本明细表格
 * @Author: zpwan
 * @Date: 2022-09-08 09:28:36
 * @Last Modified by: zpwan
 * @Last Modified time: 2023-05-24 10:50:22
 */
import { defineComponent, onMounted, onUnmounted, ref, nextTick, computed, watch } from 'vue';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HTTP_EState } from 'web-core';
import { VxeTableInstance } from 'vxe-table';
import XEUtils from 'xe-utils';
import { cloneDeep } from 'lodash';

import { ElMessageBox } from 'element-plus';

import { TableService } from './cd-table.service';
import toolPopoverService from './cd-t-tool-popover/cd-t-tool-popover.service';
import textEditorService from './cd-t-cell-editor/cd-t-cell-editor.service';
import toolbarService from '../cd-toolbar/cd-toolbar.service';
import eventBus from '../../../../core/eventbus/index';
import { isJsonString } from '../../../../core/token/token';

import {
  CD_CostDetailConvertVO,
  CD_Table_Store,
  CD_DynamicColumnVO,
  CD_ColumnVO,
  CD_CostDetailVO,
  ESplitFlag,
} from './cd-table.api';
import { CD_TS_SelectVO, CD_TS_ICodeName, SCREEN_STORAGE_KEY } from './cd-t-screen/cd-t-screen.api';
import { CD_IImportPageRes } from '../cd-toolbar/cd-toolbar.api';

import CdTableScreen from './cd-t-screen/cd-t-screen.vue';
import CdTableToolPopover from './cd-t-tool-popover/cd-t-tool-popover.vue';
import CdTextEditor from './cd-t-cell-editor/cd-t-cell-editor.vue';
import CdEditableSelect from './cd-t-editable-select/cd-t-editable-select.vue';

import {
  INSERT_TYPE,
  COLUMN_TYPE,
  EDITABLE_COLUMN_KEYS,
  TABLE_OPERATE_TYPE,
  initailRow,
  CELL_HEIGHT,
  CELL_HEIGHT_MINI,
} from './constant';

import message from '@/utils/message';
import { formatDate, thousandSeparation } from '@/utils/index';
import { FSetCookie } from '@/core/token';
import { CD_ETableSize } from '../../cost-detail.api';
import { checkAxiosPermission } from '@/service/request';
import { FORBIDDEN_CODES } from '@/config';

export default defineComponent({
  name: 'CdTableComponent',
  components: {
    'cd-t-screen': CdTableScreen,
    'cd-t-tool-popover': CdTableToolPopover,
    'cd-t-cell-editor': CdTextEditor,
    'cd-t-editable-select': CdEditableSelect,
  },
  props: {
    hasAuthority: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    //#region 页面操作loading
    const isLoading = ref<boolean>(true);
    const deleteLoading = ref<boolean>(false);
    const editCellLoading = ref<boolean>(false);
    const saveRowLoading = ref<boolean>(false);
    //#endregion
    //#region  表格
    const tableData = ref<CD_CostDetailConvertVO[]>([]);
    const columnList = ref<CD_DynamicColumnVO[]>([]);
    const total = ref<number>(0);
    const isEmpty = ref<boolean>(false);
    const fiexd = isEmpty.value ? '' : 'left';
    const xTable = ref<typeof VxeTableInstance>();
    const height = ref<number>(500);
    const districts = ref<string[]>([]); // 所属大区

    const tableSize = computed(() => {
      return toolbarService.sizeType;
    });

    watch(
      () => tableSize.value,
      () => {
        loadTableData();
      },
    );
    const totalBalance = ref<string>('');
    //#endregion

    //#region table服务
    const sTable = new TableService();
    const sToolPopover = toolPopoverService;
    const sTextEditor = textEditorService;
    const destroy = new Subject<void>();
    /**
     * 初始化
     * 1.订阅请求响应结果
     * 2.处理保存数据后数据渲染
     */
    onMounted(() => {
      resetRowStatus();
      const map = new Map();
      // 判断是否有缓存
      if (
        window.localStorage.getItem(SCREEN_STORAGE_KEY) &&
        isJsonString(window.localStorage.getItem(SCREEN_STORAGE_KEY) as string)
      ) {
        const obj = JSON.parse(window.localStorage.getItem(SCREEN_STORAGE_KEY) as string);
        Object.entries(obj)?.forEach(([k, v]) => {
          // 修改map数据
          map.set(k, {
            checked: (v as CD_TS_SelectVO)?.checked,
            indeterminate: (v as CD_TS_SelectVO)?.indeterminate,
            checkList: (v as CD_TS_SelectVO)?.checkList,
            dataSource: [],
            isActive: (v as CD_TS_SelectVO)?.isActive,
          });
        });

        filterMap.value = map;
      }
      sTable.query(districts.value, map);
      // 监听页面缩放
      fromEvent(window, 'resize')
        .pipe(takeUntil(destroy))
        .subscribe(() => {
          calculateHeight();
        });
      // 数据加载loading
      sTable.isLoading.pipe(takeUntil(destroy)).subscribe((v) => {
        isLoading.value = v;
      });
      // 删除操作loading
      sTable.deleteLoading.pipe(takeUntil(destroy)).subscribe((v) => {
        deleteLoading.value = v;
      });
      // 编辑单元格操作loading
      sTable.editCellLoading.pipe(takeUntil(destroy)).subscribe((v) => {
        editCellLoading.value = v;
      });
      // 保存整行操作loading
      sTable.saveRowLoading.pipe(takeUntil(destroy)).subscribe((v) => {
        saveRowLoading.value = v;
      });
      // 空数据监听
      sTable.isEmpty.pipe(takeUntil(destroy)).subscribe((v) => {
        isEmpty.value = v;
      });
      // 监听数据加载
      sTable.data.pipe(takeUntil(destroy)).subscribe((v) => {
        // resetRowStatus();
        getColumnList(v?.columnList ?? []);
        totalBalance.value = v?.totalBalance ?? '';
        if (v?.financialDataVO?.total) {
          tableData.value = v?.financialDataVO?.list ?? [];
          total.value = v?.financialDataVO?.total ?? 0;
          calculateHeight();

          // 如果有默认选中则需要滚动到可视区域
          if (tableStore.value.selectedRowIndex !== -1) {
            setTimeout(() => {
              const ele = document.querySelector('.vxe-table--body-wrapper.body--wrapper');
              if (ele) {
                const h = tableSize.value === CD_ETableSize.默认 ? CELL_HEIGHT : CELL_HEIGHT_MINI;
                console.log('ele-----------', ele, tableStore.value.selectedRowIndex * h);
                ele?.scrollTo({
                  top: tableStore.value.selectedRowIndex * h,
                  left: 0,
                  behavior: 'auto',
                });
              }
            }, 400);
          }
        } else {
          tableData.value = [];
          total.value = 0;
        }
        // 加载表格数据
        loadTableData();
        console.log(
          '%c✨✨数据加载✨✨',
          'font-size: 24px',
          tableData.value?.map((item) => {
            return item?.listOrder;
          }),
        );
      });
      // 单元格编辑
      sTable.editCellResult.pipe(takeUntil(destroy)).subscribe((v) => {
        if (v?.state === HTTP_EState.success) {
          console.log('%c✨✨单元格编辑✨✨', 'font-size: 24px', v);
          message.success(v?.message ?? '保存成功');
          sTextEditor?.close();
          sToolPopover?.close();
          // 文本---同步数据
          const { operateType, editRowIndex } = tableStore.value;
          const editRowIdx =
            editRowIndex !== -1
              ? editRowIndex
              : tableData.value?.findIndex((item) => {
                  return item.id === v?.data?.[0]?.id;
                });
          if (v?.data?.length) {
            // 如果返回的list长度大于1
            if (v?.data?.length > 1) {
              total.value += v?.data?.length - 1;
            }
            console.log('editRowIdx, operateType, v?.data---------------', editRowIdx, operateType, v?.data);
            adjustTableData(editRowIdx, operateType, v?.data);
          }
          resetRowStatus(false);
        } else if (v?.state === HTTP_EState.error) {
          if (FORBIDDEN_CODES?.includes(v?.code as number)) {
            checkAxiosPermission(v?.code as number, v?.message as string);
          } else {
            // 如果修改失败则重置数据
            const editRowIdx = tableData.value?.findIndex((item) => {
              return item.id === tableStore.value?.currentRow?.id;
            });
            console.log('%c✨✨单元格编辑✨✨', 'font-size: 24px', v, editRowIdx);
            if (editRowIdx !== -1 && editRowIdx <= tableData.value?.length) {
              tableData.value[editRowIdx] = {
                ...tableData.value[editRowIdx],
                ...tableStore.value?.currentRow,
              };
            }
            sTextEditor.close();
            message.error(v?.message ?? '保存失败');

            // 如果存在编辑单元格，则重新聚焦
            const textareaEle = document.getElementById('cd-t-cell-editor');
            if (textareaEle) {
              textareaEle.focus();
            }
          }
        }
      });
      // 保存整行响应结果
      sTable.saveRowResult.pipe(takeUntil(destroy)).subscribe((v) => {
        if (v?.state === HTTP_EState.success) {
          message.success(v?.message ?? '保存成功');
          sToolPopover?.close();
          sTextEditor?.close();

          const { editRowIndex, operateType, selectedRowIndex } = tableStore.value;
          if (v?.data?.length) {
            // 如果返回的list长度大于1
            if (operateType === TABLE_OPERATE_TYPE.复制行 || operateType === TABLE_OPERATE_TYPE.整行保存) {
              total.value += operateType === TABLE_OPERATE_TYPE.复制行 ? 1 : v?.data?.length;
            }
            adjustTableData(
              operateType === TABLE_OPERATE_TYPE.复制行 ? selectedRowIndex : editRowIndex,
              operateType,
              v?.data,
            );
          }
          resetRowStatus();
          console.log(
            '%c✨✨整行保存✨✨',
            'font-size: 24px',
            editRowIndex,
            tableData.value?.map((item) => {
              return item?.listOrder;
            }),
          );
        } else if (v?.state === HTTP_EState.error) {
          if (FORBIDDEN_CODES?.includes(v?.code as number)) {
            checkAxiosPermission(v?.code as number, v?.message as string);
          } else {
            console.log('%c✨✨整行保存✨✨', 'font-size: 24px', v);
            sToolPopover?.close();
            message.error(v?.message ?? '保存失败');
          }
        }
      });
      // 删除操作响应结果监听
      sTable.deleteResult.pipe(takeUntil(destroy)).subscribe((v) => {
        if (v?.state === HTTP_EState.success) {
          message.success(v?.message ?? '删除成功');
          sTable.query(districts.value, filterMap.value);
          resetRowStatus();

          sTextEditor?.close();
        } else if (v?.state === HTTP_EState.error) {
          if (FORBIDDEN_CODES?.includes(v?.code as number)) {
            checkAxiosPermission(v?.code as number, v?.message as string);
          } else {
            message.error(v?.message ?? '删除失败');
          }
        }
      });
      // 同步输入框数据
      sTextEditor.editorValue$.pipe(takeUntil(destroy)).subscribe((v) => {
        if (v?.index !== -1 && tableData.value[v?.index]) {
          (tableData.value[v?.index] as any)[v?.key] = v?.value;
          // loadData会导致组件实例变更 点击事件触发有问题
          console.log('%c✨✨同步输入框数据✨✨', 'font-size: 24px', v);
        }
      });
      // 查询成本类型
      sTable.queryCostType().then((res) => {
        costTypeList.value = res ?? [];
      });
      // 重置查询条件
      eventBus.on('cost-reset', (v) => {
        if (!v) {
          resetRowStatus();
        }
        console.log('%c✨✨重置查询条件✨✨', 'font-size: 24px', v, sTable.paginationVO, districts.value);
        // 重置map
        filterMap.value = new Map();
        sTable.queryByPage(
          (v as CD_IImportPageRes)?.pageNum ? (v as CD_IImportPageRes)?.pageNum : sTable.paginationVO.page,
          districts.value,
        );
        if ((v as CD_IImportPageRes)?.lineIndex !== null && (v as CD_IImportPageRes)?.lineIndex !== undefined) {
          tableStore.value.selectedRowIndex = (v as CD_IImportPageRes)?.lineIndex;
          console.log('tableStore.value.selectedRowIndex', tableStore.value.selectedRowIndex);
        }
      });
      // 订阅大区筛选
      eventBus.on('districts-check', (v) => {
        resetRowStatus();

        districts.value = (v as string[]) ?? [];
        sTable.resetPage();
        sTable.query(districts.value, filterMap.value);
        console.log('%c✨✨按大区查询✨✨', 'font-size: 24px', districts.value, filterMap.value);
      });
    });

    /**
     * 重置数据
     */
    onUnmounted(() => {
      districts.value = [];
      filterMap.value = new Map();
      tableData.value = [];

      loadTableData();
      sTextEditor?.close();
      sToolPopover?.close();
      resetRowStatus();

      sTable.destroyInstance();

      eventBus.off('cost-reset');
      eventBus.off('districts-check');
      destroy.next();
      destroy.complete();
    });
    //#endregion

    //#region
    const hasAuthority = computed(() => {
      return props.hasAuthority;
    });
    //#endregion

    //#region 筛选项
    const costTypeList = ref<CD_TS_ICodeName[]>([]);
    const filterMap = ref<Map<string, CD_TS_SelectVO>>(new Map());
    //#endregion
    //#region 复制，插入操作
    const tableStore = ref<CD_Table_Store>({
      selectedRowIndex: -1,
      copyedRowIndex: -1,
      editableColumnKeys: [],
      editColumnKey: '',
      editRowIndex: -1,
      originValueMap: new Map(),
      currentRow: initailRow,
      insertedRowStartIndex: -1,
      insertedRowEndIndex: -1,
      operateType: '',
    });
    //#endregion
    //#region 单元格操作
    /**
     * 根据接口返回的columnList生成能够渲染的表格头
     * 还需要在最后添加日志列
     * @param list 接口返回的columnList
     */
    const getColumnList = (list: CD_ColumnVO[]) => {
      columnList.value = [];
      const keys = Object.keys(sTable.COLUMN_KEYS);
      list?.forEach((item, index) => {
        if (keys?.includes(item.enName)) {
          columnList.value.push({
            key: item.enName,
            title: item.name,
            minWidth: sTable.COLUMN_KEYS[item.enName]?.minWidth,
            type: sTable.COLUMN_KEYS[item.enName]?.type,
            secrrStyle: '5px',
            firstHh: index === 0,
            fixed: index === 0,
            unit: item.enName === 'balance' ? 'CNY' : '',
            backupValue: '',
            screenBg: sTable.COLUMN_KEYS[item.enName]?.hasBackground,
            hasFilter: true,
          });
        }
      });
      if (list?.length) {
        columnList.value.push({
          key: 'log',
          title: '操作',
          minWidth: '100',
          type: COLUMN_TYPE.只读文本,
          secrrStyle: '0',
          firstHh: false,
          fixed: false,
          unit: '',
          backupValue: '',
          screenBg: false,
          hasFilter: false,
        });
      }
    };
    /**
     * 根据当前行索引处理高亮类名
     * @param param0 rowIndex 当前行索引
     * @returns
     */
    const getRowClassName = ({ rowIndex }: { rowIndex: number }) => {
      let className = '';
      if (rowIndex === tableStore.value?.selectedRowIndex) {
        className += ' selected-row';
      }
      if (rowIndex === tableStore.value?.editRowIndex) {
        className += ' editing-row';
      }
      if (rowIndex >= tableStore.value?.insertedRowStartIndex && rowIndex <= tableStore.value?.insertedRowEndIndex) {
        className += ' insert-row';
        if (rowIndex === tableStore.value.insertedRowStartIndex) {
          className += ' insert-start';
        }
        if (rowIndex === tableStore.value.insertedRowEndIndex) {
          className += ' insert-end';
        }
      }
      return className;
    };
    /**
     * 顶部筛选事件，触发查询
     * @param map 选中的各个列选项
     */
    const handleScreenQuery = (map: Map<string, CD_TS_SelectVO>) => {
      sTextEditor.close();
      sToolPopover.close();
      resetRowStatus();

      filterMap.value = map;
      sTable.query(districts.value, map);
    };
    /**
     *
     * 复制、编辑、插入后调整数组数据以及listOrder
     * 1.如果不是单行赋值则需要删除当前行，因为接口会返回被编辑处理过的行列表
     * 2.判断当前需要从哪一行开始插入，如果是复制行则在下一行开始插入，其他的都是当前行
     * 3.判断从哪一行开始重置listOrder以及在原数据基础上加几
     *  startIndex：开始重置listOrder的行索引
     *  orderOffset：当前操作需要把原listOrder重置加几
     * 4.遍历数据进行重置
     * @param rowIndex 当前操作行
     * @param operateType 操作类型
     * @param list 返回的数组数据
     */
    const adjustTableData = (rowIndex: number, operateType: string, list: CD_CostDetailVO[]) => {
      const converterList = sTable.converter(list);

      // 编辑单元格、插入行需要删除原来行
      if (operateType !== TABLE_OPERATE_TYPE.复制行) {
        tableData.value?.splice(rowIndex, 1);
      }

      // 编辑单元格、复制行、插入行需要插入数据
      tableData.value?.splice(operateType === TABLE_OPERATE_TYPE.复制行 ? rowIndex + 1 : rowIndex, 0, ...converterList);
      // 编辑后行数增多、复制行、插入行需要调整listOrder
      if (
        (operateType === TABLE_OPERATE_TYPE.单元格编辑 && list?.length > 1) ||
        operateType === TABLE_OPERATE_TYPE.复制行 ||
        operateType === TABLE_OPERATE_TYPE.整行保存
      ) {
        const startIndex =
          (operateType === TABLE_OPERATE_TYPE.单元格编辑 && list?.length > 1) ||
          operateType === TABLE_OPERATE_TYPE.整行保存
            ? rowIndex + list?.length
            : rowIndex + list?.length + 1;
        const orderOffset =
          operateType === TABLE_OPERATE_TYPE.单元格编辑 && list?.length > 1
            ? list.length - 1
            : operateType === TABLE_OPERATE_TYPE.复制行
            ? 1
            : list.length;
        console.log('%c✨✨调整listOrder✨✨', 'font-size: 24px', operateType, startIndex, orderOffset, rowIndex);
        tableData.value?.forEach((item, index) => {
          if (index >= startIndex && Object.prototype.toString.call(item?.listOrder) !== '[object Null]') {
            (item.listOrder as number) += orderOffset;
          }
        });
      }

      loadTableData();
    };
    /**
     * 左击空白处关闭菜单
     * 需要判断是否有单个单元格编辑，如果有需要先调用保存接口
     */
    const popoverClose = () => {
      const { editRowIndex, editColumnKey, originValueMap } = tableStore.value;
      const row = tableData.value[editRowIndex];

      if (
        (editColumnKey === 'costNode' || editColumnKey === 'costType') &&
        !row?.editing &&
        ((row as any)?.costType !== originValueMap?.get('costType') ||
          (row as any)?.costNode !== originValueMap?.get('costNode'))
      ) {
        sTable.save({
          ...tableData.value[editRowIndex],
          changeColumns: tableStore.value.editableColumnKeys,
        });

        resetRowStatus();
      } else {
        if (editColumnKey !== 'costNode' && editColumnKey !== 'costType') {
          resetRowStatus();
          sTextEditor.close();
        } else {
          tableStore.value.editableColumnKeys = [];
        }
      }
    };
    // 重置单元格、行状态
    const resetRowStatus = (excludeInsertFlag = true) => {
      tableStore.value.selectedRowIndex = -1;
      tableStore.value.copyedRowIndex = -1;
      tableStore.value.editColumnKey = '';
      tableStore.value.editRowIndex = -1;
      tableStore.value.editableColumnKeys = [];
      tableStore.value.originValueMap = new Map();

      if (excludeInsertFlag) {
        tableStore.value.insertedRowStartIndex = -1;
        tableStore.value.insertedRowEndIndex = -1;
      }
    };
    /**
     * 点击空白区域保存
     * 1.判断是否有权限
     * 2.只需要处理联动下拉框和单元格编辑的下拉框切换（输入框有失焦事件、整行编辑只能整行保存）
     */
    const resetPageStatus = () => {
      if (!hasAuthority.value) {
        return;
      }
      setTimeout(() => {
        const { editRowIndex, editColumnKey, originValueMap } = tableStore.value;
        const row = tableData.value[editRowIndex];

        // 如果联动单元格处于编辑状态，判断值是否改变，如果变化了则调用保存
        if (editRowIndex !== -1) {
          if ((editColumnKey === 'costNode' || editColumnKey === 'costType') && !row?.editing) {
            if (
              (row as any)?.costType !== originValueMap?.get('costType') ||
              (row as any)?.costNode !== originValueMap?.get('costNode')
            ) {
              if (!!tableData.value[editRowIndex]?.id) {
                sTable.save({
                  ...tableData.value[editRowIndex],
                  changeColumns: tableStore.value.editableColumnKeys,
                });
              }
            } else {
              tableStore.value.editableColumnKeys = [];
            }
          } else {
            // 非联动下拉框处于编辑状态判断值是否改变
            if (!row?.editing && originValueMap.get(editColumnKey) === (row as any)?.[editColumnKey]) {
              console.log(
                '---------------',
                editRowIndex,
                originValueMap.get(editColumnKey),
                (row as any)?.[editColumnKey],
                editColumnKey,
                row,
              );
              tableStore.value.selectedRowIndex = -1;
              tableStore.value.copyedRowIndex = -1;
              tableStore.value.editColumnKey = '';
              tableStore.value.editRowIndex = -1;
              tableStore.value.editableColumnKeys = [];
              tableStore.value.originValueMap = new Map();

              sTextEditor.close();
            }
          }
        }
      });
    };
    /**
     * 行右键点击操作
     * 1.如果没有权限或者保存中 提示，并return
     * 2.判断是否有联动单元格处于编辑状态
     * 3.打开菜单
     * @param event 事件对象
     * @param index 当前行索引
     * @param row 当前行
     * @returns
     */
    const handleRowContextMenu = (event: MouseEvent, index: number, row: CD_CostDetailConvertVO): void => {
      if (!hasAuthority.value || toolbarService.isImporting) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      if (deleteLoading.value) {
        message.warning('数据删除中，请稍候');
        return;
      }
      if (editCellLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }
      if (saveRowLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }

      /**
       * 判断是否有联动行在编辑
       *  单个单元格编辑的在失焦事件中已经处理了
       * 所以现在只要判断成本类型或者成本明细处理单元格编辑
       */
      const { editRowIndex, insertedRowEndIndex, insertedRowStartIndex, editColumnKey, originValueMap } =
        tableStore.value;

      const relationKeys = ['costNode', 'costType'];
      if (editRowIndex !== -1 && !(editRowIndex <= insertedRowEndIndex && editRowIndex >= insertedRowStartIndex)) {
        const cRow = tableData.value[editRowIndex];
        // 如果右击的是当前编辑单元格的行 且编辑的是联动
        // 如果是当前编辑行且是联动单元格-----则不进行判断而是打开整行保存弹框
        if (editRowIndex !== index || !relationKeys?.includes(editColumnKey)) {
          if (
            (relationKeys?.includes(editColumnKey) &&
              (cRow as any)?.costNode === originValueMap?.get('costNode') &&
              (cRow as any)?.costType === originValueMap?.get('costType')) ||
            (!relationKeys?.includes(editColumnKey) &&
              (cRow as any)?.[editColumnKey] === originValueMap?.get(editColumnKey))
          ) {
            console.log('右击的是非联动下拉框且数据没变');

            tableStore.value.selectedRowIndex = -1;
            tableStore.value.copyedRowIndex = -1;
            tableStore.value.editColumnKey = '';
            tableStore.value.editRowIndex = -1;
            tableStore.value.editableColumnKeys = [];
            tableStore.value.originValueMap = new Map();
          }
          if (
            relationKeys?.includes(editColumnKey) &&
            ((cRow as any)?.costNode !== originValueMap?.get('costNode') ||
              (cRow as any)?.costType !== originValueMap?.get('costType'))
          ) {
            console.log('%c✨✨右击的是联动下拉框且数据变✨✨');
            if (!!cRow?.id) {
              sTable.save({
                ...cloneDeep(cRow),
                changeColumns: tableStore.value.editableColumnKeys,
              });
              editCellLoading.value = true;
            }
          }
        }
      }
      if (editCellLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }
      if (saveRowLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }

      sTextEditor.close();
      // 如果当前行不是正在编辑行
      if (index !== tableStore.value.editRowIndex) {
        tableStore.value.editableColumnKeys = [];
      }
      tableStore.value.selectedRowIndex = index;
      // 整行编辑或者编辑联动下拉框 右键出现整行保存
      const showRowSaveFlag =
        row.editing || (tableStore.value.editableColumnKeys?.includes('costType') && !row.editing);
      const hasInsertRow = tableData.value.some((item) => {
        return !item?.id;
      });

      sToolPopover.show(event.pageY, event.pageX, showRowSaveFlag, row.id, index, hasInsertRow);
    };
    /**
     *
     * @param e
     * 获取蒙层下的触发器 调用聚焦事件
     */
    const handleDateMaskClick = (e: MouseEvent, rowIndex: number, key: string) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (key !== 'costNode') {
        ((e.target as HTMLElement).previousElementSibling?.firstElementChild as HTMLElement)?.focus();

        handleSelectVisibleChange(true, rowIndex, key);
      } else {
        (
          (e.target as HTMLElement).previousElementSibling?.querySelector('input.el-input__inner') as HTMLElement
        )?.focus();
      }
    };
    /**
     * 单元格点击
     * 1.判断是否是日志按钮，如果是则跳转页面
     * 2.判断是否有权限、是否正在异步请求
     * 3.判断是否有单元格（非联动单元格）处于编辑状态
     * 4.判断当前点击单元格是否是可编辑单元格
     * 5.赋值tableStore，记住当前编辑行信息
     * 6.如果是普通文本框则直接打开编辑框，如果是下拉框需要根据key来调用不同接口，加载数据
     * @param column
     */
    const handleCellClick = async (column: any) => {
      tableStore.value.selectedRowIndex = column.rowIndex;
      const event = column?.$event;
      event.preventDefault();
      event.stopPropagation();
      // 如果是跳转日志
      if (column?.column?.field === 'log') {
        if (column?.row?.id && column?.row?.hasLog) {
          const publicPath = process.env.NODE_ENV === 'production' ? '/tenant-toc' : '';
          window.open(`${publicPath}/home/logManagement`);
          FSetCookie('toc-objectId', column?.row?.id);
        }
        return;
      }
      if (!hasAuthority.value || toolbarService.isImporting) {
        return;
      }
      if (deleteLoading.value) {
        message.warning('数据删除中，请稍候');
        return;
      }
      if (editCellLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }
      if (saveRowLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }

      const rowIndex = column?.rowIndex;
      const key = column?.column?.field;
      const row = column?.row;
      const columnIndex = column?.columnIndex;

      const { editRowIndex, insertedRowEndIndex, insertedRowStartIndex, editColumnKey, originValueMap } =
        tableStore.value;

      const relationKeys = ['costNode', 'costType'];
      // 1.有正在编辑的单元格   2.点击的单元格不在插入行中  3. 点击的是非当前行或者点击的不是当前正在编辑的单元格
      if (
        editRowIndex !== -1 &&
        !(editRowIndex <= insertedRowEndIndex && editRowIndex >= insertedRowStartIndex) &&
        (rowIndex !== editRowIndex ||
          (rowIndex === editRowIndex &&
            ((!relationKeys?.includes(key) && key !== editColumnKey) ||
              !(relationKeys?.includes(key) && relationKeys?.includes(editColumnKey)))))
      ) {
        const cRow = cloneDeep(tableData.value[editRowIndex]);
        console.log('%c✨✨点击非编辑单元格✨✨', 'font-size: 24px', cRow, editRowIndex, originValueMap);
        if (
          (relationKeys?.includes(editColumnKey) &&
            (cRow as any)?.costNode === originValueMap?.get('costNode') &&
            (cRow as any)?.costType === originValueMap?.get('costType')) ||
          (!relationKeys?.includes(editColumnKey) &&
            (cRow as any)?.[editColumnKey] === originValueMap?.get(editColumnKey))
        ) {
          console.log('✨✨点击的是非联动下拉框且数据没变✨✨');
          tableStore.value.selectedRowIndex = -1;
          tableStore.value.copyedRowIndex = -1;
          tableStore.value.editColumnKey = '';
          tableStore.value.editRowIndex = -1;
          tableStore.value.editableColumnKeys = [];
          tableStore.value.originValueMap = new Map();
        }

        if (
          relationKeys?.includes(editColumnKey) &&
          ((cRow as any)?.costNode !== originValueMap?.get('costNode') ||
            (cRow as any)?.costType !== originValueMap?.get('costType'))
        ) {
          console.log('✨✨点击的是联动下拉框且数据变✨✨');
          if (!!cRow?.id) {
            sTable.save({
              ...cloneDeep(cRow),
              changeColumns: tableStore.value.editableColumnKeys,
            });
            editCellLoading.value = true;
          }
        }
      }
      if (editCellLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }
      if (saveRowLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }

      // 非编辑状态下的行 只有特定行才能编辑
      if (!EDITABLE_COLUMN_KEYS?.includes(key) && !row.editing) {
        return;
      }

      tableStore.value.editRowIndex = rowIndex;
      tableStore.value.editColumnKey = key;
      tableStore.value.editableColumnKeys = [];
      tableStore.value.currentRow = row;

      tableStore.value.editableColumnKeys.push(key);
      tableStore.value.originValueMap.set(key, row[key]);

      if (key === 'costType') {
        tableStore.value.originValueMap.set('costNode', row.costNode);
        tableStore.value.editableColumnKeys.push('costNode');
      }
      if (key === 'costNode') {
        tableStore.value.originValueMap.set('costType', row.costType);
        tableStore.value.editableColumnKeys.push('costType');
      }

      /**
       * 加载输入框
       */
      const type = columnList.value[columnIndex]?.type;
      if (row.editing) {
        tableStore.value.operateType = TABLE_OPERATE_TYPE.整行保存;
      } else {
        tableStore.value.operateType = TABLE_OPERATE_TYPE.单元格编辑;
      }

      if (type === COLUMN_TYPE.正数输入框 || type === COLUMN_TYPE.文本输入框 || type === COLUMN_TYPE.负数输入框) {
        console.log('%c✨✨点击单元格触发编辑框展示✨✨', 'font-size: 24px', tableStore.value);
        const cellWidth = Number(getComputedStyle(column.cell, 'width').width?.replace('px', '')) - 15 * 2;
        const value = (tableData.value[rowIndex] as any)?.[key];
        sTextEditor.show(event, value, `${cellWidth}px`, type, key, rowIndex);
      } else {
        console.log('%c✨✨点击单元格编辑触发下拉框展示✨✨', 'font-size: 24px', tableStore.value);
        if (key === 'ledgerName') {
          sTable.queryLedgerName();
        }
        if (key === 'employeeDepartment') {
          sTable.queryDepartment();
        }
        if (key === 'employeeType') {
          sTable.queryEmployeeType();
        }
        if (key === 'costNode' || key === 'costType') {
          if (costTypeList.value?.length === 0) {
            costTypeList.value = await sTable.queryCostType();
          }
          sTable.queryCostNode({
            costType: row.costType,
            id: row?.id,
          });
        }
        sTextEditor.close();
      }
    };
    /**
     * 列拖动事件,关闭编辑框即可
     * @param columnEvent
     */
    const handleColumnResize = (columnEvent: any) => {
      sTextEditor.close();
    };
    /**
     * 输入框回车或者失去焦点,单元格回车保存
     * 1.如果是整行编辑或者编辑字段值前后没有改变，则直接关闭编辑框，清空状态
     * 2.保存数据
     * @param value
     * @returns
     */
    const saveCell = async (value: string) => {
      if (deleteLoading.value) {
        message.warning('数据删除中，请稍候');
        return;
      }
      if (editCellLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }
      if (saveRowLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }
      const { editColumnKey, editRowIndex, originValueMap } = tableStore.value;
      const row = tableData.value?.[editRowIndex];

      // 整行编辑-不用处理，数据会通过流的形式更新
      if (row?.editing) {
        return;
      }
      // 如果editColumnKey中有数据，且未发生改变
      if (!!editColumnKey && String(originValueMap?.get(editColumnKey)) === String(value)) {
        sTextEditor.close();
        tableStore.value.editColumnKey = '';
        tableStore.value.editableColumnKeys = [];
        return;
      }

      if (editColumnKey === 'projectNumber' && !value) {
        message.error('项目编号不能为空！');
        return;
      }

      if (!!row?.id) {
        console.log('%c✨✨单元格编辑触发保存✨✨', 'font-size: 24px', row, tableStore.value);
        sTable.save({
          ...row,
          changeColumns: tableStore.value.editableColumnKeys,
        });
      }
    };
    /**
     * 删除
     * @param id
     */
    const handleDelete = (id: number) => {
      sTable.delete(id);
    };
    /**
     * 页码切换
     * @param value
     */
    const handlePageNumChange = (value: number) => {
      resetRowStatus();
      sTable.pageNumChange(value, districts.value, filterMap.value);
    };
    /**
     * 页码切换
     * @param value
     */
    const handlePageSizeChange = (value: number) => {
      resetRowStatus();
      sTable.pageSizeChange(value, districts.value, filterMap.value);
    };
    /**
     * 切换编辑下拉框
     * 1.根据切换的字段，修改数据并赋值或者调用联动接口，组件重新加载数据
     * 2.如果是非整行编辑或者编辑的不是联动单元格，则调用保存接口
     * @param value 值
     * @param row 当前行
     * @param key 字段key
     * @param rowIndex 当前行索引
     * @returns
     */
    const handleSelectChange = async (value: string, row: CD_CostDetailConvertVO, key: string, rowIndex: number) => {
      tableStore.value.editRowIndex = rowIndex;
      if (rowIndex === -1) {
        return;
      }
      tableStore.value.editColumnKey = key;
      (tableData.value[rowIndex] as any)[key] = value;

      let v = '';
      switch (key) {
        case 'costType':
          v = await sTable.queryCostNode({
            ...row,
            costType: value,
            id: row?.id as number,
          });
          tableData.value[rowIndex].costNode = v;
          // loadTableData();
          break;
        case 'employeeDepartment':
          v = await sTable.queryEmployeeCodeByDepartment((tableData.value[rowIndex] as any).employeeDepartment);
          tableData.value[rowIndex].employeeType = v;
          // loadTableData();
          break;
        case 'ledgerName':
          v = await sTable.queryLedgerNameByCode(value);
          tableData.value[rowIndex].ledgerCode = v;
          // loadTableData();
          break;
      }
      sTextEditor.close();

      // 非整行编辑或者编辑的是非联动下拉框
      if (!row.editing && key !== 'costType' && key !== 'costNode') {
        console.log('%c✨✨非联动下拉框切换触发保存✨✨', 'font-size: 24px', tableStore.value);
        sTable.save({
          ...tableData.value[rowIndex],
          changeColumns: tableStore.value.editableColumnKeys,
        });
        editCellLoading.value = true;
      }
    };
    /**
     * 日期切换
     * 1.根据格式进行格式化并赋值相应字段
     * 2.如果修改的是过账日期则需要把年月分别赋值
     * 3.加载数据
     * @param value 值
     * @param key 字段key
     * @param format 格式
     * @param rowIndex 当前行索引
     */
    const dateChange = (value: Date, key: string, format: string, rowIndex: number) => {
      const cRow = tableData.value[rowIndex];
      (cRow as any)[key] = formatDate(value, format);

      tableStore.value.editColumnKey = key;

      if (key === 'billDate') {
        cRow.billYear = String(value.getFullYear());
        cRow.billMonth = String(value.getMonth() + 1);
      }
      tableData.value[rowIndex] = cRow;
    };
    /**
     * 根据type获取下拉框数据
     * @param type 字段key
     * @returns
     */
    const useList = (type: string) => {
      if (type === 'ledgerName') {
        return sTable.ledgerNameList;
      } else if (type === 'costNode') {
        return sTable.costNodeList;
      } else if (type === 'employeeDepartment') {
        return sTable.departmentList;
      } else if (type === 'employeeType') {
        return sTable.employeeTypeList;
      } else if (type === 'costType') {
        return costTypeList.value;
      }
    };
    /**
     * 重新加载数据
     * 在下一个渲染帧，调用表格组件的加载数据方法
     */
    const loadTableData = () => {
      nextTick(() => {
        const $table = xTable.value;
        if ($table) {
          $table.loadData(XEUtils.clone(tableData.value, true));
        }
      });
    };
    /**
     * 动态计算计算高度，用于表格组件高度赋值
     */
    const calculateHeight = () => {
      nextTick(() => {
        const tableEle = document.getElementById('cd-table');
        if (tableEle?.clientHeight) {
          height.value = tableEle?.clientHeight - 50;
        }
      });
    };
    //#endregion
    //#region
    /**
     * 复制行
     * 1.赋值状态值
     * 2.深拷贝一份数据并重置id、addUpFlag等字段
     * 3.保存数据
     * @param currentIndex 当前行索引
     * @returns
     */
    const copyRow = (currentIndex: number) => {
      if (tableData.value?.length === 0) {
        return;
      }
      if (deleteLoading.value) {
        message.warning('数据删除中，请稍候');
        return;
      }
      if (editCellLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }
      if (saveRowLoading.value) {
        message.warning('数据保存中，请稍候');
        return;
      }

      tableStore.value.operateType = TABLE_OPERATE_TYPE.复制行;
      tableStore.value.selectedRowIndex = currentIndex;
      tableStore.value.copyedRowIndex = currentIndex + 1;

      const row = cloneDeep(tableData.value[tableStore.value.selectedRowIndex]);
      row.id = null;
      row.addUpFlag = null;
      tableStore.value.currentRow = row;
      console.log('%c✨✨复制行✨✨', 'font-size: 24px', tableStore.value, row);
      // 复制直接保存
      sTable.save(row);
    };
    /**
     * 插入行
     * 1.在当前行上方或者下方插入n行
     * 2.调用接口查询下拉框数据，默认选中成本类型第一条数据
     * 3.组件加载数据
     * @param line 行数
     * @param type 类型 向上&向下
     * @param currentIndex 当前行索引
     */
    const insertRow = async (line: number, type: number, currentIndex: number) => {
      const list: CD_CostDetailConvertVO[] = [];

      if (costTypeList.value?.length === 0) {
        costTypeList.value = await sTable.queryCostType();
      }
      const costType = costTypeList.value?.length ? costTypeList.value[0]?.code : '';
      const costNode = await sTable.queryCostNode({
        costType,
      });

      for (let key = 0; key < line; key++) {
        list.push({
          id: null,
          projectNumber: '',
          projectTaskName: '',
          ledgerCode: '',
          ledgerName: '',
          costNode,
          employeeCode: '',
          employeeName: '',
          employeeDepartment: '',
          employeeType: '',
          productCode: '',
          productName: '',
          productType: '',
          productTypeName: '',
          billDate: '',
          billYear: '',
          billMonth: '',
          billCode: '',
          billTypeName: '',
          billTitleContent: '',
          billProjectContent: '',
          recordTime: '',
          balance: '',
          amount: '',
          costType,
          listOrder: null,
          actualBillDate: '',
          hasLog: false,
          splitFlag: ESplitFlag.未拆分,

          formatBillDate: null,
          formatRecordTime: null,
          editing: true,
          addUpFlag: type === INSERT_TYPE.上方,
        });
      }

      tableData.value.splice(type === INSERT_TYPE.上方 ? currentIndex : currentIndex + 1, 0, ...list);
      tableStore.value.insertedRowStartIndex = type === INSERT_TYPE.上方 ? currentIndex : currentIndex + 1;
      tableStore.value.insertedRowEndIndex = type === INSERT_TYPE.上方 ? currentIndex + line - 1 : currentIndex + line;
      sToolPopover.close();

      sTable.queryLedgerName();
      sTable.queryDepartment();
      sTable.queryEmployeeType();

      nextTick(() => {
        const $table = xTable.value;
        if ($table) {
          $table.loadData(XEUtils.clone(tableData.value, true));
        }
      });
    };
    /**
     * 整行保存
     * 1.当前行如果是向上插入的，需要拿到此行以下第一个有listOrder的listOrder
     * 2.当前行如果是向下插入的，需要拿到此行以上第一个有listOrder的listOrder
     * 3.保存前提示是否确认保存
     * @param currentIndex
     */
    const saveWholeRow = (currentIndex: number) => {
      tableStore.value.operateType = tableData.value[currentIndex].editing
        ? TABLE_OPERATE_TYPE.整行保存
        : TABLE_OPERATE_TYPE.联动下拉框整行保存;
      tableStore.value.editRowIndex = currentIndex;
      const addUpFlag = tableData.value[currentIndex].addUpFlag;

      const { editRowIndex } = tableStore.value;
      const row = cloneDeep(tableData.value[editRowIndex]);
      if (Object.prototype.toString.call(addUpFlag) !== '[object Null]') {
        const listOrder = useEfficaceIndex(currentIndex, addUpFlag as boolean);
        row.listOrder = listOrder;
      }
      tableStore.value.currentRow = row;

      if (tableData.value[currentIndex].editing) {
        ElMessageBox.confirm('请确认信息是否填写完整！', '保存确认', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          type: 'warning',
        })
          .then((res) => {
            if (res === 'confirm') {
              sTable.save(row);
            }
          })
          .catch(() => {
            console.log('%c✨✨取消保存✨✨', 'font-size: 24px');
          });
      } else {
        sTable.save({
          ...row,
          changeColumns: tableStore.value.editableColumnKeys,
        });
      }
    };
    /**
     * 获取插入行入参的listOrder
     * 1.判断是向上插入还是向下插入
     * 2.找到当前行后一个不为null的listOrder
     * @param index 当前行
     * @param upFlag 是否向上插入
     * @returns
     */
    const useEfficaceIndex = (index: number, upFlag: boolean) => {
      let listOrder = 0;
      const findIndex = (i: number) => {
        if (Object.prototype.toString.call(tableData.value[i].listOrder) === '[object Null]') {
          if (upFlag) {
            i += 1;
          } else {
            i -= 1;
          }
          if (i >= 0 || i <= tableData.value.length) {
            findIndex(i);
          }
        } else {
          listOrder = tableData.value[i].listOrder as number;
        }
      };

      findIndex(index);

      return listOrder;
    };
    //#endregion
    // 校验空字段
    const checkDefault = (value: string) => {
      return value === '' || (value ?? '--') === '--';
    };
    /**
     * 表格单元格回显
     * @param value 值
     * @param key 字段key
     * @returns
     */
    const mapCellValue = (value: string, key: string) => {
      let name = value;
      switch (key) {
        case 'costType':
          costTypeList.value?.forEach((item) => {
            if (item.code === value) {
              name = item.name;
            }
          });
          break;
        case 'balance':
          name = thousandSeparation(Number(value));
          break;
        default:
          name = value;
      }
      return name;
    };
    /**
     * 监听下拉框弹出事件
     * 用于判断当前是否有单元格编辑
     */
    const handleSelectVisibleChange = (value: boolean, rowIndex: number, key: string) => {
      if (!value) {
        return;
      }

      const { editRowIndex, insertedRowEndIndex, insertedRowStartIndex, editColumnKey, originValueMap } =
        tableStore.value;
      // 只是单纯的单元格编辑  则不进行判断
      if (editRowIndex === -1 || rowIndex === editRowIndex) {
        return;
      }
      const relationKeys = ['costNode', 'costType'];
      // 1.有正在编辑的单元格   2.点击的单元格不在插入行中  3. 点击的是非当前行或者点击的不是当前正在编辑的单元格
      if (
        editRowIndex !== -1 &&
        !(editRowIndex <= insertedRowEndIndex && editRowIndex >= insertedRowStartIndex) &&
        (rowIndex !== editRowIndex ||
          (rowIndex === editRowIndex &&
            ((!relationKeys?.includes(key) && key !== editColumnKey) ||
              !(relationKeys?.includes(key) && relationKeys?.includes(editColumnKey)))))
      ) {
        console.log('%c✨✨点击非编辑单元格✨✨', 'font-size: 24px');
        const cRow = tableData.value[editRowIndex];
        if (
          (relationKeys?.includes(editColumnKey) &&
            (cRow as any)?.costNode === originValueMap?.get('costNode') &&
            (cRow as any)?.costType === originValueMap?.get('costType')) ||
          (!relationKeys?.includes(editColumnKey) &&
            (cRow as any)?.[editColumnKey] === originValueMap?.get(editColumnKey))
        ) {
          console.log('%c✨✨handleSelectVisibleChange点击的是非联动下拉框且数据没变✨✨', 'font-size: 24px');

          tableStore.value.selectedRowIndex = -1;
          tableStore.value.copyedRowIndex = -1;
          tableStore.value.editColumnKey = '';
          tableStore.value.editRowIndex = -1;
          tableStore.value.editableColumnKeys = [];
          tableStore.value.originValueMap = new Map();
        }

        if (
          relationKeys?.includes(editColumnKey) &&
          ((cRow as any)?.costNode !== originValueMap?.get('costNode') ||
            (cRow as any)?.costType !== originValueMap?.get('costType'))
        ) {
          if (!!cRow?.id) {
            console.log('%c✨✨handleSelectVisibleChange点击的是联动下拉框且数据变✨✨', 'font-size: 24px');
            sTable.save({
              ...cloneDeep(cRow),
              changeColumns: tableStore.value.editableColumnKeys,
            });
            editCellLoading.value = true;
          }
        }
      }
    };

    return {
      isLoading,
      isEmpty,
      tableData,
      fiexd,
      tableStore,
      total,
      sTable,
      COLUMN_TYPE,
      columnList,
      xTable,
      filterMap,
      height,
      hasAuthority,
      tableSize,
      totalBalance,
      districts,

      thousandSeparation,
      saveWholeRow,
      handleSelectChange,
      dateChange,
      useList,
      resetPageStatus,
      checkDefault,
      handleRowContextMenu,
      handleDateMaskClick,
      handleCellClick,
      handleColumnResize,
      copyRow,
      insertRow,
      saveCell,
      handleDelete,
      handlePageNumChange,
      handlePageSizeChange,
      getRowClassName,
      popoverClose,
      handleScreenQuery,
      mapCellValue,
      handleSelectVisibleChange,
    };
  },
});
