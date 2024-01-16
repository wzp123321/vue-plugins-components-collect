<template>
  <div class="daar-data-sign" id="daar-data-sign">
    <sub-title title="数据标记设置" class="mt32 mb16"></sub-title>
    <div class="daar-ds-container" v-loading="dataSign.loading">
      <div v-for="(item, index) in dataSign.dataSource" :key="'sign_' + index" class="sign-item">
        <div class="title">{{ item.dataTypeName }}</div>
        <div :class="['color-value', item.id === dataSign.editStore.id ? 'color-editing' : '']">
          <span class="color-name" v-if="item.id !== dataSign.editStore.id">{{ item.colorName }}</span>
          <el-select
            class="color-select"
            v-model="item.colorCode"
            v-if="item.id === dataSign.editStore.id"
            @change="dataSign.handleColorChange"
          >
            <el-option
              v-for="(childItem, childIndex) in dataSign.colorDic"
              :key="'color_' + childIndex"
              :value="childItem.code"
              :label="childItem.name"
            >
            </el-option>
          </el-select>
          <i
            class="iconfont icon-edit"
            @click="dataSign.handleBeEdit(item.id, item.colorCode, item.colorName)"
            title="编辑"
          ></i>
        </div>
      </div>
      <div class="common-table__empty" v-show="dataSign.dataSource?.length === 0 && !dataSign.loading">
        <img src="../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
        <p>暂无数据</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import DataSignService from './daar-data-sign.service';

const dataSign = new DataSignService();
</script>
<style lang="less" scoped>
#daar-data-sign {
  .daar-ds-container {
    min-height: 48px;
    display: flex;
    border: 1px solid rgba(0, 0, 0, 0.05);
    .sign-item {
      min-width: 50%;
      max-width: 50%;
      display: flex;

      > div {
        min-width: 50%;
        max-width: 50%;

        height: 48px;
        line-height: 48px;
        padding: 0 16px;
      }

      .color-value {
        position: relative;

        .el-select.color-select {
          width: 100%;
        }

        i.iconfont {
          cursor: pointer;
          display: none;

          position: absolute;
          top: 50%;
          right: 8px;
          transform: translateY(-50%);
        }
      }

      .color-value:not(.color-editing):hover {
        i.iconfont {
          display: inline-block;
          transition: all 233ms;
        }
      }

      div.title {
        text-align: center;
        background: rgba(0, 0, 0, 0.02);
      }
    }
  }
}
</style>
