<!--
 * @Author: yut
 * @Date: 2023-08-10 10:55:26
 * @LastEditors: yut
 * @LastEditTime: 2023-11-09 11:10:46
 * @Descripttion: 
-->

<template>
  <div class="wi-latest-visit">
    <wi-sub-title subTitle="最近访问" />
    <div class="wiv-content">
      <div
        v-for="item in wiService.recentlyAccessedMenuList"
        :key="item.id"
        :class="!item.accessed ? 'not-allowed' : ''"
        @click="wiService.onLinkTo(item.path, item.flag, item.id, item.accessed)"
      >
        <span class="wiv-content-icon"><component :is="mapIcon(item.id)"></component></span>
        <div class="wiv-content-name" :title="item.name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { WiSubTitle } from '../index';
import { WI_MENU_ID } from '../../work-instruction.api';
import wiService from '../../work-instruction.service';

import {
  IconTitleDecoration,
  IconCoin,
  IconHosted,
  IconHomeFilled,
  IconMenu,
  IconDataLine,
  IconMedal,
  IconAlarm,
  IconDocumentChecked,
  IconEnergy,
  IconMoney,
  IconSetting,
  IconArithmetic,
  IconSuitcase,
  IconFolderOpened,
  IconTickets,
  IconShield,
} from '@arco-iconbox/vue-te';

const mapIcon = (id: string) => {
  let icon = null;
  switch (id) {
    case WI_MENU_ID.工作指引:
      icon = IconHomeFilled;
      break;
    case WI_MENU_ID.能耗分析2x:
    case WI_MENU_ID.能耗分析3x:
      icon = IconDataLine;
      break;
    case WI_MENU_ID.节能考核:
      icon = IconMedal;
      break;
    case WI_MENU_ID.能源事件2x:
    case WI_MENU_ID.能源事件2x:
      icon = IconShield;
      break;
    case WI_MENU_ID.能源助手2x:
    case WI_MENU_ID.能源助手3x:
    case WI_MENU_ID.工作计划:
    case WI_MENU_ID.工作记录:
      icon = IconHosted;
      break;
    case WI_MENU_ID.告警管理2x:
    case WI_MENU_ID.告警管理3x:
      icon = IconAlarm;
      break;
    case WI_MENU_ID.工单分析:
      icon = IconDocumentChecked;
      break;
    case WI_MENU_ID.经营分析:
    case WI_MENU_ID.月度明细表:
    case WI_MENU_ID.成本补录:
      icon = IconCoin;
      break;
    case WI_MENU_ID.能耗预核算偏差:
      icon = IconEnergy;
      break;
    case WI_MENU_ID.成本预核算偏差:
      icon = IconMoney;
      break;
    case WI_MENU_ID.能耗管控:
    case WI_MENU_ID.户号管理:
    case WI_MENU_ID.节能量管理:
    case WI_MENU_ID.边界管理:
    case WI_MENU_ID.节能项目管理:
    case WI_MENU_ID.用户数据录入:
      icon = IconSetting;
      break;
    case WI_MENU_ID.能耗核算表:
      icon = IconArithmetic;
      break;
    case WI_MENU_ID.能耗预算:
    case WI_MENU_ID.能耗预算全期表:
    case WI_MENU_ID.能耗预算表:
      icon = IconSuitcase;
      break;
    case WI_MENU_ID.文件管理:
      icon = IconFolderOpened;
      break;
    case WI_MENU_ID.项目信息:
      icon = IconTickets;
      break;
    default:
      icon = IconTickets;
      break;
  }
  return icon;
};
</script>
<style lang="less" scoped>
.wi-latest-visit {
  width: 100%;
  height: 100%;

  .wiv-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-row-gap: var(--te-space-16);
    > div {
      height: 66px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      &:hover {
        cursor: pointer;
        color: var(--te-color-primary);
        .wiv-content-name {
          color: var(--te-color-primary);
        }
        > span {
          background-color: var(--te-color-primary-light-9);
        }
      }
    }
    &-icon {
      display: inline-flex;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      justify-content: center;
      align-items: center;
      background-color: var(--te-fill-color-light);
    }

    &-name {
      height: 20px;
      width: 100%;
      line-height: 20px;
      text-align: center;
      color: var(--te-text-color-regular);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  .not-allowed {
    cursor: not-allowed !important;
    &:hover {
      color: var(--te-text-color-placeholder) !important;
      .wiv-content-name {
        color: var(--te-text-color-placeholder) !important;
      }
      > span {
        background-color: var(--te-fill-color-light) !important;
      }
    }
    .wiv-content-icon,
    .wiv-content-name {
      color: var(--te-text-color-placeholder);
    }
  }
}
</style>
