import { reactive, ref } from 'vue';
import { postRequest } from '@/service/request';

import {
  BM_EMeasureType,
  BM_EVerificationType,
  BM_IQueryByConditionReqParams,
  EBmPath,
} from '../boundary-management.api';
import { BM_IAddManagementForm, mapMeasureTypeList, mapVerificationTypeList } from '../bm-search-bar/bm-search-bar.api';
import { CommonIHttpRes } from '@/service/api';

import { getTenant } from '@/utils';

/**
 * 查询边界规则入参
 */
type BM_IQueryRuleRequestParams = BM_IQueryByConditionReqParams;
/**
 * 过滤类型
 */
interface BM_IFilterTypeVO {
  measureType: string;
  verificationType: string;
  name: string;
}
/**
 * 边界规则响应结果
 */
interface BM_IQueryRuleResponse {
  [key: string]: number | null;
}
// 全部tab的宽度
const ALL_TAB_WIDTH = 28;
// 其他tab的宽度
const NORMAL_TAB_WIDTH = 70;
// tab之间的间距
const TAB_GAP = 40;

class BmRuleTableService {
  //#region 过滤类型列表
  private _filterTypeList = ref<BM_IFilterTypeVO[]>([]);

  private _loading = ref<boolean>(true);

  private _ruleDataList = ref<BM_IQueryRuleResponse>({});

  private searchForm = reactive<BM_IAddManagementForm>({
    hostingPeriod: null,
    measureType: '',
    verificationType: '',
    startTime: '',
    endTime: '',
  });

  private _isEmpty = ref<boolean>(false);

  public get filterTypeList(): BM_IFilterTypeVO[] {
    return this._filterTypeList.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get ruleDataList(): BM_IQueryRuleResponse {
    return this._ruleDataList.value;
  }

  public get isEmpty(): boolean {
    return this._isEmpty.value;
  }
  //#endregion
  /**
   * 组合过滤类型列表
   */
  mapFilterTypeList(params: BM_IAddManagementForm) {
    const measureTypeList = mapMeasureTypeList();
    const verificationTypeList = mapVerificationTypeList();
    this._filterTypeList.value = [];
    // 如果两个选项都为全部或都不为全部时，不生成tab数组
    if (
      (params.verificationType !== '' && params.measureType === '') ||
      (params.verificationType === '' && params.measureType !== '')
    ) {
      // 先生成交叉数组
      measureTypeList.forEach((m) => {
        verificationTypeList.forEach((v) => {
          this._filterTypeList.value.push({
            measureType: m.code,
            verificationType: v.code,
            name: `${m.name}${v.name}`,
          });
        });
      });
      // 按照某个选项不为空进行过滤
      this._filterTypeList.value = this._filterTypeList.value?.filter((item) => {
        return (
          (params.verificationType !== '' && item.verificationType === params.verificationType) ||
          (params.measureType !== '' && item.measureType === params.measureType)
        );
      });
      // 在数组前面插入全部选项，
      this._filterTypeList.value.unshift({
        measureType: params?.measureType,
        verificationType: params?.verificationType,
        name: '全部',
      });
    }
  }
  /**
   * 判断当前tab是否被选中
   * @param measureType
   * @param verificationType
   * @returns boolean
   */
  mapFilterTypeActive(measureType: string, verificationType: string) {
    return measureType === this.searchForm.measureType && verificationType === this.searchForm.verificationType;
  }
  /**
   * 判断是否有tab被选中
   * @returns boolean
   */
  mapSelectVisible() {
    const checkFlag =
      [BM_EMeasureType.挂表, BM_EMeasureType.预估]?.includes(this.searchForm.measureType as BM_EMeasureType) &&
      [BM_EVerificationType.已核定, BM_EVerificationType.未核定]?.includes(
        this.searchForm.verificationType as BM_EVerificationType,
      );
    const notAllFlag =
      (this.searchForm.measureType === '' || this.searchForm.verificationType === '') &&
      (this.searchForm.measureType !== '' || this.searchForm.verificationType !== '');
    return checkFlag || notAllFlag;
  }
  /**
   * 计算高亮横线的位置
   * @returns string
   */
  mapFilterTabLeft() {
    const index = this._filterTypeList.value?.findIndex((item) => {
      return (
        this.searchForm.measureType === item.measureType && this.searchForm.verificationType === item.verificationType
      );
    });
    return `${(index === 0 ? 0 : ALL_TAB_WIDTH) + Math.max(index - 1, 0) * NORMAL_TAB_WIDTH + index * TAB_GAP}px`;
  }
  /**
   * 计算横线宽度
   * @returns
   */
  mapFilterTabWidth() {
    return this.searchForm.measureType === '' || this.searchForm.verificationType === ''
      ? `${ALL_TAB_WIDTH}px`
      : `${NORMAL_TAB_WIDTH}px`;
  }
  /**
   * 查询边界规则
   * @param params
   */
  async queryRuleList(params: BM_IAddManagementForm) {
    this.searchForm = {
      ...this.searchForm,
      ...params,
    };
    this._loading.value = true;
    try {
      const res: CommonIHttpRes<BM_IQueryRuleResponse> = await postRequest(EBmPath.查询边界规则, {
        ...params,
        ...getTenant(),
      });
      if (res?.success && res?.data) {
        this._ruleDataList.value = res?.data ?? {};
        this._isEmpty.value = false;
      } else {
        this._isEmpty.value = true;
      }
    } catch (error) {
      this._isEmpty.value = true;
      console.log('%c✨✨查询边界规则Error✨✨', 'font-size: 24px', error);
    } finally {
      this._loading.value = false;
    }
  }
  /**
   * 选择tab
   * @param measureType
   * @param verificationType
   */
  selectFilterType(measureType: string, verificationType: string) {
    this.searchForm.measureType = measureType;
    this.searchForm.verificationType = verificationType;
    this.queryRuleList(this.searchForm);
  }
}

export default BmRuleTableService;
