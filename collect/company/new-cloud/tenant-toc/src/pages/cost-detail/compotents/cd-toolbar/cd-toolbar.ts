/*
 * @Description:  toolbar 操作按钮： 导入
 * @Autor:
 */
import { defineComponent, computed, ref, nextTick } from 'vue';
import ToolbarService from './cd-toolbar.service';
import eventBus from '../../../../core/eventbus/index';
import { CD_ETableSize } from '../../cost-detail.api';
import { SCREEN_STORAGE_KEY } from '../cd-table/cd-t-screen/cd-t-screen.api';

import { VxeTableInstance } from 'vxe-table';
import XEUtils from 'xe-utils';

import { customPrefix, customClose } from '../../../../utils/index';

export default defineComponent({
  name: 'CdToolbarComponent',
  props: {
    hasAuthority: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const toolTable = ref<typeof VxeTableInstance>();

    const hasAuthority = computed(() => {
      return props.hasAuthority;
    });
    const typeOptions = Object.entries(CD_ETableSize).map(([k, v]) => {
      return {
        label: k,
        value: v,
      };
    });

    //#region 文件服务
    const sFile = ToolbarService;
    sFile.init();
    sFile.queryStatusticsDate();
    //#endregion

    //#region 方法
    const mapDisabledDate = (current: Date) => {
      return current > new Date();
    };
    /**
     * 导入SAP数据
     */
    const importData = async (): Promise<void> => {
      if (sFile.isImporting) {
        return;
      }
      sFile
        .import()
        .then((res) => {
          if (res?.pageNum !== -1) {
            eventBus.emit('cost-reset', res);
          }
        })
        .catch((error) => {
          if (sFile.exceptions?.length) {
            nextTick(() => {
              const $table = toolTable.value;
             setTimeout(() => {
              const ele = document.querySelector('.vxe-table--body-wrapper.body--wrapper');
              if (ele) {
                ele?.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: 'auto',
                });
              }
             }, 400);
              if ($table) {
                $table.loadData(XEUtils.clone(sFile.exceptions, true));
              }
            });
          }
          console.warn('导入SAP数据------------------------->', error);
        });
    };
    //#endregion

    const clearFilter = () => {
      sFile.setFilterFlag(false);
      window.localStorage.removeItem(SCREEN_STORAGE_KEY);
      eventBus.emit('cost-reset');
    };

    return {
      sFile,
      customPrefix,
      customClose,
      hasAuthority,
      typeOptions,
      toolTable,
      clearFilter,
      mapDisabledDate,
      importData,
    };
  },
});
