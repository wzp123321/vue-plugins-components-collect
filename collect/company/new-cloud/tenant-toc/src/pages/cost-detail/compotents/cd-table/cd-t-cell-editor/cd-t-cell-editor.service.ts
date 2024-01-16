/*
 * @Description: 文本编辑服务
 * @Author: zpwan
 * @Date: 2022-08-10 10:15:49
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-11-01 16:46:54
 */
import { ref, nextTick } from 'vue';
import { BehaviorSubject, Observable } from 'rxjs';
import { PopoverPosition } from '../cd-t-tool-popover/cd-t-tool-popover.api';
import { CD_ETableSize } from '../../../cost-detail.api';

import ToolbarService from '../../cd-toolbar/cd-toolbar.service';

import {
  CELL_HEIGHT,
  CELL_HEIGHT_MINI,
  INUPUT_HEIGHT,
  CELL_PADDING,
  COLUMN_TYPE,
  MENU_WIDTH,
  HEADER_HEIGHT,
  FIXED_COLUMN_WIDTH,
  PAGINATION_HEIGHT,
  PAGINATION_MARGIN_TOP,
} from '../constant';

const ALLOW_SPACE_COLUMNS = ['billTitleContent', 'billProjectContent'];

class TextEditorService {
  //#region
  private _text = ref<string>('');

  private _width = ref<string>('');

  private _position = ref<PopoverPosition>({
    top: '',
    left: '',
  });

  private originScrollVO = {
    scrollLeft: 0,
    scrollTop: 0,
  };

  // 原始位置，宽度
  private _originTop = 0;
  private _originLeft = 0;
  private _originWidth = 0;

  private _rowIndex = -1;

  private _visible = ref<boolean>(false);

  private _type: string = '';
  private _key: string = '';

  public get text(): string {
    return this._text.value;
  }

  public set text(value: string) {
    this._text.value = value;
  }

  public get width(): string {
    return this._width.value;
  }

  public get position(): PopoverPosition {
    return this._position.value;
  }

  public get visible(): boolean {
    return this._visible.value;
  }

  public set visible(value: boolean) {
    this._visible.value = value;
  }

  private readonly _editorValue$ = new BehaviorSubject<{ value: string; index: number; key: string }>({
    value: '',
    index: -1,
    key: '',
  });

  public get editorValue$() {
    return this._editorValue$ as unknown as Observable<{ value: string; index: number; key: string }>;
  }
  //#endregion

  /**
   * 打开输入编辑框
   * 1.初始化赋值
   * 2.根据文本计算出文本宽度，赋值编辑框宽度
   * 3.初始化坐标，根据宽度高度以及当前距离顶部左侧距离
   * 4.输入框聚焦，光标定位到输入框末尾
   * @param event 事件对象
   * @param value 初始值
   * @param width 宽度
   * @param type 类型
   * @param key 字段key
   * @param rowIndex 行索引
   */
  show(event: Event, value: string, width: string, type: string, key: string, rowIndex: number) {
    this._text.value = '';
    this._rowIndex = rowIndex;

    const inputEle = document.getElementById('cd-t-cell-editor');
    if (inputEle) {
      inputEle.style.height = '32px';
    }
    this._visible.value = true;
    this._text.value = value ?? '';
    this._originWidth = Number(width.replace('px', ''));
    this._width.value = `${
      this.getTextWidth(value) > this._originWidth ? this.getTextWidth(value) : this._originWidth
    }px`;
    this._type = type;
    this._key = key;

    this.initPosition(event);
    this.inputFoucs();
  }
  /**
   * 初始化调整位置
   * 1.被左侧固定列遮挡住
   * 2.被右侧遮挡住部分
   * 3.被表格底部遮挡部分
   * @param event
   */
  initPosition(event: Event) {
    // 如果是td触发 需要减去15的内边距
    const offsetLeft =
      (event.target as HTMLElement).tagName?.toLocaleLowerCase() !== 'span' &&
      (event.target as HTMLElement).tagName?.toLocaleLowerCase() !== 'input'
        ? CELL_PADDING
        : 0;
    // 页面滚动距离
    const containerScrollTop = (document.getElementById('cost-detail') as HTMLElement).scrollTop;

    const cellHeight = ToolbarService.sizeType === CD_ETableSize.紧凑 ? CELL_HEIGHT_MINI : CELL_HEIGHT;
    const offset = (cellHeight - INUPUT_HEIGHT) / 2;
    const offsetM = document.getElementsByClassName('ant-menu')?.length ? MENU_WIDTH : 0;
    const offsetH = document.getElementsByClassName('page-header')?.length ? HEADER_HEIGHT : 0;
    const tableEle = document.querySelector('.vxe-table--body-wrapper.body--wrapper');

    const top =
      (event.currentTarget as HTMLElement).getBoundingClientRect().top + offset + containerScrollTop - offsetH;
    const left = (event.target as HTMLElement).getBoundingClientRect().left + offsetLeft - offsetM;

    this._originTop = top;
    this._originLeft = left;

    // 判断当前位置横向会不会超出屏幕
    const sWidth = document.documentElement.clientWidth;
    const sHeight = document.documentElement.clientHeight;
    let leftOffset = 0;
    let topOffset = 1;
    if (sWidth < Number(this._width.value.replace('px', '')) + Number(left) + 48 + MENU_WIDTH) {
      console.warn('输入框位置右侧超出范围！');

      leftOffset = Number(this._width.value.replace('px', '')) + Number(left) + 48 + MENU_WIDTH - sWidth;
      if (tableEle) {
        const l = leftOffset + tableEle.scrollLeft;
        tableEle.scroll({
          left: l,
          behavior: 'auto',
        });
        nextTick(() => {
          this.inputFoucs();
        });
      }
    }

    // 当前位置被固定列覆盖
    if (left < MENU_WIDTH + 16 + 12 && this._key !== 'projectNumber') {
      console.warn('输入框位置左侧被覆盖！');

      leftOffset = left - FIXED_COLUMN_WIDTH - 16 - 12 - 10;

      if (tableEle) {
        const l = tableEle.scrollLeft + leftOffset;
        tableEle.scroll({
          left: l,
          behavior: 'auto',
        });
        nextTick(() => {
          this.inputFoucs();
        });
      }
    }
    // 当前位置触底
    if (top + INUPUT_HEIGHT + HEADER_HEIGHT + PAGINATION_HEIGHT + PAGINATION_MARGIN_TOP + 10 + 15 + 8 > sHeight) {
      console.warn('输入框位置底部被覆盖！');
      // top 输入框高度  头部高度  分页器高度 分页器外边距  两层容器内边距 滚动条宽度
      topOffset =
        top + INUPUT_HEIGHT + HEADER_HEIGHT + PAGINATION_HEIGHT + PAGINATION_MARGIN_TOP + 10 + 15 + 8 - sHeight;

      if (tableEle) {
        const t = tableEle.scrollTop + topOffset;
        tableEle.scroll({
          top: t,
          behavior: 'auto',
        });
        nextTick(() => {
          this.inputFoucs();
        });
      }
    }

    this._position.value = {
      top: `${top - topOffset}px`,
      left: `${left - leftOffset}px`,
    };
    console.log(
      '%c✨✨✨✨',
      'font-size: 24px',
      (event.target as HTMLElement).getBoundingClientRect(),
      this._position.value
    );
  }
  /**
   * 给table组件添加滚动事件，滚动后将输入框隐藏
   */
  addScrollEvent() {
    const tEle = document.querySelector('.vxe-table--body-wrapper.body--wrapper');
    if (tEle) {
      this.originScrollVO = {
        scrollLeft: tEle.scrollLeft,
        scrollTop: tEle.scrollTop,
      };
      tEle.addEventListener('scroll', this.hide);
    }
  }
  /**
   * 移除事件
   */
  removeScrollEvent() {
    const tEle = document.querySelector('.vxe-table--body-wrapper.body--wrapper');
    if (tEle) {
      tEle.removeEventListener('scroll', this.hide);
    }
  }
  /**
   * 隐藏
   * @param e
   */
  hide = (e: Event) => {
    if (
      (e.target as HTMLElement).scrollLeft !== this.originScrollVO.scrollLeft ||
      (e.target as HTMLElement).scrollTop !== this.originScrollVO.scrollTop
    ) {
      this._visible.value = false;
    }
    this.originScrollVO = {
      scrollLeft: (e.target as HTMLElement).scrollLeft,
      scrollTop: (e.target as HTMLElement).scrollTop,
    };
  };
  /**
   * 输入框聚焦
   * 1.判断输入框添加文本后的高度，计算当前位置加上宽高后是否会被遮挡，如果会被遮挡则动态修改位置
   * 2.光标定位
   */
  inputFoucs() {
    nextTick(() => {
      try {
        // 聚焦
        const inputEle = document.getElementById('cd-t-cell-editor');

        if (inputEle) {
          setTimeout(() => {
            inputEle?.focus();

            this._originTop = inputEle.getBoundingClientRect().top - HEADER_HEIGHT;
            this._originLeft = inputEle.getBoundingClientRect().left - MENU_WIDTH;
          });

          this.addScrollEvent();

          inputEle.style.height = `${inputEle.scrollHeight + 2}px`;

          this.calculateBottomPosition();

          // 光标定位到最后
          const range = document.createRange(); //创建选择对象
          range.selectNodeContents(inputEle);
          range.collapse(false);

          //判断光标位置，如不需要可删除
          const sel = window.getSelection();
          if (!sel || sel.anchorOffset != 0) {
            return;
          }
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } catch (error) {
        console.warn('error-------------', error);
      }
    });
  }

  close() {
    this._visible.value = false;

    this.removeScrollEvent();
  }
  /**
   * 文本过滤
   * 1.动态计算文本宽度
   * 2.根据类型过滤输入框
   * 3.计算宽度
   * @param e
   * @returns
   */
  filterInput = (e: InputEvent) => {
    const inputEle = e.target as HTMLInputElement;
    inputEle.style.height = `${inputEle.scrollHeight + 2}px`;
    const width = this.getTextWidth((e.target as HTMLInputElement).value);
    this._width.value = `${width}px`;

    if (e.isComposing) {
      return;
    }

    if (this._type === COLUMN_TYPE.文本输入框 || this._type === COLUMN_TYPE.正数输入框) {
      this.filterText();
    }

    if (this._type === COLUMN_TYPE.负数输入框) {
      this.filterNumberWidthNegative();
    }

    nextTick(() => {
      inputEle.style.height = 'auto';
      inputEle.style.height = `${inputEle.scrollHeight + 2}px`;

      this.calculateBottomPosition();
    });
  };
  /**
   * 根据文本获取宽度
   * 1.hideEle为脱离文档流的dom元素，通过赋值dom文本计算dom宽度
   * 2.判断是否超出最大宽度MAX_WIDTH
   * @param text
   * @returns
   */
  getTextWidth(text: string) {
    let w = this._originWidth;
    const hideEle = document.querySelector('.cd-t-cell-text-hidden') as HTMLElement;
    if (hideEle) {
      hideEle.innerHTML = text;
      hideEle.style.fontSize = '14px';
      const rect = hideEle.getBoundingClientRect();
      w = rect.right - rect.left + 18;

      if (w < this._originWidth) {
        w = this._originWidth;
      }
      if (w > this._originWidth) {
        w = this._originWidth;
      }
    }
    return w;
  }

  /**
   * 计算位置 判断是否超出边界
   * HEADER_HEIGHT 顶部高度
   * topNum
   * 1.获取容器宽高
   * 2.获取输入框宽高
   * 3.在输入文本后输入框宽高都会变化，计算当前距离顶部的距离加上宽高是否会超出屏幕，如果会则用容器宽高减去输入框宽高以及部分内边距来修改坐标
   */
  calculateBottomPosition() {
    const sHeight = document.documentElement.clientHeight;
    const sWidth = document.documentElement.clientWidth;
    const { top, left } = this._position.value;
    const topNum = Number(top.replace('px', ''));
    const inputEle = document.getElementById('cd-t-cell-editor');
    const heightNum = (inputEle as HTMLElement)?.clientHeight + 2;

    // 顶部高度 + 距离顶部高度 + 高度 + 底部分页器高度 + 分页器外边距高度是否大于容器高度
    if (HEADER_HEIGHT + topNum + heightNum + PAGINATION_HEIGHT + PAGINATION_MARGIN_TOP > sHeight) {
      const t = sHeight - (HEADER_HEIGHT + heightNum + PAGINATION_HEIGHT + PAGINATION_MARGIN_TOP);
      this._position.value.top = `${t}px`;
    }
    // 删除文本后输入框高度减少，这个时候判断输入框距离顶部高度用初始传入的top内容是否会被覆盖
    if (topNum + heightNum < this._originTop + INUPUT_HEIGHT) {
      this._position.value.top = `${this._originTop + INUPUT_HEIGHT - heightNum}px`;
    }

    /**
     * 如果left+width超出范围
     * Number(left.replace('px', '')) ----> left
     * Number(this._width.value.replace('px', '')) -----> width
     * 16 + 16 -----> 两个内边距
     * 15 ------> 单元格内边距
     * MENU_WIDTH -----> 菜单宽度
     */
    if (
      Number(left.replace('px', '')) + Number(this._width.value.replace('px', '')) + 16 + 16 + 15 + MENU_WIDTH >=
      sWidth
    ) {
      this._position.value.left = `${
        sWidth - 16 - 16 - 15 - Number(this._width.value.replace('px', '')) - MENU_WIDTH
      }px`;
    }
    /**
     * 如果宽度在减少 此时left需要对应增加，直至恢复原位
     */
    if (
      Number(left.replace('px', '')) < this._originLeft &&
      Number(this._width.value.replace('px', '')) >= this._originWidth &&
      Number(this._width.value.replace('px', '')) < this._originWidth &&
      Number(left.replace('px', '')) + Number(this._width.value.replace('px', '')) + 16 + 16 + 15 + MENU_WIDTH < sWidth
    ) {
      console.log(sWidth - 16 - 16 - 15 - Number(this._width.value.replace('px', '')) - MENU_WIDTH);
      this._position.value.left = `${
        sWidth - 16 - 16 - 15 - Number(this._width.value.replace('px', '')) - MENU_WIDTH
      }px`;
    }
  }

  /**
   * 普通文本框进行过滤
   */
  filterText() {
    const characters: string = '';
    const defaultStr = String.raw`\\<>`;
    const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
    this._text.value = this._text.value.replace(reg, '');
    this._text.value = this._text.value.trim();
    // 过滤空格
    if (!ALLOW_SPACE_COLUMNS?.includes(this._key)) {
      this._text.value = this._text.value.replace(/\s+/g, '');
    }
  }

  /**
   * 过滤数字
   */
  filterNumberWidthNegative() {
    // 整数位、小数位
    let integral = 10;
    const decimal = 2;

    this._text.value = this._text.value.replace(/[^-0-9\.]/g, '');
    // 排除不在开头的负号
    this._text.value = this._text.value.replace(/(?<=[0-9])-/g, '');
    // 为负数 整数可输入11位
    if (this._text.value.substring(0, 1) === '-') {
      integral = 11;
    } else {
      integral = 10;
    }
    // 为负数 连续输入负号
    if (this._text.value.substring(0, 1) === '-' && this._text.value.substring(1, 2) === '-') {
      this._text.value = this._text.value.substring(1);
    }
    // 为负数 禁止负号后面连续输入0
    if (
      this._text.value.length > 1 &&
      this._text.value.substring(0, 1) === '-' &&
      this._text.value.substring(1, 2) === '0' &&
      this._text.value.substring(2, 3) !== '.'
    ) {
      this._text.value = this._text.value.substring(0, 2);
    }
    // 为负数 处理负号后面小数点
    if (
      this._text.value.length > 1 &&
      this._text.value.substring(0, 1) === '-' &&
      this._text.value.substring(1, 2) === '.'
    ) {
      this._text.value = this._text.value.substring(0, 1);
      // this._text.value  = `-0${this._text.value }`;
    }
    // 正数 处理首位小数点
    if (this._text.value.substring(0, 1) === '.') {
      this._text.value = `0${this._text.value}`;
    }
    // 正数 禁止头部连续输入0
    if (
      this._text.value.length > 1 &&
      this._text.value.substring(0, 1) === '0' &&
      this._text.value.substring(1, 2) !== '.'
    ) {
      this._text.value = this._text.value.substring(1);
    }
    if (this._text.value.indexOf('.') !== this._text.value.lastIndexOf('.')) {
      this._text.value = this.deduplicate(this._text.value, '.');
    }

    if (this._text.value.indexOf('.') !== -1) {
      const valueArr = this._text.value.split('.');
      this._text.value = `${valueArr[0].substring(0, integral)}.${valueArr[1].substring(0, decimal) || ''}`;
    } else {
      this._text.value = this._text.value.substring(0, integral);
    }
    this._text.value = this._text.value.trim();

    // 限制小数点后几位
    this._text.value = this._text.value.replace(`/^(\-)*(\d+)\.(\d{0,${decimal}}).*$/`, '$1$2.$3');
  }

  filterPositiveNumber() {
    // 整数位、小数位
    const integral = 10;
    const decimal = 2;
    this._text.value = this._text.value.replace(/[^0-9\.]/g, '');
    // 处理首位小数点
    if (this._text.value.substring(0, 1) === '.') {
      this._text.value = `0${this._text.value}`;
    }
    // 禁止头部连续输入0
    if (
      this._text.value.length > 1 &&
      this._text.value.substring(0, 1) === '0' &&
      this._text.value.substring(1, 2) !== '.'
    ) {
      this._text.value = this._text.value.substring(1);
    }
    if (this._text.value.indexOf('.') !== this._text.value.lastIndexOf('.')) {
      this._text.value = this.deduplicate(this._text.value, '.');
    }

    if (this._text.value.indexOf('.') !== -1) {
      const valueArr = this._text.value.split('.');
      this._text.value = `${valueArr[0].substring(0, integral)}.${valueArr[1].substring(0, decimal) || ''}`;
    } else {
      this._text.value = this._text.value.substring(0, integral);
    }
    this._text.value = this._text.value.trim();

    // 限制小数点后几位
    this._text.value = this._text.value.replace(`/^(\-)*(\d+)\.(\d{0,${decimal}}).*$/`, '$1$2.$3');
  }

  // 过滤连续.等特殊字符
  deduplicate(target: string, symbol: string): string {
    if (target.includes(symbol)) {
      const temp = target.split(symbol);
      let str = `${temp.shift() ?? ''}${symbol}`;
      temp.filter((v) => v).forEach((v) => (str += v));
      return str;
    }
    return target;
  }

  keyEnter() {
    this._editorValue$.next({ value: this._text.value, index: this._rowIndex, key: this._key });
    this._rowIndex = -1;
  }

  change() {
    this._editorValue$.next({ value: this._text.value, index: this._rowIndex, key: this._key });
    this._rowIndex = -1;
  }
}

export default new TextEditorService();
