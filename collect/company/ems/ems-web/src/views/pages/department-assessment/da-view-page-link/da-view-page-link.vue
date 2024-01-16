<template>
  <div class="da-view-page-link">
    <div class="dvpl-title dvpl-frsc">
      <DaSubTitle :sort="4" title="跟踪科室能耗用量"></DaSubTitle>
      <icon-warning-outline />
      <p>以下模块数据每日更新，建议每日查看并持续跟踪</p>
    </div>
    <div class="dvpl-pages dvpl-frsc">
      <!-- 可跳转页面列表 -->
      <ul class="dvpl-frsc dvpl-pages-list">
        <li
          v-for="item in DVPL_VIEW_PAGES"
          :key="item.url"
          class="dvpl-frsc"
          @click="handleLinkToPage(item.url, item.name)"
        >
          <component :is="mapIconComponent(item.name)" :useCurrentColor="false" :width="32" :height="32" />
          <span>{{ item.name }}</span>
          <icon-right class="dvpl-pages-list-btn" />
        </li>
      </ul>
      <!-- 敬请期待 -->
      <div class="dvpl-pages-message">更多能耗跟踪，敬请期待</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
// 工具方法
import { openBlankUrl } from '@/utils/index';
// 组件
import { IconWarningOutline, IconEmsEnergyAnalysis, IconRight } from '@arco-iconbox/vue-te';
import DaSubTitle from '../da-sub-title/da-sub-title.vue';
// 服务 api
import departmentAssessmentService from '../department-assessment.service';
import { DVPL_VIEW_PAGES, DVPL_EPageType, DVPL_SESSION_KEY } from './da-view-page-link.api';
import { Common_ETimeUnit, Common_ETreeType } from '@/services/common/common-api';
/**
 * 根据类型获取图标
 * @param {string} type
 * @returns {any}
 */
const mapIconComponent = (type: string): any => {
  let component;
  switch (type) {
    case DVPL_EPageType.科室能耗分析:
      component = IconEmsEnergyAnalysis;
      break;
  }
  return component;
};
/**
 * 跳转至展示页面
 * @param {string} url 跳转地址
 * @param {string} type 类型
 */
const handleLinkToPage = (url: string, type: string) => {
  let params = {};
  // 根据类型,做不同处理
  switch (type) {
    case DVPL_EPageType.科室能耗分析:
      params = {
        ...params,
        timeUnit: Common_ETimeUnit.天,
        treeType: Common_ETreeType.科室,
      };
      window.sessionStorage.setItem(DVPL_SESSION_KEY, JSON.stringify(params));
      break;
  }
  openBlankUrl(url);
  departmentAssessmentService.handleOperationSave(departmentAssessmentService.operationConfig.showFlag, true);
};
</script>
<style lang="less" scoped>
.da-view-page-link {
  padding: 20px;
  background: var(--te-bg-color);
  box-shadow: var(--te-box-shadow-lighter);

  .dvpl-frsc {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }

  .dvpl-title {
    svg {
      margin: 0 4px 0 16px;
      color: var(--te-text-color-secondary);
    }

    p {
      color: var(--te-text-color-secondary);
      font-family: PingFang SC;
      font-size: var(--te-font-size-b14);
      line-height: 22px;
    }
  }

  .dvpl-pages {
    gap: 16px;
    margin-top: 24px;

    .dvpl-pages-list li {
      width: 400px;
      height: 64px;
      padding: 16px;
      border-radius: 4px;
      border: 1px solid var(--te-border-color-light);
      cursor: pointer;
      box-sizing: border-box;

      > span {
        display: inline-block;
        color: var(--te-text-color-regular);
        font-weight: 500;
        font-size: var(--te-font-size-h16);
        line-height: 24px;
        margin: 0 196px 0 12px;
      }

      .dvpl-pages-list-btn {
        padding: 9px;
        width: 32px;
        height: 32px;
      }

      &:hover {
        background-color: var(--te-fill-color-light);
        transition: all 233ms;
      }
    }

    .dvpl-pages-message {
      flex: 1;
      height: 64px;
      line-height: 64px;
      border-radius: 4px;
      border: 1px solid var(--te-border-color-light);
      box-sizing: border-box;
      background: var(--te-fill-color-lighter);
      text-align: center;
      color: var(--te-text-color-placeholder);
      font-size: var(--te-font-size-h16);
    }
  }
}
</style>
