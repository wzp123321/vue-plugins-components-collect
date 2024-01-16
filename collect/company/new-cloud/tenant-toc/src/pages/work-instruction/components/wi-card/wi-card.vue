<!--
 * @Author: yut
 * @Date: 2023-08-09 11:24:56
 * @LastEditors: yut
 * @LastEditTime: 2023-11-09 10:51:18
 * @Descripttion: 
-->
<template>
  <div class="wi-card">
    <div class="wi-card-top">
      <span class="wct-index">{{ index }}</span>
      <div
        :class="['wct-header', !accessed ? 'not-allowed' : '']"
        @click="wiService.onLinkTo(path, WI_EJumpType.cloud, id.toString(), accessed)"
      >
        <span class="wct-header-tag" v-if="showTag">每月</span>
        <span class="wct-header-title" :title="subTitle">{{ subTitle }}</span>
        <span class="wct-header-icon">
          <icon-right />
        </span>
      </div>
      <div class="wct-description" :title="description">{{ description }}</div>
    </div>
    <div class="wi-card-bottom">
      <img :src="img" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { IconRight } from '@arco-iconbox/vue-te';
import wiService from '../../work-instruction.service';
import { WI_EJumpType, EUrlName } from '../../work-instruction.api';

const props = defineProps<{
  subTitle: string; //标题
  description: string; //描述
  img: string; //图片
  path: string; //url
  id: number; //菜单名
  index: string | number; //序号
  showTag?: boolean; //是否展示标签
  accessed: boolean; //是否有权限
}>();
</script>
<style lang="less" scoped>
.wi-card {
  width: 100%;
  height: 100%;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--te-space-16);
  position: relative;
  &::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 100%;
    background-color: var(--te-border-color);
    right: 0;
  }

  &-top {
    // width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .wct-index {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--te-color-primary);
    font-size: var(--te-font-size-b14);
    color: var(--te-color-white);
    margin-bottom: 12px;
  }

  .wct-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    //标签
    &-tag {
      width: 40px;
      height: 20px;
      border-radius: 4px;
      text-align: center;
      flex: none;
      color: var(--te-color-warning);
      background-color: var(--te-color-warning-light-9);
    }

    //标题
    &-title {
      max-width: 130px;
      height: 22px;
      line-height: 22px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--te-font-size-b14);
      color: var(--te-color-primary);
    }

    //图标
    &-icon {
      width: 22px;
      height: 22px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      flex: none;
      color: var(--te-color-primary);
    }

    &.not-allowed {
      cursor: not-allowed;
      .wct-header-title,
      .wct-header-icon {
        color: var(--te-color-primary-light-5);
      }
    }
  }

  //描述
  .wct-description {
    width: 100%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--te-font-size-b12);
    color: var(--te-text-color-secondary);
  }

  .wi-card-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 80px;
      height: 80px;
    }
  }
}
</style>
