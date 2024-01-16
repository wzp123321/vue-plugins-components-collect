import { ref, nextTick } from 'vue';
import { postRequest } from '@/services/request';
import { Common_ICodeName } from '../../../../services/common/common-api';
import { Daar_IDataSignVO, Daar_IColorEditStore } from './daar-data-sign.api';
import message from '@/utils/message';

enum EPath {
  查询颜色字典 = '/dict/query',
  查询数据 = '/admin/data/color/config/queryAll',
  修改颜色 = '/admin/data/color/config/update',
}

class DataSignService {
  //#region
  private _loading = ref<boolean>(true);

  private _editing = ref<boolean>(false);

  private _colorDic = ref<Common_ICodeName[]>([]);

  private _dataSource = ref<Daar_IDataSignVO[]>([]);

  private _editStore = ref<Daar_IColorEditStore>({
    id: -1,
    colorCode: '',
    colorName: '',
  });

  public get loading(): boolean {
    return this._loading.value;
  }

  public get editing(): boolean {
    return this._editing.value;
  }

  public get colorDic(): Common_ICodeName[] {
    return this._colorDic.value;
  }

  public get dataSource(): Daar_IDataSignVO[] {
    return this._dataSource.value;
  }

  public get editStore(): Daar_IColorEditStore {
    return this._editStore.value;
  }
  //#endregion
  constructor() {
    this.query();
    this.queryDic();
  }

  async queryDic() {
    try {
      const res = await postRequest(EPath.查询颜色字典, 'color');
      if (res?.data?.length) {
        this._colorDic.value = res?.data ?? [];
      } else {
        this._colorDic.value = [];
      }
    } catch (error) {
      this._colorDic.value = [];
    }
  }

  async query() {
    try {
      this._loading.value = true;
      const res = await postRequest(EPath.查询数据);
      if (res?.data?.length) {
        this._dataSource.value = res?.data ?? [];
      } else {
        this._dataSource.value = [];
      }
    } catch (error) {
      this._dataSource.value = [];
    } finally {
      this._loading.value = false;
    }
  }

  handleBeEdit(id: number, colorCode: string, colorName: string) {
    // 点击的是非当前单元格
    if (this._editStore.value.id !== -1 && this._editStore.value.id !== id) {
      this.handleEditSubmit();
    }

    this._editStore.value.id = id;
    this._editStore.value.colorCode = colorCode;
    this._editStore.value.colorName = colorName;

    window.addEventListener('click', this.handleBlankClick);
  }

  handleColorChange = (value: string) => {
    this._editStore.value.colorCode = value;
    this._colorDic.value.forEach((item) => {
      if (item.code === this._editStore.value.colorCode) {
        this._editStore.value.colorName = item.name;
      }
    });
  };

  async handleEditSubmit() {
    if (this._editing.value) {
      return;
    }
    try {
      this._editing.value = true;
      const res = await postRequest(EPath.修改颜色, this._editStore.value);
      if (res?.data) {
        message.success(res?.message ?? '操作成功');
        this._editStore.value.id = -1;
        this.query();

        window.removeEventListener('click', this.handleBlankClick);
      } else {
        message.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      this._editing.value = false;
    }
  }

  // 点击空白处
  handleBlankClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    if (this._editing.value) {
      return;
    }
    nextTick(() => {
      const eidtingEle = document.querySelector('.color-editing');
      if (eidtingEle && !eidtingEle?.contains(e.target as HTMLElement)) {
        console.log('%c✨✨点击空白处触发保存✨✨', 'font-size: 24px', this._editStore.value);
        this.handleEditSubmit();
      }
    });
  };
}

export default DataSignService;
