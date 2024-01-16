<template>
  <div class="daar-min-abnormal-value-configure" id="daar-min-abnormal-value-configure">
    <div class="daar-rac-subtitle mb16 flex-row-justify-center">
      <sub-title title="最小告警值设置"></sub-title>
      <div v-if="realTimeAbnormal.dataSource?.length !== 0">
        <button v-show="!realTimeAbnormal.isEditing" @click="realTimeAbnormal.triggerEdit">编辑</button>
        <button primary v-show="realTimeAbnormal.isEditing" @click="realTimeAbnormal.handleEditSubmit">确定</button>
        <button v-show="realTimeAbnormal.isEditing" @click="realTimeAbnormal.cancelEdit">取消</button>
      </div>
    </div>
    <div class="daar-rac-datasource" style="width: 100%" v-loading="realTimeAbnormal.loading">
      <template v-if="!realTimeAbnormal.loading && realTimeAbnormal.dataSource?.length">
        <div class="label">{{ configureType === EDaarAbnormalTab.实时异常 ? '每小时' : '每天' }}</div>
        <div v-for="(item, index) in realTimeAbnormal.dataSource" :key="'datasource_' + index" class="energy-item">
          <div class="cell title">{{ `${item?.energyCodeName}（${item?.unit}）` }}</div>
          <div class="cell value">
            <template v-if="!realTimeAbnormal.isEditing">
              <span>{{ item.deadbandValue === '' || item.deadbandValue === null ? '-' : item.deadbandValue }}</span>
            </template>
            <template v-else>
              <input type="text" v-model="item.deadbandValue" v-inputFilter:number="{ integral: 10, decimal: 2 }" />
            </template>
          </div>
        </div>
      </template>
      <template v-show="!realTimeAbnormal.loading && realTimeAbnormal.dataSource?.length === 0">
        <div class="common-table__empty">
          <img src="../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
          <p>暂无数据</p>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { EDaarAbnormalTab } from '../../data-abnomal-alarm-rules.api';
import MinAbnormalConfigureService from './daar-min-abnormal-value-configure.service';

const emit = defineEmits(['loaded']);

const props = defineProps({
  configureType: {
    type: Number,
    default: EDaarAbnormalTab.实时异常,
  },
});

const realTimeAbnormal = new MinAbnormalConfigureService(props.configureType);

onMounted(() => {
  realTimeAbnormal.query().then((res) => {
    emit('loaded', res);
  });
});
</script>
<style lang="less" scoped>
#daar-min-abnormal-value-configure {
  --cell-bg-color: rgba(0, 0, 0, 0.04);

  .daar-rac-datasource {
    min-height: 96px;
    display: flex;
    border: 1px solid var(--color-text-divider);

    div.label {
      min-width: 74px;
      max-width: 74px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--cell-bg-color);
      border-right: 1px solid rgba(0, 0, 0, 0.05);
    }

    .energy-item {
      flex: 1;

      &:not(:last-child) {
        border-right: 1px solid var(--color-text-divider);
      }
    }

    div.cell {
      padding: 0 16px;
      height: 48px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;

      &.value {
        span {
          display: inline-block;
          line-height: 22px;
        }

        input {
          margin: 0 auto;
          height: 24px;
          width: fit-content;
        }
      }

      &.title {
        background-color: var(--cell-bg-color);
        border-bottom: 1px solid var(--color-text-divider);
      }
    }
  }
}
</style>
