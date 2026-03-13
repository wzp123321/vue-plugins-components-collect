<template>
  <te-dropdown trigger="click" placement="bottom-start">
    <te-button>导出</te-button>
    <template #dropdown>
      <te-dropdown-menu ref="dropdownRef">
        <te-dropdown-item
          class="export-item"
          v-if="!selectExportHide"
          :disabled="selectCount === 0"
          @click="exportHandle"
        >
          导出选中（当前选中<span style="color: rgb(24, 144, 255)">{{
            selectCount
          }}</span
          >条数据）
        </te-dropdown-item>
        <te-dropdown-item
          class="export-item"
          :disabled="allCount === 0"
          @click="exportHandle"
        >
          导出全部（共<span style="color: rgb(24, 144, 255)">
            {{ allCount }} </span
          >条）
        </te-dropdown-item>
      </te-dropdown-menu>
    </template>
  </te-dropdown>
  <!-- 导出 -->
  <Export
    v-model="visiable"
    export-api="/sec/excel/export"
    :export-param="params"
    :http-request="request"
    fileName="老人档案"
  ></Export>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRefs } from 'vue';
import { request } from '@/utils/request';
import Export from './export.vue';

const props = defineProps<{
  selectedCount?: number; // 选中的个数
  allCount: number; // 全部个数
  params: Object; // 全部导出接口的其他入参
  selectExportHide?: boolean; // 是否隐藏选中导出按钮  true不显示  false显示  默认false
  onExportSelected?: Function;
  onExportAll?: Function;
  fileName?: string; // 导出文件名前缀
}>();

const visiable = ref(false);
const { selectedCount, allCount, selectExportHide } = toRefs(props);
const selectCount = computed(() => selectedCount.value);
const exportHandle = () => {
  visiable.value = true;
};
onMounted(() => {
  nextTick(() => {
    // 删除focus元素父元素的aria-hidden属性
    const poppers = document.querySelectorAll('.te-popper');
    poppers.forEach((el) => el.removeAttribute('aria-hidden'));
  });
});
</script>

<style scoped lang="scss">
.export-item {
  font-size: 12px;
}
</style>
