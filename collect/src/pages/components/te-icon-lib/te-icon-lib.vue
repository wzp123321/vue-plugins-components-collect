<template>
  <div class="te-icon-lib-demo">
    <header class="til-demo-header">
      <h3>te-icon-lib — 图标库选择器</h3>
      <p>已选缩略图列表 + 弹层内分类 tab + 搜索 + 上传 + 大图预览</p>
    </header>
    <div class="til-demo-stage">
      <el-card>
        <template #header><span>默认（限制 9）</span></template>
        <te-icon-lib v-model="selected" :limit="9" />
        <pre class="til-pre">已选: {{ selected.map(s => s.name).join(', ') || '空' }}</pre>
      </el-card>

      <el-card>
        <template #header><span>限制 4 张</span></template>
        <te-icon-lib v-model="selected2" :limit="4" />
        <pre class="til-pre">已选: {{ selected2.map(s => s.name).join(', ') || '空' }}</pre>
      </el-card>

      <el-card>
        <template #header><span>purposeEq 过滤（只显示目的为 safety 的图标）</span></template>
        <p class="til-tip">当前 mock 都是 default 用途，可作为占位验证 props 传递</p>
        <te-icon-lib v-model="selected3" :limit="9" purpose-eq="default" />
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElCard } from 'element-plus';
import { TeIconLib, type MockIcon } from '../../../components/te-icon-lib';

const selected = ref<MockIcon[]>([
  { id: 'i-1', name: '门禁', url: '', categoryId: 'c-1', purpose: 'default' },
]);
const selected2 = ref<MockIcon[]>([]);
const selected3 = ref<MockIcon[]>([]);

defineOptions({ name: 'TeIconLibDemo' });
</script>

<style lang="less" scoped>
.te-icon-lib-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .til-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;
    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .til-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .til-pre {
    margin: 8px 0 0;
    padding: 8px 12px;
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    white-space: pre-wrap;
  }
  .til-tip { color: #909399; font-size: 12px; margin: 0 0 8px; }
}
</style>
