<template>
  <div class="energy-accounting-deviation">
    <h5>能耗预核算偏差</h5>
    <main>
      <!-- 搜索表单 -->
      <EadSearchBar></EadSearchBar>
      <!-- 时间段 -->
      <div class="ead-date-scope">{{ timeStr }}</div>
      <!-- 脑图 -->
      <EadHome></EadHome>
    </main>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// 组件
import EadSearchBar from './ead-search-bar/ead-search-bar.vue';
import EadHome from './ead-home/ead-home.vue';
// 数据服务
import eadBaseService from './energy-accounting-deviation.service';
// 用于触发可观察对象的takeUntil
const destroy$ = new Subject<void>();
// 查询时间范围-时间段文本
const timeStr = ref<string>('');
/**
 * 初始化，订阅时间段数据
 */
onMounted(() => {
  eadBaseService.eadTimeStr$.pipe(takeUntil(destroy$)).subscribe((v: string) => {
    timeStr.value = v ?? '';
  });
});
/**
 * 组件销毁
 */
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
.energy-accounting-deviation {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  background-color: rgba(240, 244, 249, 1);

  > h5 {
    font-size: 16px;
  }

  > main {
    flex: auto;
    min-height: 777px;
    overflow: hidden;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    border-radius: 2px;

    > .ead-date-scope {
      font-size: 14px;
      height: 20px;
      color: var(--color-text-title);
      font-weight: 500;
      margin: 11px 0;
    }
  }
}
</style>
