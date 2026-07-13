<template>
  <div class="te-project-select-demo">
    <header class="tps-demo-header">
      <h3>te-project-select — 项目选择器</h3>
      <p>分发器：DROP_DOWN_LIST（下拉列表）/ MODAL_POP_UP_WINDOW（弹层），含 projectHook</p>
    </header>
    <div class="tps-demo-stage">
      <el-card>
        <template #header>
          <span>下拉列表（DROP_DOWN_LIST）</span>
          <el-tag style="margin-left: 8px">多选</el-tag>
        </template>
        <te-project-select v-model="multi" :multiple="true" />
      </el-card>

      <el-card>
        <template #header>
          <span>弹层（MODAL_POP_UP_WINDOW）</span>
          <el-tag :style="{ marginLeft: '8px' }">单选</el-tag>
        </template>
        <el-button type="primary" @click="dialogVisible = true">打开项目选择弹层</el-button>
        <te-project-select v-model="single" :multiple="false" />
        <p class="tps-tip">已选: {{ displaySingle }}</p>
      </el-card>

      <el-card>
        <template #header><span>projectHook 用法演示</span></template>
        <el-button @click="onHook">调用 projectHook</el-button>
        <p class="tps-tip">查看控制台</p>
      </el-card>

      <el-card>
        <template #header><span>已选汇总</span></template>
        <pre class="tps-pre">{{ JSON.stringify({ multi, single }, null, 2) }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElCard, ElButton, ElTag } from 'element-plus';
import { TeProjectSelect, projectHook } from '../../../components/te-project-select';
import { getProjectById, mockProjects } from '../../../components/_mock/project';

const multi = ref<string[]>(['p-1', 'p-3']);
const single = ref<any>(['p-4']);
const dialogVisible = ref(false);

const displaySingle = computed(() => single.value.map((id: any) => getProjectById(id)?.name).join(', '));

const onHook = () => {
  const { allProjects, initFlag } = projectHook({
    searchValue: ref('上海'),
    multiple: ref(true),
    needAllProjects: ref(true),
    tenantId: 'demo',
  });
  console.log(
    '[hook] initFlag:',
    initFlag.value,
    'allProjects:',
    allProjects.value,
    'mockProjects:',
    mockProjects.length,
  );
};

defineOptions({ name: 'TeProjectSelectDemo' });
</script>

<style lang="less" scoped>
.te-project-select-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tps-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;
    h3 {
      margin: 0 0 4px;
      font-size: 16px;
    }
    p {
      margin: 0;
      color: #909399;
      font-size: 12px;
    }
  }

  .tps-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tps-pre {
    margin: 8px 0 0;
    padding: 8px 12px;
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    white-space: pre-wrap;
  }
  .tps-tip {
    color: #909399;
    font-size: 12px;
    margin: 8px 0 0;
  }
}
</style>
