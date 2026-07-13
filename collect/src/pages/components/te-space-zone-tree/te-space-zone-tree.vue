<template>
  <div class="te-space-zone-tree-demo">
    <header class="tszt-demo-header">
      <h3>te-space-zone-tree — 空间分区树</h3>
      <p>懒加载树 + 搜索 + 节点点击 + 右侧内容容器 + 拖拽宽度（260 / 320 / no-right）</p>
    </header>
    <div class="tszt-demo-stage">
      <el-card>
        <template #header><span>标准（带右侧内容 + 拖拽）</span></template>
        <div class="tszt-stage-wrap">
          <te-space-zone-tree
            type-code="园区分区"
            @node-click="onClick"
          >
            <template #right-content>
              <div v-if="current">
                <h4>当前选中</h4>
                <p>ID: <el-tag>{{ current.id || '(全部分区)' }}</el-tag></p>
                <p>名称: <el-tag type="success">{{ current.name }}</el-tag></p>
              </div>
              <el-empty v-else description="请从左侧选择分区" :image-size="80" />
            </template>
          </te-space-zone-tree>
        </div>
      </el-card>

      <el-card>
        <template #header><span>无右侧内容（仅树）</span></template>
        <div class="tszt-stage-wrap" style="height: 280px">
          <te-space-zone-tree :show-right-content="false" @node-click="onClick" />
        </div>
      </el-card>

      <el-card>
        <template #header><span>事件日志</span></template>
        <pre class="tszt-pre">{{ JSON.stringify(current, null, 2) }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElCard, ElTag, ElEmpty } from 'element-plus';
import { TeSpaceZoneTree } from '../../../components/te-space-zone-tree';

const current = ref<{ id: string; name: string } | null>(null);

const onClick = (data: any) => {
  current.value = data;
};

defineOptions({ name: 'TeSpaceZoneTreeDemo' });
</script>

<style lang="less" scoped>
.te-space-zone-tree-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tszt-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;
    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tszt-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tszt-stage-wrap {
    height: 360px;
  }

  .tszt-pre {
    margin: 8px 0 0;
    padding: 8px 12px;
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    white-space: pre-wrap;
  }
}
</style>
