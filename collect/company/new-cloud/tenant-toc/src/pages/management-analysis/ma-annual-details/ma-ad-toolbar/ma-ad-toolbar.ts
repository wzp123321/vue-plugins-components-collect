import { defineComponent, reactive, ref } from 'vue';
import { default as mitt } from '@/core/eventbus';
import ToolbarExceptionComponent from './ma-ad-toolbar-exception/ma-ad-toolbar-exception.vue';
import FileService from '../services/ma-ad-file.service';

export default defineComponent({
  name: 'ToolbarComponent',
  components: {
    'ma-ad-toolbar-exception': ToolbarExceptionComponent,
  },
  setup() {
    //#region 文件服务
    const sFile = reactive(FileService);
    //#endregion

    return { sFile };
  },
  methods: {
    /**
     * 异常弹窗关闭时清空对应数据
     */
    clearExceptions: function (): void {
      this.sFile.clear();
    },
    /**
     * 下载模板
     */
    downloadTemplate: async function (): Promise<void> {
      if (this.sFile.isDownloading) {
        return;
      }

      await this.sFile.download();
    },
    /**
     * 导入模板数据
     */
    importTemplate: async function (): Promise<void> {
      if (this.sFile.isImporting) {
        return;
      }

      if (await this.sFile.import()) {
        // this.Service.query();
        mitt.emit('query');
      }
    },
    /**
     * 导出数据
     */
    exportData: async function (): Promise<void> {
      if (this.sFile.isExporting) {
        return;
      }

      await this.sFile.export();
    },
  },
});
