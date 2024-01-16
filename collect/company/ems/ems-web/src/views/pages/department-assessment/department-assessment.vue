<template>
  <div class="department-assessment">
    <h5>科室考核</h5>
    <main>
      <!-- 第一至三项---处理配置 -->
      <DaParamsConfigure></DaParamsConfigure>
      <!-- 跳转展示页面 -->
      <DaViewPageLink></DaViewPageLink>
      <!-- 结果展示 -->
      <DaResultPublicity></DaResultPublicity>
    </main>
  </div>
</template>
<script lang="ts" setup>
// 组件
import DaParamsConfigure from './da-params-configure/da-params-configure.vue';
import DaViewPageLink from './da-view-page-link/da-view-page-link.vue';
import DaResultPublicity from './da-result-publicity/da-result-publicity.vue';
// 数据服务
import departmentAssessmentService from './department-assessment.service';
// 查询配置信息
departmentAssessmentService.initConfigInfo();
</script>
<style lang="less" scoped>
.department-assessment {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  user-select: none;

  > h5 {
    color: rgb(0, 0, 0);
    font-size: var(--te-font-size-h16);
  }

  > main {
    flex: auto;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    border-radius: 2px;
    background: var(--te-bg-color-page);
    padding: 0;
    gap: 16px;
    box-shadow: none;
  }
}
</style>
