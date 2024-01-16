<template>
  <div class="daar-calculate-nodelevel-configure" id="daar-calculate-nodelevel-configure">
    <sub-title title="计算节点层级设置" class="mt32 mb16"></sub-title>
    <div class="flex-row-start-center">
      <label>层级数：</label>
      <div class="daar-cnc-input">
        <div
          class="daar-cnc-icon daar-cnc-icon-left"
          :disabled="calculateNodeLevel.mapMinusDisabled()"
          @click="calculateNodeLevel.minus"
        >
          <el-icon><Minus /></el-icon>
        </div>
        <input
          type="text"
          :value="calculateNodeLevel.nodeLevel"
          v-inputFilter:positiveNumber="{ integral: 2 }"
          @input="calculateNodeLevel.handleInput"
          @blur="calculateNodeLevel.handleLevelChange"
        />
        <div
          class="daar-cnc-icon daar-cnc-icon-right"
          :disabled="calculateNodeLevel.mapPlusDisabled()"
          @click="calculateNodeLevel.add"
        >
          <el-icon><Plus /></el-icon>
        </div>
      </div>
      <!-- <el-input-number
        v-model="calculateNodeLevel.nodeLevel"
        :step="1"
        :precision="0"
        v-inputFilter:positiveNumber="{ integral: 2 }"
        @change="calculateNodeLevel.handleLevelChange"
      /> -->
      <span class="ml8">（至少设置4级，不填写代表所有节点均参与计算）</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import CalculateNodeLevelService from './daar-calculate-nodelevel-configure.service';

import { Plus, Minus } from '@element-plus/icons-vue';

const calculateNodeLevel = new CalculateNodeLevelService();
</script>
<style lang="less" scoped>
#daar-calculate-nodelevel-configure {
  .daar-cnc-input {
    width: 150px;
    height: 36px;
    border: 1px solid var(--color-text-border);
    display: flex;
    flex-direction: row;
    align-items: center;

    input {
      height: 34px;
      line-height: 34px;
      width: 78px;
      text-align: center;
      border: none;
    }

    input:focus {
      box-shadow: none;
    }

    .daar-cnc-icon {
      cursor: pointer;
      width: 36px;
      height: 100%;
      background: rgba(245, 247, 250, 1);

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      &.daar-cnc-icon-left {
        border-right: 1px solid var(--color-text-border);
      }
      &.daar-cnc-icon-right {
        border-left: 1px solid var(--color-text-border);
      }
    }

    span {
      user-select: none;
    }
  }
}
</style>
