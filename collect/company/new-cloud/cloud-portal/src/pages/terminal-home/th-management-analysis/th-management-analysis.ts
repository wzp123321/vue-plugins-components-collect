import { defineComponent, reactive } from 'vue';
import { TH_FOpenTag } from '../services/services';
import { TH_MA_EClassification, TH_MA_IClassification } from './th-management-analysis.api';
import { ManagementAnalysisService } from './th-management-analysis.service';

export default defineComponent({
  name: 'ManagementAnalysisComponent',
  setup() {
    //#region 模块私有服务
    const service = reactive(new ManagementAnalysisService());
    service.query();
    //#endregion

    return { service };
  },
  methods: {
    jumpToManagementAnalysis: function (): void {
      if (!this.service.tag) {
        return;
      }

      TH_FOpenTag(this.service.tag);
    },

    mapClassificationIcon: (code: string): string | undefined => {
      switch (code) {
        case TH_MA_EClassification.电:
          return 'icon-dian';
        case TH_MA_EClassification.水:
          return 'icon-shui';
        case TH_MA_EClassification.燃气:
          return 'icon-ranqi';
        case TH_MA_EClassification.蒸汽:
          return 'icon-zhengqi';
        default:
          break;
      }
    },

    mapClassificationBar: (item: TH_MA_IClassification): string | undefined => {
      if (!item.code || item.value == null) {
        return;
      }

      if (item.benchmark != null && item.value > item.benchmark) {
        return 'alarm';
      }

      switch (item.code) {
        case TH_MA_EClassification.电:
          return 'blue';
        case TH_MA_EClassification.水:
          return 'green';
        case TH_MA_EClassification.燃气:
          return 'yellow';
        case TH_MA_EClassification.蒸汽:
          return 'red';
        default:
          break;
      }
    },

    mapBarWidth: (item: TH_MA_IClassification): string | undefined => {
      if (item.value == null || item.benchmark == null) {
        return;
      }

      const ratio = item.value / item.benchmark;
      return `${(ratio > 1 ? 1 : ratio) * 100}%`;
    },
  },
});
