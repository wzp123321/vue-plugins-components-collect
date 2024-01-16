import { getTreeExpandKeys } from '@/utils';
import message from '@/utils/message';
import { ref } from 'vue';
import { TreeItem, ObjectService } from './adssa-share-object-api';

export interface SelectedItem {
  id: string;
  name: string;
  type: string;
}
export class ShareObjectService {
  selectedObject = ref<SelectedItem[]>([]);

  loading = ref(true);

  search = ref('');

  // 分摊对象
  shareObject = ref<TreeItem[]>([]);

  //快捷选择
  quickSelect = ref<TreeItem[]>([]);

  expandedKeys = ref<number[]>([]);

  async getObjectList() {
    this.loading.value = true;
    try {
      const res = await ObjectService.getShareObjectObject({ treeType: '1' });
      if (res?.code === 200) {
        this.shareObject.value = res.data?.map((item) => {
          return {
            id: item.id.toString() || '',
            treeName: item.treeName || '',
            childTree: item.childTree || [],
          };
        });
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    } finally {
      this.loading.value = false;
    }
  }

  async getQuickSelectList() {
    try {
      const res = await ObjectService.getQuickSelectList();
      if (res?.code === 200) {
        this.quickSelect.value = res.data?.map((item) => {
          return {
            id: item.id.toString() || '',
            treeName: item.name || '',
            childTree: [],
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
}
