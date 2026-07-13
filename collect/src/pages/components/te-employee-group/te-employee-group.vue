<template>
  <div class="te-employee-group-demo">
    <header class="teg-demo-header">
      <h3>te-employee-group — 员工组选择器</h3>
      <p>支持多选/单选、搜索、按成员过滤、API 策略切换、templateCodeToId 转换</p>
    </header>
    <div class="teg-demo-stage">
      <el-card>
        <template #header><span>多选模式</span></template>
        <te-employee-group v-model="multiValue" :multiple="true" />
        <pre class="teg-pre">已选: {{ multiDisplay }}</pre>
      </el-card>

      <el-card>
        <template #header><span>按成员过滤（仅显示包含 u-1 / u-2 的组）</span></template>
        <te-employee-group v-model="filteredValue" :filter-member-ids="['u-1', 'u-2']" />
        <pre class="teg-pre">已选: {{ filteredDisplay }}</pre>
      </el-card>

      <el-card>
        <template #header><span>API 策略 / 模板转换演示</span></template>
        <el-space wrap>
          <el-button @click="onStandard">standard 策略</el-button>
          <el-button @click="onCloud">cloud 策略</el-button>
          <el-button type="primary" @click="onTemplateCode">templateCode → id</el-button>
        </el-space>
        <p class="teg-tip">查看控制台输出</p>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElCard, ElButton, ElSpace } from 'element-plus';
import { TeEmployeeGroup, getEmployeeGroupApiByMode, templateCodeToId } from '../../../components/te-employee-group';
import { mockEmployeeGroups } from '../../../components/_mock/employee-group';

const multiValue = ref<string[]>(['g-1', 'g-2']);
const filteredValue = ref<string[]>([]);

const multiDisplay = computed(() => multiValue.value.map((id) => mockEmployeeGroups.find((g) => g.id === id)?.name).join(', '));
const filteredDisplay = computed(() => filteredValue.value.map((id) => mockEmployeeGroups.find((g) => g.id === id)?.name).join(', '));

const onStandard = async () => {
  const api = getEmployeeGroupApiByMode('standard');
  const list = await api.loadByMemberIds(['u-1', 'u-2']);
  console.log('[standard] loadByMemberIds:', list);
};
const onCloud = async () => {
  const api = getEmployeeGroupApiByMode('cloud');
  const list = await api.loadByMemberIds(['u-1']);
  console.log('[cloud] loadByMemberIds:', list);
};
const onTemplateCode = async () => {
  const id = await templateCodeToId('dev_team');
  console.log('templateCode dev_team → id:', id);
};

defineOptions({ name: 'TeEmployeeGroupDemo' });
</script>

<style lang="less" scoped>
.te-employee-group-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .teg-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;
    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .teg-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .teg-pre {
    margin: 8px 0 0;
    padding: 8px 12px;
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    white-space: pre-wrap;
  }
  .teg-tip { color: #909399; font-size: 12px; margin: 8px 0 0; }
}
</style>
