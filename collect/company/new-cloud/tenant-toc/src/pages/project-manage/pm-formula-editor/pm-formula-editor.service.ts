// 公共库
import { reactive } from 'vue';
// 实例
import { ConditionGroup } from './entity/conditionGroup';
import { Condition } from './entity/condition';
// 接口
import { ConditionGroupClass, PFE_IGroupConfigInfoResponse, PFE_IIndexVO } from './pm-formula-editor.api';
import { CommonIHttpRes, Common_IValueLabel } from '@/service/api';
// 枚举
import { PFE_EFixedType, PFE_EPath, PFE_ESymbolType } from './enums';
// 工具方法
import { postRequest } from '@/service/request';
import { getTenant } from '@/utils';
import { cloneDeep } from 'lodash';
// store
import store from '../../../store/index';
// 常量
import { PFE_CHECK_TYPES, PFE_INDEX_TYPE_MAP } from './constant';

/**
 * 收益分享数据服务
 */
class FormulaEditorService {
  // loading
  public loading: boolean = false;
  //  条件组
  public groupList: ConditionGroupClass[] = [];
  // 维护数据-指标列表
  public serviceDataIndexList: PFE_IIndexVO[] = [];
  // 条件组编号
  public formulaSerialNumber: string = '';
  // 公共编辑的指标
  public quoteCalculateIndexList: PFE_IIndexVO[] = [];
  // 每个指标在公式中的数量
  public indexCountMap: Map<string, number> = new Map();

  constructor() {
    this.groupList = [];
    this.serviceDataIndexList = [];
    this.formulaSerialNumber = '';
    this.quoteCalculateIndexList = [];
    this.indexCountMap = new Map();
  }
  /**
   * 查询条件组
   * @returns {Promise<void>}
   */
  public async queryGroup(): Promise<void> {
    this.indexCountMap = new Map();
    this.loading = true;
    try {
      const { tenantId } = getTenant();
      // 收益分享类型
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
        this.convertQuoteCalculateIndexList(res?.data);
        this.convertIndexCountMap();
      } else {
        this.groupList = [];
        this.serviceDataIndexList = [];
      }
    } catch (error) {
      this.formulaSerialNumber = '';
      this.groupList = [];
      this.serviceDataIndexList = [];
      this.indexCountMap = new Map();
    } finally {
      this.loading = false;
    }
  }
  /**
   * 接口数据转维护数据
   * @param {PFE_IGroupConfigInfoResponse} data 响应结果
   * @returns {void}
   */
  private convertServiceData(data: PFE_IGroupConfigInfoResponse): void {
    this.serviceDataIndexList =
      data?.indexInfoList?.map((item, index) => {
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
      }) ?? [];
  }
  /**
   * 处理条件组
   * @param {PFE_IGroupConfigInfoResponse} data 响应结果
   * @returns {void}
   */
  private convertGroupList(data: PFE_IGroupConfigInfoResponse): void {
    this.groupList = [];
    // 托管周期列表
    const hostingPeriodList = store.getters?.hostingPeriodList ?? [];
    // 判断是否存在
    const checkExist = (id?: number) => {
      return hostingPeriodList?.findIndex((item: Common_IValueLabel<number>) => !!id && item.value === id) !== -1;
    };

    data?.groupInfoList?.forEach((item) => {
      const group = new ConditionGroup();
      group.groupId = cloneDeep(item?.groupId);
      // 开始结束托管周期需要判断是否在列表中
      group.startPeriod = checkExist(item?.startPeriod) ? cloneDeep(item?.startPeriod) : null;
      group.endPeriod = checkExist(item?.endPeriod) ? cloneDeep(item?.endPeriod) : null;

      group.conditionList = item?.formulaList?.map((formula, fIndex) => {
        const condition = new Condition();
        condition.id = `prefix${fIndex}`;
        condition.indexName = formula?.indexName ?? '';
        condition.serialNumber = formula?.serialNumber ?? '';
        condition.logicalType = formula?.logicalType ?? '';
        condition.judgementConditions = formula?.conditionList?.map((c, cIndex) => {
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
        condition.computationalFormulas = formula?.formulaComponentList?.map((c, cIndex) => {
          return {
            id: `prefix${cIndex}`,
            indexName: c?.indexName ?? '',
            serialNumber: c?.serialNumber ?? '',
            indexType: this.mapIndexType(c?.indexType, c?.serialNumber),
            fixed: PFE_EFixedType.非内置,
          };
        });

        return condition;
      });
      console.log('%c✨✨查询数据组装✨✨', 'font-size: 24px', group);
      this.groupList.push(group);
    });
  }
  /**
   * 处理其他模式公共维护的指标
   * @param {PFE_IGroupConfigInfoResponse} data 响应结果
   * @returns {void}
   */
  private convertQuoteCalculateIndexList(data: PFE_IGroupConfigInfoResponse): void {
    this.quoteCalculateIndexList =
      data?.quoteCalculateIndexList?.map((item, index) => {
        return {
          id: `prefix${index}`,
          indexName: item?.indexName ?? '',
          serialNumber: item?.serialNumber ?? '',
          indexType: (item?.indexType as PFE_ESymbolType) ?? '',
          selectFlag: false,
          fixed: PFE_EFixedType.非内置,
        };
      }) ?? [];
  }
  /**
   * 记录每个指标的数量
   * @returns {void}
   */
  public convertIndexCountMap(): void {
    this.indexCountMap = new Map();
    const checkList = (list: PFE_IIndexVO[]) => {
      if (list?.length > 0) {
        list?.forEach((item) => {
          if (PFE_CHECK_TYPES?.includes(item.indexType as PFE_ESymbolType)) {
            const count = this.indexCountMap.has(item.serialNumber)
              ? this.indexCountMap.get(item.serialNumber) ?? 0
              : 0;
            this.indexCountMap.set(item.serialNumber, count + 1);
          }
        });
      }
    };

    // 维护数据中的公式
    this.serviceDataIndexList?.forEach((item) => {
      if (item?.formulaComponentList?.length) {
        checkList(item?.formulaComponentList);
      }
    });
    // 条件组
    this.groupList?.forEach((item) => {
      if (item?.conditionList?.length) {
        item?.conditionList?.forEach((formula) => {
          checkList(formula?.computationalFormulas);

          formula?.judgementConditions?.forEach((formulaComponent) => {
            checkList(formulaComponent?.conditionFormulaComponentList ?? []);
          });
        });
      }
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
   * 新增条件组
   * @returns {void}
   */
  public addGroup(): void {
    console.log('%c✨✨新增条件组✨✨', 'font-size: 24px');
    const group = new ConditionGroup();
    this.groupList.push(group);
    // 修改保存状态
    store.dispatch('setUnSaveFlag', true);
  }
  /**
   * 复制条件组，重新计算map
   * @param {ConditionGroupClass} group 条件组
   * @param {number} index 索引
   * @returns {void}
   */
  public copyGroup(group: ConditionGroupClass, index: number): void {
    const instance = new ConditionGroup(group);
    console.log('%c✨✨复制条件组✨✨', 'font-size: 24px', group, index, instance);
    this.groupList.splice(index + 1, 0, instance);
    // 遍历条件组
    group.conditionList.forEach((item) => {
      // 公式
      item?.computationalFormulas?.forEach((computational) => {
        this.addIndexInFormula(computational.serialNumber, computational.indexType);
      });
      // 判断条件
      item?.judgementConditions?.forEach((judgement) => {
        judgement?.conditionFormulaComponentList?.forEach((conditionFormula) => {
          this.addIndexInFormula(conditionFormula.serialNumber, conditionFormula.indexType);
        });
      });
    });
    // 修改保存状态
    store.dispatch('setUnSaveFlag', true);
  }
  /**
   * 删除某一个条件组
   * @param {number} index 索引
   * @returns {void}
   */
  public deleteGroup(index: number): void {
    const group = this.groupList[index];
    console.log('%c✨✨删除某一个条件组✨✨', 'font-size: 24px', index);
    this.groupList.splice(index, 1);
    // 遍历条件组
    group.conditionList.forEach((item) => {
      // 公式
      item?.computationalFormulas?.forEach((computational) => {
        this.removeIndexInFormula(computational.serialNumber, computational.indexType);
      });
      // 判断条件
      item?.judgementConditions?.forEach((judgement) => {
        judgement?.conditionFormulaComponentList?.forEach((conditionFormula) => {
          this.removeIndexInFormula(conditionFormula.serialNumber, conditionFormula.indexType);
        });
      });
    });
    // 修改保存状态
    store.dispatch('setUnSaveFlag', true);
  }
  /**
   * 添加可配置公式的指标
   * @param {PFE_IIndexVO} indexVO 指标
   * @returns {void}
   */
  public addServiceDataIndex(indexVO: PFE_IIndexVO): void {
    console.log('%c✨✨添加可配置公式的指标✨✨', 'font-size: 24px', indexVO);
    this.serviceDataIndexList.push(indexVO);
  }
  /**
   * 根据id更新指标名称
   * @param {string} serialNumber 指标唯一标识
   * @param {string} indexName 指标名称
   * @returns {void}
   */
  public updateIndexNameAfterEdit(serialNumber: string, indexName: string): void {
    console.log('%c✨✨根据id更新指标名称✨✨', 'font-size: 24px', serialNumber, indexName);
    // 更新条件组
    this.groupList = this.groupList?.map((group) => {
      // 遍历条件组
      group.conditionList = group.conditionList?.map((condition) => {
        // 公式列表
        condition.computationalFormulas = condition?.computationalFormulas?.map((computational) => {
          if (computational.serialNumber === serialNumber) {
            computational.indexName = indexName;
          }
          return computational;
        });
        // 判断条件列表
        condition.judgementConditions = condition?.judgementConditions?.map((judgement) => {
          judgement.conditionFormulaComponentList = judgement?.conditionFormulaComponentList?.map((item) => {
            if (item.serialNumber === serialNumber) {
              item.indexName = indexName;
            }
            return item;
          });
          return judgement;
        });
        return condition;
      });
      return group;
    });
    // 更新指标
    this.serviceDataIndexList = this.serviceDataIndexList?.map((serviceData) => {
      if (serviceData.serialNumber == serialNumber) {
        serviceData.indexName = indexName;
      }
      serviceData.formulaComponentList = serviceData?.formulaComponentList?.map((formulaComponent) => {
        if (formulaComponent.serialNumber == serialNumber) {
          formulaComponent.indexName = indexName;
        }
        return formulaComponent;
      });
      return serviceData;
    });
  }
  /**
   * 校验是否需要移除维护数据中的指标，只有其他模式没有该指标且该指标在所有的公式中都不存在
   * @param {string} serialNumber 指标唯一标识
   * @param {PFE_ESymbolType} indexType 指标类型
   * @returns {void}
   */
  public removeIndexInFormula(serialNumber: string, indexType: PFE_ESymbolType): void {
    // 修改保存状态
    store.dispatch('setUnSaveFlag', true);

    // 只有定值或者计算指标需要处理
    if (!PFE_CHECK_TYPES.includes(indexType)) {
      return;
    }
    console.log('%c✨✨删除公式中的指标✨✨', 'font-size: 24px', serialNumber, indexType, this.indexCountMap);
    if (this.indexCountMap.has(serialNumber)) {
      const count = this.indexCountMap.get(serialNumber) as number;
      this.indexCountMap.set(serialNumber, count - 1);

      // 如果所有公式中这个指标只有一个且其他模式（quoteCalculateIndexList）中没有维护这个指标
      if (
        count === 1 &&
        (this.quoteCalculateIndexList?.length === 0 ||
          (this.quoteCalculateIndexList?.length > 0 &&
            this.quoteCalculateIndexList?.findIndex((item) => item.serialNumber === serialNumber) !== -1))
      ) {
        // 如果是定值，可以直接删除
        if (indexType === PFE_ESymbolType.定值) {
          this.serviceDataIndexList = this.serviceDataIndexList.filter((item) => item.serialNumber !== serialNumber);
        } else {
          // 如果是运算指标，需要将配置的公式中的指标先删除
          const index = this.serviceDataIndexList.findIndex((item) => item.serialNumber === serialNumber);
          if (index !== -1) {
            const target = cloneDeep(this.serviceDataIndexList[index]?.formulaComponentList) as PFE_IIndexVO[];
            // 先删除自身
            this.serviceDataIndexList.splice(index, 1);
            // 在处理指标配置的公式
            target?.forEach((item) => {
              this.removeIndexInFormula(item.serialNumber, item.indexType);
            });
          }
        }
        // 拿到当前指标，还需要判断当前指标是否是配了公式
        this.indexCountMap.delete(serialNumber);
      }
    }
  }
  /**
   * 公式中新增指标，修改map
   * @param {string} serialNumber 指标唯一标识
   * @param {PFE_ESymbolType} indexType 指标类型
   * @returns {void}
   */
  public addIndexInFormula(serialNumber: string, indexType: PFE_ESymbolType): void {
    if (PFE_CHECK_TYPES.includes(indexType)) {
      const count = this.indexCountMap.get(serialNumber) ?? 0;
      this.indexCountMap.set(serialNumber, count + 1);
      console.log('%c✨✨公式中新增指标✨✨', 'font-size: 24px', count, this.indexCountMap);
    }
  }
}
// 实例化
const draggableFormulaService = reactive(new FormulaEditorService());

export default draggableFormulaService;
