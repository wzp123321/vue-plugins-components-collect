<template>
  <div class="adss-view-drawer">
    <te-drawer v-model="visible" title="查看分摊策略" direction="rtl" :before-close="close">
      <AdssSubTitle title="基本信息"></AdssSubTitle>
      <te-form label-width="76px">
        <te-form-item label="策略名称">
          <span>{{ strategyInfo?.apportionedName }}</span>
        </te-form-item>
        <te-form-item label="能源类型">
          <span>{{ strategyInfo?.energyName }}</span>
        </te-form-item>
        <te-form-item label="分摊周期">
          <span>
            {{ strategyInfo?.apportionedStartTime }} 至
            {{ !strategyInfo?.apportionedEndTime ? '至今' : strategyInfo?.apportionedEndTime }}</span
          >
        </te-form-item>
      </te-form>
      <AdssSubTitle title="规则信息" class="avd-sub"></AdssSubTitle>
      <te-form label-width="76px">
        <te-form-item label="分摊源">
          <template v-if="strategyInfo?.apportionedSources && strategyInfo?.apportionedSources?.length > 0">
            <span v-for="item in strategyInfo?.apportionedSources">{{ item.apportionedSourceFormula ?? '--' }}</span>
          </template>
          <span v-else>--</span>
        </te-form-item>
        <te-form-item label="分摊规则">
          <span>{{ strategyInfo?.apportionedRule ?? '--' }}</span>
        </te-form-item>
        <te-form-item label="分摊对象">
          <template v-if="strategyInfo?.apportionedObjectList && strategyInfo?.apportionedObjectList.length > 0">
            <div class="avd-item" v-for="item in strategyInfo?.apportionedObjectList">{{ item.name }}</div>
          </template>
          <span v-else>--</span>
        </te-form-item>
      </te-form>
    </te-drawer>
  </div>
</template>
<script lang="ts" setup>
import { PropType, ref } from 'vue';
// 服务
import { At_ITableItem } from '../adss-table/adss-table.api';
// 组件
import AdssSubTitle from '../adss-sub-title/adss-sub-title.vue';

// 开关
const visible = ref<boolean>(false);
// 详情
const strategyInfo = ref<At_ITableItem>({
  apportionedEndTime: '',
  apportionedName: '',
  apportionedObject: '',
  apportionedObjectList: [],
  apportionedObjectName: '',
  apportionedObjectType: '',
  apportionedRule: '',
  apportionedRuleId: '',
  apportionedSource: '',
  apportionedSources: [],
  apportionedStartTime: '',
  energyCode: '',
  energyName: '',
  id: 0,
});
/**
 * 打开
 * @param data
 */
const show = (data: At_ITableItem) => {
  visible.value = true;

  strategyInfo.value.apportionedStartTime = data.apportionedStartTime ?? '';
  strategyInfo.value.apportionedEndTime = data.apportionedEndTime ?? '';
  strategyInfo.value.apportionedName = data.apportionedName ?? '';
  strategyInfo.value.apportionedObject = data.apportionedObject ?? '';
  strategyInfo.value.apportionedObjectList = data.apportionedObjectList ?? [];
  strategyInfo.value.apportionedObjectName = data.apportionedObjectName ?? '';
  strategyInfo.value.apportionedObjectType = data.apportionedObjectType ?? '';
  strategyInfo.value.apportionedRule = data.apportionedRule ?? '';
  strategyInfo.value.apportionedRuleId = data.apportionedRuleId ?? '';
  strategyInfo.value.apportionedSource = data.apportionedSource ?? '';
  strategyInfo.value.apportionedSources = data.apportionedSources ?? [];
  strategyInfo.value.energyCode = data.energyCode ?? '';
  strategyInfo.value.energyName = data.energyName ?? '';
  strategyInfo.value.id = data.id ?? 0;
};
// 关闭
const close = () => {
  visible.value = false;
};
// 对外暴露
defineExpose({
  show,
});
</script>
<style lang="less" scoped>
.adss-view-drawer {
  .avd-sub {
    margin-top: 40px;
  }

  :deep(.te-form) {
    .te-form-item__label {
      color: rgb(48, 49, 51);
      font-weight: 600;
    }

    .te-form-item__content {
      color: var(--te-text-color-regular);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 6px;
    }
  }
}
</style>
