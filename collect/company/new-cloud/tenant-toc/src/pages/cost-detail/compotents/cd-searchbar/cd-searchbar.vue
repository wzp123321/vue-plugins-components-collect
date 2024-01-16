<template>
  <div class="cd-searchbar" id="cd-searchbar">
    <label class="mr8">大区分类</label>
    <el-checkbox-group v-model="cdSearchBar.checkedRegion">
      <el-checkbox-button v-for="(item, index) in cdSearchBar.regionList" :key="'region_' + index" :label="item.code">
        {{ item.name }}
      </el-checkbox-button>
    </el-checkbox-group>
    <button primary class="ml20" @click="search">查询</button>
    <button @click="reset">重置</button>
  </div>
</template>
<script lang="ts" setup>
import CdSearchBarService from './cd-searchbar.service';
import eventBus from '../../../../core/eventbus/index';

const cdSearchBar = new CdSearchBarService();

function search() {
  eventBus.emit('districts-check', cdSearchBar.checkedRegion);
}
function reset() {
  cdSearchBar.checkedRegion = [];
  eventBus.emit('districts-check', []);
}
</script>
<style lang="less" scoped>
.cd-searchbar {
  --el-transition-all: 0;

  padding: 11px 0 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);

  display: flex;
  flex-direction: row;
  align-items: center;

  :deep(.el-checkbox-group) {
    .el-checkbox-button:last-child .el-checkbox-button__inner,
    .el-checkbox-button:first-child .el-checkbox-button__inner {
      border-radius: 2px;
    }

    .el-checkbox-button.is-checked {
      .el-checkbox-button__inner {
        position: relative;
        color: var(--color-primary);
        background-color: var(--color-default);
        border-color: var(--color-primary);
        box-shadow: none;
      }

      .el-checkbox-button__inner::before {
        content: '';
        width: 1px;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: var(--color-primary);
        transition: all var(--el-transition-all);
      }
    }

    // 相邻两个选中
    .el-checkbox-button.is-checked + .el-checkbox-button.is-checked {
      .el-checkbox-button__inner::before {
        background-color: transparent;
      }
    }

    .el-checkbox-button:first-child.is-checked {
      .el-checkbox-button__inner::before {
        background-color: transparent;
      }
    }

    // 取消focus样式
    .el-checkbox-button.is-focus:not(.is-checked) .el-checkbox-button__inner {
      border-color: var(--color-text-border);
    }

    .el-checkbox-button__inner {
      line-height: 22px;
      padding: 6px 22px;
      border-color: var(--color-text-border);

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}
</style>
