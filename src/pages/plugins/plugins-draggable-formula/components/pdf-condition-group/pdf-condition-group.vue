<template>
  <!-- 条件组 -->
  <div class="pdf-condition-group">
    <!-- 顶部操作栏 -->
    <section class="pcg-tool">
      <!-- 托管期 -->
      <div class="pcg-tool-period">
        <label>适用于</label>
        <el-select placeholder="开始托管期">
          <el-option :value="1" label="测试1"></el-option>
        </el-select>
        <em>-</em>
        <el-select placeholder="结束托管期">
          <el-option :value="1" label="测试1"></el-option>
        </el-select>
      </div>
      <!-- 按钮 -->
      <div class="pcg-tool-btn">
        <button @click="handleCopy">复制</button>
        <button @click="handleDelete">删除</button>
      </div>
    </section>
    <!-- 条件组 -->
    <section class="pcg-content">
      <div class=""><span @click="props.groupInfo.addCondition">判断条件</span></div>
      <div class=""><span>计算公式</span></div>
      <template v-for="item in props.groupInfo.conditionList">
        <pdfExpressionContainer v-model="item.judgementConditionList"></pdfExpressionContainer>
        <pdfExpressionContainer v-model="item.judgementConditionList"></pdfExpressionContainer>
      </template>
    </section>
    <!-- 单独配置指标 -->
    <section class="pcg-index">
      <span>分成基数=</span>
      <pdfExpressionContainer></pdfExpressionContainer>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { ElSelect, ElOption } from 'element-plus';
import pdfExpressionContainer from '../pdf-drag-container/pdf-drag-container.vue';

interface Props {
  groupInfo: any;
  groupIndex: number;
}
const props = withDefaults(defineProps<Props>(), {
  groupInfo: {
    id: null,
    startPeriod: null,
    endPeriod: null,
    conditionList: [],
    configuredFormulaIndexList: [],
    configuredDataIndexList: [],
    mapStartPeriodDisabled: () => {},
    mapEndPeriodDisabled: () => {},
    addCondition: () => {},
    copyCondition: () => {},
    deleteCondition: () => {},
    addConfiguredDataIndex: () => {},
    addConfiguredFormulaIndex: () => {},
  },
  groupIndex: 0,
});
const emits = defineEmits(['copy', 'delete']);

const handleCopy = () => {
  emits('copy');
};
const handleDelete = () => {
  emits('delete');
};
</script>
<style lang="less" scoped>
.pdf-condition-group {
  width: 100%;
  margin-top: 16px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);

  .pcg-tool {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    padding: 8px 16px;
    border-bottom: 1px solid rgba(235, 238, 245, 1);
    background: rgba(245, 247, 250, 1);

    .pcg-tool-period {
      display: flex;
      flex-direction: row;
      align-items: center;

      :deep(.el-select) {
        width: 136px;
        color: rgba(96, 98, 102, 1);

        .el-input__wrapper,
        .el-input__wrapper.is-focus,
        input {
          background: rgba(245, 247, 250, 1);
          box-shadow: none !important;
        }

        input::placeholder {
          color: rgb(168, 171, 178);
        }
      }
    }
  }

  .pcg-content {
    overflow-x: auto;
    padding: 9px 16px;
    background-color: #fff;

    display: grid;
    grid-template-columns: minmax(222px, auto) auto;
  }

  .pcg-index {
    padding: 12px 16px;
    background: rgba(245, 247, 250, 1);
  }
}
</style>
