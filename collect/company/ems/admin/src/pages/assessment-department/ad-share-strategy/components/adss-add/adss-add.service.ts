import message from '@/utils/message';
import { computed, reactive, ref } from 'vue';
import { At_ITableItem } from '../adss-table/adss-table.api';
import { EnergyTypeItem, RuleItem, StrategyService, StrategyInfo, SourceItem, sourceType } from './adss-add.api';
export class AddService {
  strategyInfo = reactive<StrategyInfo>({
    apportionedName: '',
    apportionedObjectList: [],
    apportionedObjectType: '',
    apportionedStartTime: '',
    apportionedEndTime: '',
    apportionedSources: [],
    energyCode: '',
    apportionedRuleId: '',
    id: 0,
  });
  sourceInit = ref<SourceItem | null>(null);

  isDisabled = computed(() => {
    return (
      this.strategyInfo.apportionedName === '' ||
      this.strategyInfo.energyCode === '' ||
      this.strategyInfo.apportionedStartTime === '' ||
      this.strategyInfo.apportionedStartTime === null ||
      this.strategyInfo.apportionedSources.length === 0 ||
      this.strategyInfo.apportionedRuleId === '' ||
      this.strategyInfo.apportionedObjectList.length === 0
    );
  });

  disabledSure = ref(false);
  actionType = ref('新增');

  // 能源类型
  energyList = ref<EnergyTypeItem[]>([]);

  // 分摊规则
  shareRuleList = ref<RuleItem[]>([]);

  constructor(strategyInfoInit: At_ITableItem | null | undefined, titleAction: string | undefined) {
    this.actionType.value = titleAction || '新增';
    if (this.actionType.value === '查看') {
      this.disabledSure.value = true;
    }
    Promise.all([this.getEnergyList(), this.getRuleList()]).then(() => {
      if (strategyInfoInit) {
        this.strategyInfo.apportionedName = strategyInfoInit.apportionedName ?? '';
        this.strategyInfo.apportionedObjectList = strategyInfoInit.apportionedObjectList ?? [];
        this.strategyInfo.apportionedObjectType = strategyInfoInit.apportionedObjectType ?? '';
        this.strategyInfo.apportionedStartTime = strategyInfoInit.apportionedStartTime ?? '';
        this.strategyInfo.apportionedEndTime = strategyInfoInit.apportionedEndTime ?? '';
        this.strategyInfo.apportionedSources = strategyInfoInit.apportionedSources
          ? strategyInfoInit.apportionedSources.map((item) => {
              return {
                apportionedSourceFormula: item.apportionedSourceFormula ?? '',
                apportionedSourceType: item.apportionedSourceType ?? '',
                apportionedSourceVarList: item.apportionedSourceVarList ?? [],
              };
            })
          : [];
        this.strategyInfo.energyCode = strategyInfoInit.energyCode ?? '';
        this.strategyInfo.apportionedRuleId = strategyInfoInit.apportionedRuleId ?? '';
        this.strategyInfo.id = strategyInfoInit.id ?? 0;
      }
    });
  }

  async getEnergyList() {
    try {
      const res = await StrategyService.getEnergyType();
      if (res?.code === 200) {
        this.energyList.value = res.data;
        this.strategyInfo.energyCode = res.data?.[0]?.code;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

  async getRuleList() {
    try {
      const res = await StrategyService.getShareRule();
      if (res?.code === 200) {
        this.shareRuleList.value = res.data.map((item) => {
          return {
            id: item.id.toString() ?? '',
            name: item.name ?? '',
          };
        });
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

  async addShareSource() {
    try {
      const res = await StrategyService.addShareSource(this.strategyInfo);
      if (res?.code === 200) {
        message.success('新增成功');
        return true;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
        return false;
      }
    } catch (error) {
      console.warn(error);
    }
  }

  async updateShareSource() {
    try {
      const res = await StrategyService.updateShareSource(this.strategyInfo);
      if (res?.code === 200) {
        message.success('编辑成功');
        return true;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
        return false;
      }
    } catch (error) {
      console.warn(error);
    }
  }
}
