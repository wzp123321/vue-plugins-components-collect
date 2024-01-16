/*
 * @Description: 备注弹框服务
 * @Author: zpwan
 * @Date: 2022-08-17 16:06:48
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-11-01 11:33:17
 */
import { ref } from 'vue';
import { HTTP_EState, HTTP_SCommon } from 'web-core';
import { Observable, BehaviorSubject } from 'rxjs';

import {
  RemarkOptions,
  RemarkStatus,
  AddRemarkParams,
  RpResultVO,
  MA_H_C_SearchParams,
} from './ma-h-c-remark-popover.api';
import { MA_HOME_EDateType, TOKEN } from '../../../services/api';

import { ElMessageBox } from 'element-plus';
import message from '@/utils/message';

import { FGetCookie } from '@/core/token';

enum EPath {
  新增节点备注 = '/business/analyse/node/remark/add',
  编辑节点备注 = '/business/analyse/node/remark/update',
  删除节点备注 = '/business/analyse/node/remark/delete',
}

class CommentPopoverService {
  //#region
  private _createHttp: HTTP_SCommon<number, number>;
  private _deleteHttp: HTTP_SCommon<number, number>;
  private _editorHttp: HTTP_SCommon<number, number>;

  private readonly _rpResult$ = new BehaviorSubject<RpResultVO>({ remark: '', operateName: '' });

  public get rpResult$() {
    return this._rpResult$ as unknown as Observable<RpResultVO>;
  }
  //#endregion

  //#region
  private _options = ref<RemarkOptions>({
    nodeId: '',
    top: '',
    left: '',
    direction: 'right',
  });

  private _visible = ref<boolean>(false);
  private _is_active = ref<boolean>(false);

  private _remarkStatus = ref<number>(RemarkStatus.待插入);

  private _remark = ref<string>('');
  private _originRemark = ref<string>('');

  private _username = ref<string>('');

  private _searchParams = ref<MA_H_C_SearchParams>({
    durationType: MA_HOME_EDateType.按年,
    queryType: 0,
  });

  public get options(): RemarkOptions {
    return this._options.value;
  }

  public get visible(): boolean {
    return this._visible.value;
  }

  public get remarkStatus(): number {
    return this._remarkStatus.value;
  }

  public set remarkStatus(value: number) {
    this._remarkStatus.value = value;
  }

  public get remark(): string {
    return this._remark.value;
  }

  public set remark(value: string) {
    this._remark.value = value;
  }

  public get username(): string {
    return this._username.value;
  }

  public get is_active(): boolean {
    return this._is_active.value;
  }

  public get searchParams(): MA_H_C_SearchParams {
    return this._searchParams.value;
  }

  public set searchParams(value: MA_H_C_SearchParams) {
    this._searchParams.value = value;
  }
  //#endregion
  //#region
  /**
   * 构造函数
   * 1.赋值
   * 2.初始化部分请求
   */
  constructor() {
    this._username.value = FGetCookie('username') ?? 'wanzp';

    this._createHttp = new HTTP_SCommon({ url: EPath.新增节点备注, converter: (data) => data ?? 1 });
    this._deleteHttp = new HTTP_SCommon({ url: EPath.删除节点备注, converter: (data) => data ?? 1 });
    this._editorHttp = new HTTP_SCommon({ url: EPath.编辑节点备注, converter: (data) => data ?? 1 });

    this._editorHttp.result$.subscribe((v) => {
      if (v.state === HTTP_EState.success) {
        message.success(v.message ?? '操作成功');
        this._visible.value = false;
        this._rpResult$.next({
          remark: this._remark.value,
          operateName: this._username.value,
        });
      }
      if (v.state === HTTP_EState.error) {
        message.error(v.message ?? '操作失败');
      }
    });
    this._createHttp.result$.subscribe((v) => {
      if (v.state === HTTP_EState.success) {
        message.success(v.message ?? '操作成功');
        this._visible.value = false;
        this._rpResult$.next({
          remark: this._remark.value,
          operateName: this._username.value,
        });
      }
      if (v.state === HTTP_EState.error) {
        message.error(v.message ?? '操作失败');
      }
    });
    this._deleteHttp.result$.subscribe((v) => {
      if (v.state === HTTP_EState.success) {
        message.success(v.message ?? '操作成功');
        this._visible.value = false;
        this._rpResult$.next({
          remark: '',
          operateName: '',
        });
      }
      if (v.state === HTTP_EState.error) {
        message.error(v.message ?? '操作失败');
      }
    });
  }
  //#endregion

  /**
   * 打开弹框
   * @param options 弹框配置，包括位置以及方向
   * @param remarkStatus 备注状态   待插入 = 0, 已插入 = 1, 插入中 = 2, 查看中 = 3,
   * @param text 弹框文本
   * @param operateName 操作人
   */
  show(options: RemarkOptions, remarkStatus: number, text: string = '', operateName: string = '') {
    this._options.value.left = options?.left;
    this._options.value.top = options?.top;
    this._options.value.nodeId = options?.nodeId;
    this._options.value.direction = options?.direction ?? 'right';
    this._remarkStatus.value = remarkStatus;
    this._is_active.value = false;

    if (remarkStatus === RemarkStatus.查看中) {
      this._username.value = operateName;
    } else {
      this._username.value = (FGetCookie('username') as string) ?? '';
    }

    this._remark.value = text;
    this._originRemark.value = text;

    this._visible.value = true;

    // 容器注册点击事件
    const container = document.getElementById('ma-home');
    if (container) {
      container.addEventListener('click', this.containerClick);
    }
  }

  /**
   * 关闭弹框
   */
  close() {
    this._options.value.left = '';
    this._options.value.top = '';
    this._options.value.nodeId = '';

    this._visible.value = false;
  }

  /**
   * 点击空白区域，关闭
   * @param e
   */
  containerClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const popover = document.querySelector('.ma-h-c-comment-popover');
    if (!popover || !popover.contains(e.target as HTMLElement)) {
      this._visible.value = false;

      const container = document.getElementById('ma-home');
      if (container) {
        container.removeEventListener('click', this.containerClick);
      }
    }
  };

  /**
   * 点击插入事件，计算坐标，输入框聚焦
   */
  insert() {
    this._remarkStatus.value = RemarkStatus.插入中;
    this._options.value.left = `${
      Number(this._options.value.left.replace('px', '')) + (this._options.value.direction === 'right' ? 11 : -32)
    }px`;
    this._options.value.top = `${Number(this._options.value.top.replace('px', '')) - 15}px`;

    setTimeout(() => {
      const textarea = document.getElementsByTagName('textarea')[0];
      textarea?.focus();
    }, 200);
  }

  /**
   * 过滤输入框， 过滤特殊字符，
   * @param e  事件对象
   * @returns
   */
  handleInput(e: any) {
    e.stopPropagation();
    if (e.isComposing) {
      return;
    }

    const characters: string = '';
    const defaultStr = String.raw`\`\\;\'\"<>`;
    const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
    this._remark.value = this._remark.value.replace(reg, '');

    // 过滤空格
    this._remark.value = this._remark.value.replace(/\s+/g, '');
  }

  /**
   * 失去焦点，发起请求
   * @returns
   */
  handleBlur() {
    if (this._remark.value === this._originRemark.value) {
      return;
    }

    if (!this._remark.value) {
      if (this._originRemark.value) {
        this._deleteHttp.send(JSON.stringify(this.useParams()));
      }
      this._visible.value = false;
      return;
    }
    // 保存
    if (!this._originRemark.value) {
      this._createHttp.send(JSON.stringify(this.useParams()));
    } else {
      this._editorHttp.send(JSON.stringify(this.useParams()));
    }
    this._visible.value = false;
  }

  mouseOver() {
    this._is_active.value = true;
  }

  mouseLeave() {
    this._visible.value = false;
    this._is_active.value = false;
  }

  /**
   * 删除确认事件
   */
  deleteConfirm() {
    ElMessageBox.confirm('删除备注', '确定删除该备注吗？', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    })
      .then((res) => {
        if (res === 'confirm') {
          this._deleteHttp.send(JSON.stringify(this.useParams()));
        }
      })
      .catch(() => {
        console.warn('取消');
      });
  }
  /**
   * 拼接请求参数
   * @returns
   */
  useParams(): AddRemarkParams {
    const { nodeId } = this._options.value;
    const { queryType, startDate, endDate, durationType } = this._searchParams.value;
    let params: AddRemarkParams = {
      nodeId,
      operateName: this._username.value,
      operateTime: new Date().getTime(),
      ...TOKEN,
      remarks: this._remark.value,
      queryType,
      year: new Date(startDate as string).getFullYear(),
      durationType,
    };
    if (durationType === MA_HOME_EDateType.按月) {
      params = {
        ...params,
        month: new Date(startDate as string).getMonth() + 1,
      };
    }
    return params;
  }
}

export default new CommentPopoverService();
