<script setup lang="ts">
// 查找替换条（Ctrl+F 或工具栏按钮唤出）
import type { GridFindReplace } from '../hooks/useGridFindReplace';

defineOptions({ name: 'GridFindBar' });
const props = defineProps<{ find: GridFindReplace }>();

const {
  findVisible,
  findText,
  replaceText,
  findScope,
  findCase,
  findWhole,
  findMatches,
  findIdx,
  findNext,
  replaceOne,
  replaceAll,
} = props.find;
</script>

<template>
  <div v-if="findVisible" class="dt-findbar">
    <span>查找</span>
    <el-input v-model="findText" style="width: 150px" placeholder="内容…" @keyup.enter="findNext" />
    <span>替换</span>
    <el-input v-model="replaceText" style="width: 150px" placeholder="替换为…" />
    <el-select v-model="findScope" style="width: 110px">
      <el-option label="全部列" value="all" />
      <el-option label="当前列" value="col" />
    </el-select>
    <el-checkbox v-model="findCase">区分大小写</el-checkbox>
    <el-checkbox v-model="findWhole">整格匹配</el-checkbox>
    <el-button size="small" @click="findNext">查找下一个</el-button>
    <el-button size="small" @click="replaceOne">替换</el-button>
    <el-button size="small" type="primary" @click="replaceAll">全部替换</el-button>
    <span class="find-count">命中 {{ findMatches.length }} 处 / 第 {{ findIdx >= 0 ? findIdx + 1 : '-' }} 个</span>
    <el-button size="small" text @click="findVisible = false">✕</el-button>
  </div>
</template>

<style scoped>
.dt-findbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: var(--dt-panel);
  border: 1px solid var(--dt-border);
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--dt-sub);
}
.find-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--dt-primary);
}
</style>
