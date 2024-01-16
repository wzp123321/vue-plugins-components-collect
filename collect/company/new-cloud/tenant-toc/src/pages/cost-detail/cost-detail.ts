/*
 * @Description:  成本明细
 * @Author:
 */
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import CdToolbarComponent from './compotents/cd-toolbar/cd-toolbar.vue';
import CdTableComponent from './compotents/cd-table/cd-table.vue';
import CdSearchBarComponent from './compotents/cd-searchbar/cd-searchbar.vue';

import { CostDetailService } from './cost-detail.service';

export default defineComponent({
  name: 'CostDetail',
  components: {
    'cd-toolbar': CdToolbarComponent,
    'cd-table': CdTableComponent,
    'cd-searchbar': CdSearchBarComponent,
  },
  setup() {
    const cdTable = ref<any>(null);
    const destroy = new Subject();
    const costDetail = new CostDetailService();

    costDetail.query();

    onMounted(() => {
      costDetail.authorityResult$.pipe(takeUntil(destroy)).subscribe((v) => {
        hasAuthority.value = v;
      });
    });

    onUnmounted(() => {
      destroy.next();
      destroy.complete();

      costDetail.destroyInstance();
    });

    const hasAuthority = ref<boolean>(false);

    /**
     * 页面点击事件
     * 判断是否是空白处点击，如果是则调用表格重置数据方法
     * @param e
     */
    const pageClick = (e: Event) => {
      // e.preventDefault();
      e.stopPropagation();

      const tableEle = document.getElementsByClassName('cd-table');
      if (
        !tableEle?.[0]?.contains(e.target as HTMLElement) &&
        !(e.target as HTMLElement).className.includes('cd-t-cell-editor') &&
        !(e.target as HTMLElement).className.includes('log')
      ) {
        if (cdTable.value) {
          cdTable.value?.resetPageStatus();
        }
      }
    };

    return { pageClick, cdTable, hasAuthority };
  },
});
