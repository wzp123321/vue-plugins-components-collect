<template>
  <!-- 条件组 -->
  <div class="pdf-condition-group">
    <!-- 顶部操作栏 -->
    <div class="pcg-tool">
      <!-- 托管期 -->
      <div class="pcg-tool-period">
        <label>适用于</label>
        <el-select>
          <el-option :value="1" label="测试1"></el-option>
        </el-select>
        <em>-</em>
        <el-select>
          <el-option :value="1" label="测试1"></el-option>
        </el-select>
      </div>
      <!-- 按钮 -->
      <div class="pcg-tool-btn">
        <button>复制</button>
        <button>删除</button>
      </div>
    </div>
    <!-- 条件 -->
    <div class="pcg-content">
      <div class="pcg-content-item" v-for="item in props.groupInfo.conditionList">
        <pdfExpressionContainer v-model="item.judgementConditionList"></pdfExpressionContainer>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ElSelect, ElOption } from 'element-plus';
import pdfExpressionContainer from '../pdf-expression-container/pdf-expression-container.vue';

interface Props {
  groupInfo: any;
}
const props = withDefaults(defineProps<Props>(), {
  groupInfo: {
    startPeriod: null,
    endPeriod: null,
    conditionList: [],
    configuredFormulaIndexList: [],
    configuredDataIndexList: [],
  },
});
</script>
<style lang="less" scoped>
.pdf-condition-group {
  width: 100%;
  margin-top: 16px;

  .pcg-tool {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    padding: 13px 16px;
    border-bottom: 1px solid rgba(235, 238, 245, 1);
    background: rgba(245, 247, 250, 1);

    .pcg-tool-period {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }
}
</style>
