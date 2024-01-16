/*
 * @Author: yut
 * @Date: 2023-10-27 10:07:19
 * @LastEditors: yut
 * @LastEditTime: 2024-01-10 14:29:00
 * @Descripttion:
 */
import {
  EPath,
  ESA_EDateType,
  ESA_EFieldType,
  ESA_EStatus,
  type ESA_IDetailInfo,
  type ESA_ISearchParam,
} from './energy-saving-assessment.api';
import esaNormalBg from '../../assets/images/energy-saving-assessment/esa-normal-bg.png';
import esaWarningBg from '../../assets/images/energy-saving-assessment/esa-warn-bg.png';
import esaOverspentBg from '../../assets/images/energy-saving-assessment/esa-overspent-bg.png';
// import esaNormalBg from '../../assets/images/energy-saving-assessment/esa-normal-bg.svg';
// import esaWarningBg from '../../assets/images/energy-saving-assessment/esa-warn-bg.svg';
// import esaOverspentBg from '../../assets/images/energy-saving-assessment/esa-overspent-bg.svg';

import esaNormalTagBg from '../../assets/images/energy-saving-assessment/esa-normal-tag.svg';
import esaWarningTagBg from '../../assets/images/energy-saving-assessment/esa-warn-tag.svg';
import esaOverspentTagBg from '../../assets/images/energy-saving-assessment/esa-overspent-tag.svg';

import esaNormalHeaderBg from '../../assets/images/energy-saving-assessment/esa-normal-header.svg';
import esaWarningHeaderBg from '../../assets/images/energy-saving-assessment/esa-warn-header.svg';
import esaOverspentHeaderBg from '../../assets/images/energy-saving-assessment/esa-overspent-header.svg';
import { ref } from 'vue';
import type { Common_IHttpResponseImpl } from '@/api/model';
import { commonHttp } from '@/api/request';
import { startOfYear, startOfMonth } from 'date-fns';
import { formatDate } from '@/utils';
import { usePageErrorController } from '../../hook/index';

const { mapPageLoadError, handleErrorCode } = usePageErrorController();
class EnergySavingAssessmentService {
  public get loadError() {
    return mapPageLoadError();
  }

  private _detailInfo = ref<ESA_IDetailInfo>();
  public get detailInfo() {
    return this._detailInfo.value;
  }

  private _searchParam = ref<ESA_ISearchParam>({
    quotaType: '',
    quotaTime: '',
    treeId: '',
    energyCode: '',
  });
  public get searchParam() {
    return this._searchParam.value;
  }
  public set searchParam(val) {
    this._searchParam.value = val;
  }

  private _fieldType = ref(ESA_EFieldType.本月);
  public get fieldType() {
    return this._fieldType.value;
  }
  public set fieldType(val) {
    this._fieldType.value = val;
  }

  /**
   * 获取详情数据
   */
  getDetailData = async () => {
    try {
      const format = 'yyyy-MM-dd';
      if (this._searchParam.value.quotaType === ESA_EDateType.本年) {
        this._searchParam.value.quotaTime = formatDate(
          startOfYear(new Date(this._searchParam.value.quotaTime)),
          format,
        );
      } else {
        this._searchParam.value.quotaTime = formatDate(
          startOfMonth(new Date(this._searchParam.value.quotaTime)),
          format,
        );
      }
      const res: Common_IHttpResponseImpl<ESA_IDetailInfo> = await commonHttp.post(
        EPath.查询详细信息,
        this._searchParam.value,
      );
      if (res.code === 200 && res.data && res.success) {
        this._detailInfo.value = res.data;
      } else {
        this._detailInfo.value = undefined;
      }
    } catch (error) {
      this._detailInfo.value = undefined;
      handleErrorCode((error as any).errcode);
      console.log('%c🚀 ~ energy-saving-assessment.service.ts ~ 110行', 'font-size: 18px', mapPageLoadError());
    } finally {
    }
  };

  /**
   * 根据状态获取对应的背景图
   * @param status
   * @returns
   */
  mapBackgroundImageByEnergyCode = (status: string) => {
    let bgImage = esaNormalBg;
    let tabImage = esaNormalTagBg;
    let headImage = esaNormalTagBg;
    switch (status) {
      case ESA_EStatus.盈余:
        bgImage = esaNormalBg;
        tabImage = esaNormalTagBg;
        headImage = esaNormalHeaderBg;
        break;
      case ESA_EStatus.警告:
        bgImage = esaWarningBg;
        tabImage = esaWarningTagBg;
        headImage = esaWarningHeaderBg;
        break;
      case ESA_EStatus.超支:
        bgImage = esaOverspentBg;
        tabImage = esaOverspentTagBg;
        headImage = esaOverspentHeaderBg;
        break;
      default:
        bgImage = esaNormalBg;
        tabImage = esaNormalTagBg;
        headImage = esaNormalHeaderBg;

        break;
    }
    return {
      bgImage: `url(${bgImage})`,
      tabImage: `url(${tabImage})`,
      headImage: `url(${headImage})`,
    };
  };

  /**
   * 获取时间选择范围
   * @param type
   * @returns
   */
  getDate = (type: string = ESA_EDateType.本月) => {
    console.log('%c🚀 ~ energy-saving-assessment.service.ts ~ 105行', 'font-size: 18px', type);
    const date = new Date();
    let year = date.getFullYear();
    let month: number | string = date.getMonth() + 1;
    month = month > 9 ? month : '0' + month;
    return type === ESA_EDateType.本月 ? `${year}-${month}` : `${year}`;
  };

  private _date = ref('');
  public get date() {
    return this._date.value;
  }
  public set date(val) {
    this._date.value = val;
  }

  constructor() {}
}

export default new EnergySavingAssessmentService();
