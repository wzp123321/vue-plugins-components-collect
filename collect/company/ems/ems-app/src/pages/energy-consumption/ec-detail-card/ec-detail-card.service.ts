/*
 * @Author: yut
 * @Date: 2023-12-28 10:54:54
 * @LastEditors: yut
 * @LastEditTime: 2023-12-29 11:06:18
 * @Descripttion: 
 */
import type { Common_ICodeName } from '@/api/model';
import { ref } from 'vue';

class EcsDetailCardService {
  //标签列表
  private _tagList = ref<Common_ICodeName<string>[]>();
  public get tagList() {
    return this._tagList.value;
  }

  //当前选中的标签
  private _tagCode = ref('');
  public get tagCode() {
    return this._tagCode.value;
  }
  public set tagCode(val) {
    this._tagCode.value = val;
  }

  public convert = (data: { itemId: string; itemName: string }[]): Common_ICodeName<string>[] => {
    return data.map((item) => {
      return {
        code: item.itemId,
        name: item.itemName,
      };
    });
  };

  /**
   * 获取当月
   * @returns
   */
  getDate = () => {
    const date = new Date();
    let year = date.getFullYear();
    let month: number | string = date.getMonth() + 1;
    month = month > 9 ? month : '0' + month;
    return `${year}-${month}`;
  };

  constructor() {}
}

export default new EcsDetailCardService();
