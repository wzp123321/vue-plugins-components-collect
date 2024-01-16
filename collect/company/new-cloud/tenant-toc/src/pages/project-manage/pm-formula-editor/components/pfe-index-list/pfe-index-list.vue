<template>
  <div class="pfe-index-list">
    <h5>指标字段</h5>
    <!-- tab -->
    <te-radio-group v-model="indexType" size="default" @change="handleIndexTypeChange">
      <te-radio-button v-for="item in PFE_INDEX_TAB_LIST" :label="item.value">
        {{ item.label }}
      </te-radio-button>
    </te-radio-group>
    <!-- 描述 -->
    <p class="pil-description" v-show="mapIndexDescFlag(indexType)">{{ mapIndexDescLabel(indexType) }}</p>
    <!-- 新增标签 -->
    <te-button class="pil-add" v-show="mapIndexDescFlag(indexType) && !addFlag" @click="triggerAddFlag">
      <icon-plus />
      添加标签
    </te-button>
    <!-- 新增输入框 -->
    <te-input
      class="pil-input"
      v-model="indexLabel"
      v-auto-focus
      placeholder="请输入"
      maxlength="20"
      show-word-limit
      v-inputFilter:search
      v-if="mapIndexDescFlag(indexType) && addFlag"
      @blur="handleAddInputBlur"
      @keydown.enter="handleAddInputEnter"
    ></te-input>
    <!-- 指标列表 -->
    <!-- filter-不可拖拽 -->
    <te-scrollbar v-loading="loading">
      <draggable
        v-if="indexList.length !== 0"
        v-model="indexList"
        class="pil-drag-container"
        item-key="serialNumber"
        :group="{ name: 'people', put: false, pull: 'clone' }"
        :sort="false"
        filter=".pil-drag-container-item-editing"
        handle=".pil-drag-container-item"
        animation="300"
        @start="handleDragStart"
        @end="handleDragEnd"
        :move="mapIndexMove"
      >
        <template #item="{ element, index }: { element: PFE_IIndexVO, index: number }">
          <div
            :class="[
              'pil-drag-container-item',
              PFE_DRAGGABLE_CLASS,
              mapIndexEditFlag(element.id) ? 'pil-drag-container-item-editing' : '',
            ]"
            :style="mapTagStyle(element.indexType)"
          >
            <!-- 正常指标 -->
            <span v-if="!mapIndexEditFlag(element.id)">{{ element.indexName }}</span>
            <icon-more-filled
              v-if="!mapFixed(element.fixed) && !mapIndexEditFlag(element.id)"
              @click="handlePopoverShow($event, element.id, element.indexName, element.serialNumber)"
            />
            <!-- 指标编辑输入框 -->
            <te-input
              class="pil-input"
              v-model="element.indexName"
              v-auto-focus
              maxlength="20"
              show-word-limit
              v-inputFilter:search
              v-if="mapIndexEditFlag(element.id)"
              @blur="handleEditInputBlur"
              @keydown.enter="handleEditInputEnter"
            ></te-input>
          </div>
        </template>
      </draggable>
      <!-- 缺省 -->
      <div class="pil-empty" v-if="indexList.length === 0 && !loading">暂无数据</div>
    </te-scrollbar>
    <!-- 弹出层 -->
    <pil-dropdown
      ref="dropDownRef"
      :editStore="editStore"
      @confirmEdit="handleTriggerEdit"
      @confirmDelete="handleDelete"
    ></pil-dropdown>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { reactive, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
// 组件
import draggable from 'vuedraggable';
import { IconPlus, IconMoreFilled } from '@arco-iconbox/vue-te';
import pilDropdown from './pil-dropdown/pil-dropdown.vue';
import { TeMessage } from '@tiansu/element-plus';
// API
import { PIL_IEditIndexStore, mapTagStyle, PIL_IIndexAddEditParams } from './pfe-index-list.api';
import { PFE_IIndexVO } from '../../pm-formula-editor.api';
import { CommonIHttpRes, Common_IObject } from '@/service/api';
// 服务请求
import { postRequest } from '@/service/request';
// 常量
import { PFE_DRAGGABLE_CLASS, PFE_INDEX_TAB_LIST, PFE_SERVICE_DATA_CLASS_NAME } from '../../constant';
// 枚举
import { PFE_EFixedType, PFE_EPath, PFE_ESymbolType } from '../../enums';
// 工具方法
import { getTenant } from '@/utils';
import { mapServiceAffiliationClass } from '../../utils';
// 服务
import draggableFormulaService from '../../pm-formula-editor.service';

// 是否处于新增状态
const addFlag = ref<boolean>(false);
// 新增标签文本
const indexLabel = ref<string>('');
// 弹出层
const dropDownRef = ref();
// 编辑指标信息
const editStore = reactive<PIL_IEditIndexStore>({
  serialNumber: '',
  originName: '',
  indexName: '',
});
/**
 * 判断是否是内置
 * @param fixed
 */
const mapFixed = (fixed: PFE_EFixedType) => {
  return fixed === PFE_EFixedType.内置;
};
/**
 * 指标是否需要展示描述
 * @param type
 */
const mapIndexDescFlag = (type: PFE_ESymbolType) => {
  return [PFE_ESymbolType.定值, PFE_ESymbolType.运算]?.includes(type);
};
/**
 * 指标描述
 * @param type
 */
const mapIndexDescLabel = (type: PFE_ESymbolType) => {
  return type === PFE_ESymbolType.定值
    ? '—— 需按月维护指标 ——'
    : type === PFE_ESymbolType.运算
    ? '—— 需维护计算公式 ——'
    : '';
};

// loading
const loading = ref<boolean>(false);
// 指标列表
const indexList = ref<PFE_IIndexVO[]>([]);
// 指标类型
const indexType = ref<PFE_ESymbolType>(PFE_ESymbolType.基础);
/**
 * 切换指标类型
 * @param type
 */
const handleIndexTypeChange = (type: PFE_ESymbolType) => {
  editFlag.value = false;
  addFlag.value = false;

  indexType.value = type;
  queryIndexList();
};
/**
 * 查询指标列表
 */
const queryIndexList = async () => {
  try {
    loading.value = true;
    indexList.value = [];
    const params = {
      tenantId: getTenant().tenantId,
      indexType: indexType.value,
      incomeShareObject: store.getters.grainSharingMode
    };
    const res: CommonIHttpRes<PFE_IIndexVO[]> = await postRequest(PFE_EPath.查询收益分享模式各项指标列表, params);
    if (res?.success) {
      indexList.value = res?.data ?? [];
    }
  } catch (error) {
    indexList.value = [];
  } finally {
    loading.value = false;
  }
};
/**
 * 打开弹出菜单,当前没有指标处于编辑状态时才会打开
 * @param e
 * @param index
 * @param value
 */
const handlePopoverShow = (e: Event, id: string, value: string, serialNumber: string) => {
  if (dropDownRef.value && !editFlag.value) {
    editStore.id = id;
    editStore.indexName = value;
    editStore.originName = value;
    editStore.serialNumber = serialNumber;
    dropDownRef.value?.show(e);
  }
};
/**
 * 修改新增状态
 */
const triggerAddFlag = () => {
  addFlag.value = !addFlag.value;
};
/**
 * 输入框失焦
 * @param e
 */
const handleAddInputBlur = async (e: Event) => {
  if (indexLabel.value) {
    const res = await handleIndexAddEditReq();
    if (res) {
      // 新增完需要滚动到顶部
      indexLabel.value = '';
      triggerAddFlag();

      queryIndexList();
    } else {
      handleInputFocus();
    }
  } else {
    handleInputFocus();
    addFlag.value = false;
  }
};
/**
 * 输入框回车
 * @param e
 */
const handleAddInputEnter = (e: InputEvent) => {
  if (e.target) {
    (e.target as HTMLInputElement).blur();
  }
};

// 是否处于编辑状态
const editFlag = ref<boolean>(false);
/**
 * 是否处于编辑状态
 * @param {string} id
 * @returns {boolean}
 */
const mapIndexEditFlag = (id: string): boolean => {
  return editFlag.value && editStore.id === id;
};
/**
 * 触发编辑
 * @param {boolean} value
 * @returns {void}
 */
const handleTriggerEdit = (value: boolean): void => {
  editFlag.value = value;
};
/**
 * 删除指标
 * @returns {Promise<void|undefined>}
 */
const handleDelete = async (): Promise<void | undefined> => {
  if (mapIndexUsed()) {
    TeMessage.error('删除失败，指标已应用，请先在条件公式中删除');
    return;
  }
  try {
    const { id } = editStore;
    const { tenantId } = getTenant();
    const incomeShareObject = store.getters?.grainSharingMode;
    const res = await postRequest(PFE_EPath.删除定值运算指标, {
      id,
      tenantId,
      incomeShareObject,
    });
    if (res?.success) {
      TeMessage.success('操作成功');

      queryIndexList();
    } else {
      TeMessage.error(res?.message ?? '操作失败');
    }
  } catch (error) {
    TeMessage.error('操作失败');
  }
};
/**
 * 指标是否被使用
 * @returns {boolean}
 */
const mapIndexUsed = (): boolean => {
  const checkId = (serialNumber: string, type: string) => {
    return type === indexType.value && serialNumber === editStore.serialNumber;
  };
  // 判断条件&公式中是否包含该指标
  const formulaFlag =
    draggableFormulaService?.groupList?.length > 0 &&
    draggableFormulaService?.groupList?.some((item) => {
      return item?.conditionList?.some((conItem) => {
        return (
          conItem?.computationalFormulas?.some((computational) =>
            checkId(computational.serialNumber, computational.indexType),
          ) ||
          conItem?.judgementConditions?.some((judgement) => {
            return judgement?.conditionFormulaComponentList?.some((conditionFormula) =>
              checkId(conditionFormula.serialNumber, conditionFormula.indexType),
            );
          })
        );
      });
    });
  // 维护数据是否包含该指标
  const serviceFlag =
    draggableFormulaService?.serviceDataIndexList?.length > 0 &&
    draggableFormulaService?.serviceDataIndexList?.some((item) => {
      return (
        checkId(item.serialNumber, item.indexType) ||
        item?.formulaComponentList?.some((cItem) => {
          return checkId(cItem.serialNumber, cItem.indexType);
        })
      );
    });
  // 其他模式维护的数据是否
  const otherFlag = draggableFormulaService?.quoteCalculateIndexList?.some((item) => {
    return checkId(item.serialNumber, item.indexType);
  });
  return formulaFlag || serviceFlag || otherFlag;
};

// emit
const emits = defineEmits(['editSuccess']);
/**
 * 输入框失焦
 * @param {InputEvent} e
 * @returns {Promise<void|undefined>}
 */
const handleEditInputBlur = async (e: InputEvent): Promise<void | undefined> => {
  if (!(e.target as HTMLInputElement).value) {
    handleInputFocus();
    return;
  }
  if ((e.target as HTMLInputElement).value === editStore.originName) {
    editFlag.value = false;
    editStore.id = '';
    editStore.originName = '';
  } else {
    editStore.indexName = (e.target as HTMLInputElement).value;
    indexLabel.value;
    const res = await handleIndexAddEditReq();
    if (res) {
      // 编辑成功----更新所有的指标
      emits('editSuccess', editStore.serialNumber, res);
      queryIndexList();
      console.log('%c✨✨编辑成功✨✨', 'font-size: 24px', editStore.serialNumber, res);
      editFlag.value = false;
      editStore.id = '';
      editStore.originName = '';
      indexLabel.value = '';
    } else {
      handleInputFocus();
    }
  }
};
/**
 * 输入框回车
 * @param e
 */
const handleEditInputEnter = (e: InputEvent) => {
  if (e.target) {
    (e.target as HTMLInputElement).blur();
  }
};
/**
 * 调用新增&编辑接口
 * @returns {Promise<string>}
 */
const handleIndexAddEditReq = (): Promise<string> => {
  return new Promise(async (resolve) => {
    try {
      const params = mapAddEditParams();
      const res: CommonIHttpRes<PFE_IIndexVO> = await postRequest(PFE_EPath.新增定值运算指标, params);
      if (res?.success) {
        resolve(params.indexName);
      } else {
        resolve('');
        handleInputFocus();
        TeMessage.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      handleInputFocus();
      TeMessage.error('操作失败');
      resolve('');
    }
  });
};
/**
 * 输入框聚焦
 * @returns {void}
 */
const handleInputFocus = (): void => {
  setTimeout(() => {
    const inputContainer = document.querySelector('.pil-input') as HTMLInputElement;
    const inputEle = inputContainer?.querySelector('input') as HTMLInputElement;
    inputEle && inputEle?.focus();
  }, 200);
};
/**
 * 返回新增编辑参数
 * @returns {PIL_IIndexAddEditParams}
 */
const mapAddEditParams = (): PIL_IIndexAddEditParams => {
  const { tenantId } = getTenant();
  const { id, serialNumber } = editStore;
  return editFlag.value
    ? {
        id,
        tenantId,
        indexType: indexType.value,
        indexName: editStore.indexName,
        serialNumber,
      }
    : {
        tenantId,
        indexType: indexType.value,
        indexName: indexLabel.value,
      };
};

// store
const store = useStore();
/**
 * 拖拽开始
 * @returns {void}
 */
const handleDragStart = (): void => {
  store.dispatch('setDraggingFlag', true);
};
/**
 * 拖拽结束
 * @returns {void}
 */
const handleDragEnd = (): void => {
  store.dispatch('setDraggingFlag', false);
};
/**
 * 拖拽指标,没有托入维护数据或者拖入的指标不是公式配置所属的指标
 * @param {Common_IObject} e
 * @returns {boolean}
 */
const mapIndexMove = (e: Common_IObject): boolean => {
  // 维护数据容器
  const container = document.querySelector(`.${PFE_SERVICE_DATA_CLASS_NAME}`);
  const toClassName = (e.to as HTMLElement).className;
  const serialNumber = (e.draggedContext as any).element.serialNumber;
  const className = mapServiceAffiliationClass(serialNumber);

  // 如果拖动到维护数据中的公式配置，且配置的公式包含了自己，则不可拖拽
  return (
    !container?.contains?.(e.to as HTMLElement) ||
    (container?.contains?.(e.to as HTMLElement) && !toClassName?.includes(className))
  );
};
/**
 * 初始化
 */
onMounted(() => {
  indexLabel.value = '';
  indexType.value = PFE_INDEX_TAB_LIST[0].value;
  queryIndexList();
});
</script>
<style lang="less" scoped>
.pfe-index-list {
  height: 100%;
  background-color: var(--te-fill-color-light);
  padding: var(--te-space-16) 15px var(--te-space-16) var(--te-space-16);
  border-right: 1px solid var(--te-border-color-lighter);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  h5 {
    color: var(--te-text-color-primary);
    font-weight: 600;
    font-size: var(--te-font-size-b14);
    line-height: 22px;
    margin-bottom: var(--te-space-16);
  }

  .te-radio-group {
    margin-bottom: var(--te-space-20);
  }

  .pil-description {
    color: var(--te-text-color-disabled);
    font-size: var(--te-font-size-b14);
  }

  .pil-description,
  .pil-add,
  .pil-input {
    margin-bottom: var(--te-space-16);
  }

  .pil-add {
    svg {
      color: var(--te-text-color-regular);
      margin-right: 6px;
    }
  }

  .pil-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--te-text-color-secondary);
  }

  :deep(.te-scrollbar) {
    .el-loading-mask {
      background-color: transparent !important;
    }

    .pil-drag-container {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--te-space-8);

      > .pil-drag-container-item {
        cursor: pointer;
        padding: 4px var(--te-space-12);
        border-radius: var(--te-space-4);
        width: fit-content;
        display: flex;
        align-items: center;
        gap: var(--te-space-8);
      }

      > .pil-drag-container-item-editing {
        padding: 0;
        background-color: transparent !important;
        border: none !important;
      }
    }
  }
}
</style>
