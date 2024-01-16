/*
 * @Description: 表格弹出层
 * @Author: zpwan
 * @Date: 2022-08-03 09:20:40
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-11-01 16:14:31
 */
import { ref } from 'vue';

import { PopoverPosition } from './cd-t-tool-popover.api';

// 弹框尺寸
const POPOVER_WIDTH_NORMAL = 245;
const POPOVER_WIDTH_SAVE = 104;
const POPOVER_HEIGHT_NORMAL = 160;
const POPOVER_HEIGHT_SAVE = 48;

class toolPopoverService {
  //#region
  private _visible = ref<boolean>(false);

  private _pagePosition = ref<PopoverPosition>({
    top: '',
    left: '',
  });

  private _is_editing = ref<boolean>(false);

  private _delete_disabled = ref<boolean>(false);

  private _row_id = ref<number | null>(null);

  private _currentIndex = ref<number>(-1);

  private _pageWidth: number = 0;

  private _pageHeight: number = 0;

  private _insertTopLine = ref<number>(1);

  private _insertBottomLine = ref<number>(1);

  public get visible(): boolean {
    return this._visible.value;
  }

  public set visible(value: boolean) {
    this._visible.value = value;
  }

  public get is_editing(): boolean {
    return this._is_editing.value;
  }

  public get delete_disabled(): boolean {
    return this._delete_disabled.value;
  }

  public get row_id(): number | null {
    return this._row_id.value;
  }

  public get currentIndex(): number {
    return this._currentIndex.value;
  }

  public get pagePosition(): PopoverPosition {
    return this._pagePosition.value;
  }

  public get insertTopLine(): number {
    return this._insertTopLine.value;
  }

  public set insertTopLine(value: number) {
    this._insertTopLine.value = value;
  }

  public get insertBottomLine(): number {
    return this._insertBottomLine.value;
  }

  public set insertBottomLine(value: number) {
    this._insertBottomLine.value = value;
  }
  //#endregion

  constructor() {
    this._pageWidth = document.documentElement.clientWidth ?? 0;
    this._pageHeight = document.documentElement.clientHeight ?? 0;
  }

  /**
   * 打开弹框
   * @param top  当前距离顶部高度
   * @param left 当前距离左侧高度
   * @param is_editing 是否是编辑
   * @param id
   * @param currentIndex 当前行
   * @param deleteDisabled 是否可删除
   */
  show(
    top: number,
    left: number,
    is_editing: boolean,
    id: number | null,
    currentIndex: number,
    deleteDisabled: boolean
  ) {
    this._insertBottomLine.value = 1;
    this._insertTopLine.value = 1;
    this._pagePosition.value = {
      top: '',
      left: '',
    };

    this._is_editing.value = is_editing;
    this._row_id.value = id;
    this._currentIndex.value = currentIndex;
    this._delete_disabled.value = deleteDisabled;

    const h = is_editing ? POPOVER_HEIGHT_SAVE : POPOVER_HEIGHT_NORMAL;
    const w = is_editing ? POPOVER_WIDTH_SAVE : POPOVER_WIDTH_NORMAL;

    this._pagePosition.value.top = top + h > this._pageHeight ? `${top - h}px` : `${top}px`;
    this._pagePosition.value.left = left + w > this._pageWidth ? `${left - w}px` : `${left}px`;

    this._visible.value = true;
  }

  close() {
    this._visible.value = false;
  }

  hide(e: MouseEvent) {
    e.preventDefault();
    const ele = document.getElementById('popover-container');
    if (ele?.contains(e.target as HTMLElement)) {
      return;
    }
    this._visible.value = false;
  }
}

export default new toolPopoverService();
