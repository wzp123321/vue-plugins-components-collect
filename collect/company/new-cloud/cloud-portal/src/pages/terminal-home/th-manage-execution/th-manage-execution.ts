import { defineComponent, reactive } from 'vue';
import { TH_FOpenTag } from '../services/services';
import dayjs from 'dayjs';

import { ManageExecutionService } from './th-manage-execution.service';
import InofService from '../services/th-info.service';

export default defineComponent({
  name: 'ManageaExecutionComponent',
  setup() {
    //#region 模块私有服务
    const service = reactive(new ManageExecutionService());
    service.query();
    //#endregion

    //#region 基本信息服务
    const sInfo = reactive(InofService);
    //#endregion

    return { service, sInfo };
  },
  computed: {
    date: function (): string {
      return dayjs(this.sInfo.time).format('YYYY年M月');
    },
    lastMonth: function (): number[] {
      const month = new Date(this.sInfo.time.getFullYear(), this.sInfo.time.getMonth(), 0);
      return Array.from({ length: month.getDay() }, (v, k) => month.getDate() - k).reverse();
    },
    currentMonth: function (): number[] {
      const month = new Date(this.sInfo.time.getFullYear(), this.sInfo.time.getMonth() + 1, 0);
      return Array.from({ length: month.getDate() }, (v, k) => k + 1);
    },
    nextMonth: function (): number[] {
      return Array.from({ length: 42 - this.lastMonth.length - this.currentMonth.length }, (v, k) => k + 1);
    },
  },
  methods: {
    jumpToWorkRecord: function (): void {
      if (!this.service.tag) {
        return;
      }

      TH_FOpenTag(this.service.tag);
    },

    mapScoreRank: function (date: number): string | undefined {
      const score = this.service.getScore(date);

      if (score == undefined) {
        return;
      }

      if (score < 60) {
        if (score === this.service.min) {
          return 'low min';
        }
        return 'low';
      }
      if (score < 90) {
        return 'middle';
      }
      if (score === this.service.max) {
        return 'high max';
      }
      return 'high';
    },
  },
});
