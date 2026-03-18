<template>
  <div class="pageA-detail-container">
    <te-descriptions
      class="delivery-description-custom"
      :column="3"
      border
      size="large"
    >
      <te-descriptions-item label="档案号" label-class-name="cusLabel"
        >31231</te-descriptions-item
      >
    </te-descriptions>
  </div>
</template>
<script lang="ts" setup>
import { DetailType } from '@/apis/pageA/index.api';
import { PropType } from 'vue';

defineProps({
  detailInfo: {
    type: Object as PropType<DetailType>,
    default: () => ({}),
  },
});
</script>

<style lang="scss" scoped>
.pageA-detail-container {
  width: 100%;
  height: 100%;
}
</style>
