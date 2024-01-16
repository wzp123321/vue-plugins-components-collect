/*
 * @Description: 工具弹出层
 * @Author: zpwan
 * @Date: 2022-08-02 19:49:24
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-09-13 19:41:52
 */
import { defineComponent } from 'vue';
import { ElInputNumber } from 'element-plus';

import ToolPopoverService from './cd-t-tool-popover.service';

import { INSERT_TYPE } from '../constant';

import message from '@/utils/message';

// 输入框限制
const MIN = 0;
const MAX = 100;

export default defineComponent({
  name: 'CdTableToolPopover',
  components: {
    'el-input-number': ElInputNumber,
  },
  setup(props, { emit }) {
    const cdToolPopover = ToolPopoverService;

    let type = 0;

    //#region 蒙层操作
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // 当上次改的是上插入
      if (type === INSERT_TYPE.上方 && cdToolPopover.insertTopLine > 1) {
        emit('insert', cdToolPopover.insertTopLine, type, cdToolPopover.currentIndex);
      }

      // 当上次改的是下插入
      if (type === INSERT_TYPE.下方 && cdToolPopover.insertBottomLine > 1) {
        emit('insert', cdToolPopover.insertBottomLine, type, cdToolPopover.currentIndex);
      }
      cdToolPopover.visible = false;
    };

    /**
     * 鼠标左击空白处
     * 关闭弹框，并触发事件
     * @param e
     */
    const onHide = (e: MouseEvent) => {
      cdToolPopover.hide(e);
      emit('popoverClose');
    };
    //#endregion

    //#region 行操作
    // 输入框聚焦 --- 添加监听事件
    const onFocus = (e: InputEvent, t: number) => {
      type = t;

      e?.target?.addEventListener('input', (ie: any) => {
        // 是否在剪切板
        if (ie.isComposing) {
          return;
        }
        const inputEle = ie.target as HTMLInputElement;
        inputEle.value = inputEle.value.replace(/\D+/g, '');
        inputEle.value = inputEle.value.substring(0, 3);
        if (Number(inputEle.value) > 100) {
          inputEle.value = '100';
        }
        if (inputEle.value === '0') {
          inputEle.value = '1';
        }
      });
    };

    const onEnter = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      handleInsert(e, (e.target as any).value, type);
    };

    // 插入
    const handleInsert = (event: MouseEvent, value: number, type: number) => {
      event.preventDefault();
      event.stopPropagation();

      if (value <= 0) {
        message.error('请输入1-100的整数！');
        (event.target as HTMLInputElement).value = '1';
        return;
      }
      if (type === INSERT_TYPE.上方) {
        cdToolPopover.insertTopLine = Number(value);
      } else {
        cdToolPopover.insertBottomLine = Number(value);
      }

      cdToolPopover.visible = false;
      emit(
        'insert',
        type === INSERT_TYPE.上方 ? cdToolPopover.insertTopLine : cdToolPopover.insertBottomLine,
        type,
        cdToolPopover.currentIndex
      );
    };

    const handleMenuClick = (event: MouseEvent, value: number, type: number) => {
      event.preventDefault();
      event.stopPropagation();

      const classNames = [
        'el-input-number',
        'el-input-number__decrease',
        'el-input-number__increase',
        'el-input-number__decrease is-disabled',
        'el-input-number__increase is-disabled',
        'el-input',
        'el-input__inner',
      ];

      if (classNames.includes((event.target as HTMLElement).className)) {
        return;
      }

      handleInsert(event, value, type);
    };

    const copyRow = () => {
      cdToolPopover.visible = false;
      emit('copy', cdToolPopover.currentIndex);
    };

    const deleteRow = () => {
      if (cdToolPopover.delete_disabled) {
        return;
      }
      cdToolPopover.visible = false;

      emit('delete', cdToolPopover.row_id as number);
    };

    const saveWholeRow = () => {
      emit('saveWholeRow', cdToolPopover.currentIndex);
    };
    //#endregion

    return {
      MIN,
      MAX,
      cdToolPopover,
      INSERT_TYPE,

      copyRow,
      onContextMenu,
      onFocus,
      onEnter,
      deleteRow,
      saveWholeRow,
      onHide,
      handleMenuClick,
    };
  },
});
