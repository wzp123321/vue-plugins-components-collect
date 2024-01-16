<template>
  <div class="esm-summary">
    <te-table :data="props.totalLineList" style="width: 100%" :border="props.totalLineList.length > 0">
      <te-table-column v-for="(item, index) in props.totalHeadList" :prop="item" :label="item" align="center">
        <template #default="scope">
          <span v-if="index === 0">{{ scope.row.energyName }}</span>
          <span
            v-else-if="index === props.totalHeadList.length - 1"
            :title="scope.row.savingFlag ? mapPercent(scope.row.lineTotal) : thousandSeparation(scope.row.lineTotal)"
            >{{
              scope.row.savingFlag ? mapPercent(scope.row.lineTotal) : thousandSeparation(scope.row.lineTotal)
            }}</span
          >
          <span
            v-else
            :title="
              scope.row.savingFlag
                ? mapPercent(scope.row?.dataList?.[index - 1])
                : thousandSeparation(scope.row?.dataList?.[index - 1])
            "
          >
            {{
              scope.row.savingFlag
                ? mapPercent(scope.row?.dataList?.[index - 1])
                : thousandSeparation(scope.row?.dataList?.[index - 1])
            }}
          </span>
        </template>
      </te-table-column>
    </te-table>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { PropType } from 'vue';
// api
import { ESM_INextList } from '../../energy-saving-management.api';
// 工具方法
import { thousandSeparation } from '../../../../utils/index';
import { mapPercent } from '../../utils/index';
// props
const props = defineProps({
  totalLineList: {
    type: Object as PropType<ESM_INextList[]>,
    default: () => [],
  },
  totalHeadList: {
    type: Object as PropType<string[]>,
    default: () => [],
  },
});
</script>
<style lang="less" scoped>
.esm-summary {
  width: 100%;
  margin-bottom: var(--te-space-24);
}
</style>
