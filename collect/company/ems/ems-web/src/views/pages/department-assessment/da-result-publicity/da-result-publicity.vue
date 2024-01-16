<template>
  <div class="da-result-publicity">
    <DaSubTitle :sort="5" title="公示科室考核结果"></DaSubTitle>
    <!-- 查询表单 -->
    <DspSearchBar></DspSearchBar>
    <!-- 科室考核排行榜 -->
    <DspRank></DspRank>
    <!-- 科室考核明细 -->
    <DspDetail></DspDetail>
  </div>
</template>
<script lang="ts" setup>
// 组件
import DaSubTitle from '../da-sub-title/da-sub-title.vue';
import DspSearchBar from './dsp-search-bar/dsp-search-bar.vue';
import DspRank from './dsp-rank/dsp-rank.vue';
import DspDetail from './dsp-detail/dsp-detail.vue';
</script>
<style lang="less" scoped>
.da-result-publicity {
  padding: 20px;
  background-color: var(--te-bg-color);
}
</style>
