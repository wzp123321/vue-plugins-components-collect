<!--
 * @Author: yut
 * @Date: 2023-08-10 14:25:02
 * @LastEditors: yut
 * @LastEditTime: 2023-11-09 14:50:57
 * @Descripttion: 
-->
<template>
  <div class="wi-project-info">
    <wi-sub-title
      subTitle="项目信息"
      @viewDetail="
        wiService.onLinkTo(EUrlPath.项目信息, WI_EJumpType.cloud, WI_MENU_ID.项目信息, wiService.projectInfo.accessed)
      "
      :accessed="wiService.projectInfo.accessed"
      :show-detail="true"
    />
    <div class="wpi-item">
      <label>托管周期</label>
      <div class="wpi-item-txt" :title="wiService.projectInfo.timeRange ? wiService.projectInfo.timeRange : '-'">
        {{ wiService.projectInfo.timeRange ? wiService.projectInfo.timeRange : '-' }}
      </div>
    </div>
    <div class="wpi-item">
      <label>托管能源</label>
      <div class="wpi-item-txt" :title="wiService.projectInfo.energyRange ? wiService.projectInfo.energyRange : '-'">
        {{ wiService.projectInfo.energyRange ? wiService.projectInfo.energyRange : '-' }}
      </div>
    </div>
    <div class="wpi-item">
      <label>托管类型</label>
      <div
        class="wpi-item-txt"
        :title="wiService.projectInfo.hostingTypeName ? wiService.projectInfo.hostingTypeName : '-'"
      >
        {{ wiService.projectInfo.hostingTypeName ? wiService.projectInfo.hostingTypeName : '-' }}
      </div>
    </div>
    <div class="wpi-item">
      <label>项目风险评级</label>
      <div
        class="wpi-item-txt"
        :title="wiService.projectInfo.riskRatingName ? wiService.projectInfo.riskRatingName : '-'"
      >
        {{ wiService.projectInfo.riskRatingName ? wiService.projectInfo.riskRatingName : '-' }}
      </div>
    </div>
    <div class="wpi-item">
      <label>基准类型</label>
      <div
        class="wpi-item-txt"
        :title="wiService.projectInfo.benchmarkType ? wiService.projectInfo.benchmarkType : '-'"
      >
        {{ wiService.projectInfo.benchmarkType ? wiService.projectInfo.benchmarkType : '-' }}
      </div>
    </div>
    <!-- <div class="wpi-item">
      <label>收益分享</label>
      <div class="wpi-item-txt" :title="wiService.projectInfo.profit ? wiService.projectInfo.profit : '-'">
        {{ wiService.projectInfo.profit ? wiService.projectInfo.profit : '-' }}
      </div>
    </div> -->
  </div>
</template>
<script lang="ts" setup>
import { WiSubTitle } from '../index';
import wiService from '../../work-instruction.service';
import { EUrlPath, WI_EJumpType, WI_MENU_ID } from '../../work-instruction.api';
</script>
<style lang="less" scoped>
.wi-project-info {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: url(../../../../assets/images/work-instruction/wi-project.svg) no-repeat 100% 100%;

  :deep(.wi-sub-title) {
    flex: none;
    margin-bottom: var(--te-space-24);
  }
  .wpi-item {
    height: 40px;
    flex: none;
    display: flex;
    gap: var(--te-space-16);
    align-items: center;
    > label {
      height: 22px;
      line-height: 22px;
      width: 84px;
      color: var(--te-text-color-primary);
      font-size: var(--te-font-size-b14);
      text-align: right;
    }
    &-txt {
      flex: auto;
      color: var(--te-text-color-regular);
      font-size: var(--te-font-size-b14);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // .wpi-image {
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  //   flex: auto;
  //   background: url(../../../../assets/images/work-instruction/wi-project.svg) no-repeat 100% 100%;
  // }
}
</style>
