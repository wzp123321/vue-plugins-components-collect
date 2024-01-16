import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { postRequest } from '@/services/request';
import message from '@/utils/message';

enum EPath {
  查询节点层级 = '/admin/abnormal/queryTreeLevel',
  编辑节点层级 = '/admin/abnormal/updateTreeLevel',
}

class CalculateNodeLevelService {
  //#region
  private _nodeLevel = ref<string>('');

  private originValue = '';

  public get nodeLevel(): string {
    return this._nodeLevel.value;
  }
  public set nodeLevel(value: string) {
    this._nodeLevel.value = value;
  }
  //#endregion
  constructor() {
    this.query();
  }

  async query() {
    try {
      const res = await postRequest(EPath.查询节点层级);
      this._nodeLevel.value = res?.data ?? '';
      this.originValue = cloneDeep(this._nodeLevel.value);
    } catch (error) {
      console.log('%c✨✨查询节点层级失败✨✨', 'font-size: 24px', error);
    }
  }

  public mapMinusDisabled() {
    return this._nodeLevel.value === '' || Number(this._nodeLevel.value) <= 4;
  }
  public mapPlusDisabled() {
    return this._nodeLevel.value === '' || Number(this._nodeLevel.value) >= 10;
  }

  public add() {
    if (this.mapPlusDisabled()) {
      return;
    }
    this._nodeLevel.value = String(Number(this._nodeLevel.value) + 1);
    this.handleLevelChange();
  }

  public minus() {
    if (this.mapMinusDisabled()) {
      return;
    }
    this._nodeLevel.value = String(Number(this._nodeLevel.value) - 1);
    this.handleLevelChange();
  }

  handleInput = (event: InputEvent) => {
    // 是否在剪切板
    if (event.isComposing) {
      return;
    }
    const inputEle = event.target as HTMLInputElement;
    inputEle.value = inputEle.value.replace(/\D+/g, '');
    inputEle.value = inputEle.value.substring(0, 2);
    if (Number(inputEle.value) > 10) {
      inputEle.value = '10';
    }
    if (inputEle.value !== '' && Number(inputEle.value) <= 4) {
      inputEle.value = '4';
    }
    this._nodeLevel.value = inputEle.value === '' ? '' : inputEle.value;
  };

  handleLevelChange = async () => {
    try {
      if (this.originValue === this._nodeLevel.value) {
        return;
      }
      const res = await postRequest(EPath.编辑节点层级, {
        value: this._nodeLevel.value !== '' && this._nodeLevel.value !== null ? this._nodeLevel.value : '',
      });
      if (res?.data) {
        this.originValue = cloneDeep(this._nodeLevel.value);
        message.success(res?.message ?? '操作成功');
      } else {
        message.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      console.log(error);
      message.error('操作失败');
    }
  };
}

export default CalculateNodeLevelService;
