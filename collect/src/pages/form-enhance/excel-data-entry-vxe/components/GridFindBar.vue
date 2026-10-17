<script setup lang="ts">
// 查找替换条（Ctrl+F 或工具栏按钮唤出）：范围（全部列/当前列/当前选区）+ 大小写 + 整格 + 正则 + 命中列表
import { ref } from 'vue';
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
  findRegex,
  regexError,
  findMatches,
  findHits,
  findIdx,
  findNext,
  jumpToHit,
  replaceOne,
  replaceAll,
} = props.find;

const showHits = ref(false);
</script>

<template>
  <div v-if="findVisible" class="dt-findbar">
    <span>查找</span>
    <el-input v-model="findText" style="width: 150px" placeholder="内容 / 正则…" @keyup.enter="findNext" />
    <span>替换</span>
    <el-input v-model="replaceText" style="width: 150px" placeholder="替换为…" />
    <el-select v-model="findScope" style="width: 118px">
      <el-option label="全部列" value="all" />
      <el-option label="当前列" value="col" />
      <el-option label="当前选区" value="sel" />
    </el-select>
    <el-checkbox v-model="findCase">区分大小写</el-checkbox>
    <el-checkbox v-model="findWhole">整格匹配</el-checkbox>
    <el-checkbox v-model="findRegex">正则</el-checkbox>
    <el-button size="small" @click="findNext">查找下一个</el-button>
    <el-button size="small" @click="replaceOne">替换</el-button>
    <el-button size="small" type="primary" @click="replaceAll">全部替换</el-button>
    <el-button size="small" :disabled="!findHits.length" @click="showHits = !showHits">
      命中列表 ({{ findHits.length }})
    </el-button>
    <span class="find-count">
      <template v-if="regexError">{{ regexError }}</template>
      <template v-else>命中 {{ findMatches.length }} 处 / 第 {{ findIdx >= 0 ? findIdx + 1 : '-' }} 个</template>
    </span>
    <el-button size="small" text @click="findVisible = false">✕</el-button>

    <!-- 命中明细：点击直接跳转（大表里"下一个"逐个点太慢） -->
    <div v-if="showHits && findHits.length" class="find-hits">
      <div
        v-for="(h, i) in findHits"
        :key="h.rowId + h.field"
        class="find-hit"
        :class="{ active: i === findIdx }"
        @click="jumpToHit(i)"
      >
        <span class="fh-no">#{{ i + 1 }}</span>
        <span class="fh-row">{{ h.rowLabel || '—' }}</span>
        <span class="fh-col">{{ h.colLabel }}</span>
        <span class="fh-val">{{ h.value }}</span>
      </div>
      <div v-if="findMatches.length > findHits.length" class="find-hit more">
        仅显示前 {{ findHits.length }} 条，共 {{ findMatches.length }} 处
      </div>
    </div>
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
.find-hits {
  width: 100%;
  max-height: 190px;
  overflow: auto;
  border-top: 1px dashed var(--dt-border);
  padding-top: 6px;
  margin-top: 2px;
}
.find-hit {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
.find-hit:hover {
  background: var(--dt-hover);
}
.find-hit.active {
  background: var(--dt-primary-soft);
  color: var(--dt-primary);
}
.find-hit .fh-no {
  width: 40px;
  color: var(--dt-sub);
  font-variant-numeric: tabular-nums;
}
.find-hit .fh-row {
  width: 90px;
  font-weight: 600;
  color: var(--dt-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.find-hit .fh-col {
  width: 90px;
  color: var(--dt-sub);
}
.find-hit .fh-val {
  flex: 1;
  color: var(--dt-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.find-hit.more {
  color: var(--dt-sub);
  cursor: default;
}
</style>
