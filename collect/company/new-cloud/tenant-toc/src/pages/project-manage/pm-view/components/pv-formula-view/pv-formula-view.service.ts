// 公共库
import { reactive, nextTick, ref } from 'vue';
// 实例
import { Condition } from '@/pages/project-manage/pm-formula-editor/entity/condition';
// 接口
import { CommonIHttpRes } from '@/service/api';
import {
  PFE_IGroupConfigInfoResponse,
  PFE_IGroupInfoList,
  PFE_IIndexVO,
} from '@/pages/project-manage/pm-formula-editor/pm-formula-editor.api';
// 枚举
import { PFE_EFixedType, PFE_EPath, PFE_ESymbolType } from '@/pages/project-manage/pm-formula-editor/enums';
// 工具方法
import { postRequest } from '@/service/request';
import { getTenant } from '@/utils';
// store
import store from '../../../../../store/index';
// 常量
import { PFE_INDEX_TYPE_MAP } from '@/pages/project-manage/pm-formula-editor/constant';
/**
 * 收益分享数据服务
 */
class FormulaViewService {
  // loading
  public loading: boolean = false;
  //  条件组
  public groupList: PFE_IGroupInfoList[] = [];
  // 维护数据-指标列表
  public serviceDataIndexList: PFE_IIndexVO[] = [];
  // 条件组编号
  public formulaSerialNumber: string = '';
  // 高度
  public size = ref<string>('1%');

  constructor() {
    this.groupList = [];
    this.serviceDataIndexList = [];
    this.formulaSerialNumber = '';
  }
  /**
   * 查询条件组
   * @returns {Promise<void>}
   */
  public async queryGroup(): Promise<void> {
    this.groupList = [];
    this.serviceDataIndexList = [];
    this.loading = true;
    try {
      const { tenantId } = getTenant();
      const incomeShareObject = store.getters.grainSharingMode;
      const res: CommonIHttpRes<PFE_IGroupConfigInfoResponse> = await postRequest(
        PFE_EPath.查询公式组信息与指标配置信息,
        {
          tenantId,
          incomeShareObject,
        },
      );
      if (res?.success) {
        this.convertServiceData(res?.data);
        this.convertGroupList(res?.data);
        this.formulaSerialNumber = res?.data?.formulaSerialNumber ?? '';
      }
    } catch (error) {
      this.formulaSerialNumber = '';
      this.groupList = [];
      this.serviceDataIndexList = [];
    } finally {
      this.loading = false;
      nextTick(() => {
        this.mapContainerHeight();
      });
    }
  }
  /**
   * 接口数据转维护数据
   * @param data 响应结果
   * @returns {void}
   */
  private convertServiceData(data: PFE_IGroupConfigInfoResponse): void {
    this.serviceDataIndexList = data?.indexInfoList?.map((item, index) => {
      return {
        id: `prefix${index}`,
        indexName: item?.indexName ?? '',
        serialNumber: item?.serialNumber ?? '',
        indexType: (item?.indexType as PFE_ESymbolType) ?? '',
        selectFlag: item?.selectFlag ?? false,
        fixed: PFE_EFixedType.非内置,
        formulaComponentList:
          item?.formulaComponentList?.map((formula, fIndex) => {
            return {
              id: `prefix${fIndex}`,
              indexName: formula?.indexName ?? '',
              serialNumber: formula?.serialNumber ?? '',
              indexType: this.mapIndexType(formula?.indexType, formula?.serialNumber),
              fixed: PFE_EFixedType.非内置,
            };
          }) ?? [],
      };
    });
  }
  /**
   * 处理条件组
   * @param data 响应结果
   * @returns {void}
   */
  private convertGroupList(data: PFE_IGroupConfigInfoResponse): void {
    this.groupList = [];

    this.groupList = data?.groupInfoList?.map((item) => {
      const { groupId, startPeriod, endPeriod } = item;
      const formulaList = item?.formulaList?.map((formula, fIndex) => {
        const { indexName, serialNumber, logicalType } = formula;
        const condition = new Condition();
        condition.id = `prefix${fIndex}`;
        condition.indexName = formula?.indexName ?? '';
        condition.serialNumber = formula?.serialNumber ?? '';
        condition.logicalType = formula?.logicalType ?? '';
        const conditionList = formula?.conditionList?.map((c, cIndex) => {
          // 判断条件
          const conditionFormulaComponentList = c?.conditionFormulaComponentList?.map((child, childIndex) => {
            return {
              id: `prefix${childIndex}`,
              indexName: child?.indexName ?? '',
              serialNumber: child?.serialNumber ?? '',
              indexType: this.mapIndexType(child?.indexType, child?.serialNumber),
              fixed: PFE_EFixedType.非内置,
            };
          });
          return {
            conditionFormulaComponentList,
          };
        });
        // 公式
        const formulaComponentList = formula?.formulaComponentList?.map((c, cIndex) => {
          return {
            id: `prefix${cIndex}`,
            indexName: c?.indexName ?? '',
            serialNumber: c?.serialNumber ?? '',
            indexType: this.mapIndexType(c?.indexType, c?.serialNumber),
            fixed: PFE_EFixedType.非内置,
          };
        });

        return { indexName, serialNumber, logicalType, conditionList, formulaComponentList };
      });
      return {
        groupId,
        startPeriod,
        endPeriod,
        formulaList,
      };
    });
  }
  /**
   * 转换指标类型
   * @param {string} indexType 指标类型
   * @param {string} serialNumber 指标唯一标识
   */
  private mapIndexType = (indexType: string, serialNumber: string): PFE_ESymbolType => {
    return indexType === null
      ? (PFE_INDEX_TYPE_MAP.get(serialNumber) as PFE_ESymbolType)
      : (indexType as PFE_ESymbolType);
  };
  /**
   * 计算容器高度
   */
  private mapContainerHeight = () => {
    // 容器高度
    const containerH = document.body.clientHeight;
    // 抽屉高度
    const target = document.querySelector('.pv-formula-view') as HTMLElement;
    if (target && containerH) {
      const currentH = target.clientHeight + 40 + 74 + 16;
      this.size.value = containerH <= currentH ? '100%' : `${currentH}px`;
    } else {
      this.size.value = '100%';
    }
  };
}
// 实例化
const formulaView = reactive(new FormulaViewService());

export default formulaView;
