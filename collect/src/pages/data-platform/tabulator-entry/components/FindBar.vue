<script setup lang="ts">
// 查找替换条：关键词 + 命中计数 + 上一个/下一个 + 替换（单处/全部）+ 大小写/整格匹配选项
// 匹配与替换全部委托 Univer 的 FTextFinder（见 useEntryFind），本组件只做输入与展示。
import type { EntryFind } from '../useEntryFind';

defineOptions({ name: 'FindBar' });

const props = defineProps<{ find: EntryFind }>();
const {
  findText,
  replaceText,
  matchCase,
  matchWhole,
  hitCount,
  hitIndex,
  busy,
  close,
  recompute,
  findNext,
  replaceOne,
  replaceAll,
} = props.find;
</script>

<template>
  <div class="fb-bar">
    <el-input
      v-model="findText"
      placeholder="查找内容（回车即查）"
      size="small"
      clearable
      style="width: 220px"
      @change="recompute"
      @keyup.enter="findNext"
    />
    <span class="fb-count">{{ hitCount ? `${hitIndex + 1} / ${hitCount}` : '无命中' }}</span>
    <el-button size="small" :loading="busy" @click="recompute">查找</el-button>
    <el-button size="small" :disabled="!hitCount" @click="findNext">下一个</el-button>
    <el-divider direction="vertical" />
    <el-input
      v-model="replaceText"
      placeholder="替换为"
      size="small"
      style="width: 180px"
      @keyup.enter="replaceOne"
    />
    <el-button size="small" :disabled="!hitCount" @click="replaceOne">替换</el-button>
    <el-button size="small" :disabled="!hitCount" @click="replaceAll">全部替换</el-button>
    <el-divider direction="vertical" />
    <el-checkbox v-model="matchCase" size="small" @change="recompute">区分大小写</el-checkbox>
    <el-checkbox v-model="matchWhole" size="small" @change="recompute">整格匹配</el-checkbox>
    <el-button size="small" text class="fb-close" @click="close">关闭</el-button>
  </div>
</template>

<style scoped>
.fb-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px 10px;
  margin-bottom: 10px;
  border: 1px solid var(--ue-border);
  border-radius: 10px;
  background: var(--ue-panel);
}
.fb-count {
  font-size: 12px;
  color: var(--ue-sub);
  min-width: 56px;
  font-variant-numeric: tabular-nums;
}
.fb-close {
  margin-left: auto;
}
</style>
