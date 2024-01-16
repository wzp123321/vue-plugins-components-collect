import { defineComponent, reactive } from 'vue';
import { TH_FOpenTag } from '../services/services';
import { ProjectDetailService } from './th-project-detail.service';

export default defineComponent({
  name: 'ProjectDetailComponent',
  setup() {
    //#region 模块私有服务
    const service = reactive(new ProjectDetailService());
    service.query();
    //#endregion

    return { service };
  },
  methods: {
    jumpToProjectInfo: function (): void {
      if (!this.service.tag) {
        return;
      }

      TH_FOpenTag(this.service.tag);
    },
  },
});
