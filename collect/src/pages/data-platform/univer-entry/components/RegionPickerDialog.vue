<script setup lang="ts">
// 院区选择弹框：点击「院区」列单元格后打开，单选叶子院区，确定后把
// { name, id, code } 交回页面层写入单元格（v 存 name，custom 存完整对象）。
// 数据源是 region-data.ts 的 mock 树；接真实接口时只换那份数据，本组件不用动。
//
// 视觉约定：根节点同时挂 ue-dlg / bi-dlg，才能吃到 bi-entry.less 里那套 --bi-* 令牌
// （弹框被 teleport 到 body，拿不到 .ue-page 上的变量继承）；否则会退回 Element 默认观感。
import { computed, nextTick, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { LocationInformation, Search } from '@element-plus/icons-vue';
import { REGION_TREE, type RegionNode, type RegionValue } from '../region-data';

defineOptions({ name: 'RegionPickerDialog' });

const props = defineProps<{
  visible: boolean;
  /** 当前单元格已选的院区，用于打开时回显 */
  current?: RegionValue | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  /** null 表示清空该单元格 */
  (e: 'confirm', value: RegionValue | null): void;
}>();

const keyword = ref('');
const selected = ref<RegionValue | null>(null);
const treeRef = ref();
const TREE_PROPS = { children: 'children', label: 'name' };

/** 院区总数（分组标题上展示规模，避免空壳弹框） */
const LEAF_COUNT = (() => {
  let n = 0;
  const walk = (nodes: RegionNode[]): void =>
    nodes.forEach((x) => {
      if (x.children?.length) walk(x.children);
      else n += 1;
    });
  walk(REGION_TREE);
  return n;
})();

/** 展开策略：只展开"当前选中项所在片区"，没有选中时展开第一个片区（四个片区全展开太像一堵墙） */
const expandedKeys = ref<(string | number)[]>([]);
const groupKeyOf = (id: string | undefined): string => {
  if (!id) return REGION_TREE[0]?.id ?? '';
  const hit = REGION_TREE.find((g) => g.children?.some((c) => c.id === id));
  return hit?.id ?? REGION_TREE[0]?.id ?? '';
};

/** 搜索同时匹配名称与编码（分组节点也参与匹配，才能把命中的叶子露出来） */
const filterNode = (value: unknown, data: unknown): boolean => {
  const key = String(value ?? '').toLowerCase();
  if (!key) return true;
  const node = data as RegionNode;
  return node.name.toLowerCase().includes(key) || node.code.toLowerCase().includes(key);
};

watch(keyword, (v) => treeRef.value?.filter(v));

watch(
  () => props.visible,
  async (v) => {
    if (!v) return;
    keyword.value = '';
    selected.value = props.current ? { ...props.current } : null;
    expandedKeys.value = [groupKeyOf(selected.value?.id)];
    await nextTick();
    treeRef.value?.filter('');
    // 有旧值就高亮它；没有则清掉上次残留的高亮
    treeRef.value?.setCurrentKey(selected.value?.id ?? null);
  },
);

/** 分组节点只用于展开，不可选；叶子才是可选院区 */
const onNodeClick = (data: RegionNode) => {
  if (data.children?.length) {
    treeRef.value?.setCurrentKey(selected.value?.id ?? null);
    return;
  }
  selected.value = { name: data.name, id: data.id, code: data.code };
};

const close = () => emit('update:visible', false);

const confirm = () => {
  if (!selected.value) {
    ElMessage.warning('请先选择一个院区');
    return;
  }
  emit('confirm', { ...selected.value });
  close();
};

/** 清空院区值：连同自定义数据一起清掉，让必填校验能正常报出来 */
const clear = () => {
  emit('confirm', null);
  close();
};

/** 底部"确定"是否可用：没选任何院区时置灰，比点了再弹提示更省事 */
const canConfirm = computed(() => !!selected.value);
</script>

<template>
  <el-dialog
    :model-value="visible"
    width="460px"
    align-center
    class="ue-dlg bi-dlg rpd-dialog"
    :show-close="true"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
  >
    <template #header>
      <div class="rpd-head">
        <span class="rpd-head__icon"><LocationInformation /></span>
        <div class="rpd-head__text">
          <h4>选择院区</h4>
          <p>单选一个院区 · 回填名称，同时保存 id 与 code · 共 {{ LEAF_COUNT }} 个</p>
        </div>
      </div>
    </template>

    <div class="rpd">
      <el-input
        v-model="keyword"
        :prefix-icon="Search"
        clearable
        placeholder="搜索院区名称 / 编码"
        class="rpd-search"
      />

      <div class="rpd-treebox">
        <el-tree
          ref="treeRef"
          :data="REGION_TREE"
          :props="TREE_PROPS"
          node-key="id"
          :filter-node-method="filterNode"
          :default-expanded-keys="expandedKeys"
          :expand-on-click-node="true"
          highlight-current
          empty-text="没有匹配的院区"
          class="rpd-tree"
          @node-click="onNodeClick"
        >
          <template #default="{ data }">
            <span class="rpd-node" :class="{ 'is-group': !!data.children?.length }">
              <span class="rpd-name">{{ data.name }}</span>
              <span v-if="data.children?.length" class="rpd-count">{{ data.children.length }}</span>
              <span v-else class="rpd-code">{{ data.code }}</span>
            </span>
          </template>
        </el-tree>
      </div>

      <div class="rpd-current" :class="{ 'is-empty': !selected }">
        <span class="rpd-current__label">已选院区</span>
        <template v-if="selected">
          <span class="rpd-current__name">{{ selected.name }}</span>
          <span class="rpd-chip">{{ selected.code }}</span>
          <span class="rpd-current__id">{{ selected.id }}</span>
        </template>
        <span v-else class="rpd-current__placeholder">尚未选择</span>
      </div>
    </div>

    <template #footer>
      <div class="rpd-foot">
        <el-button v-if="selected" size="small" text type="danger" @click="clear">清除已选</el-button>
        <span class="rpd-foot__spacer" />
        <el-button size="small" @click="close">取消</el-button>
        <el-button size="small" type="primary" :disabled="!canConfirm" @click="confirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 弹框本体：标题栏/内容区/底栏的留白与分割线统一在这里收口，
   Element 默认的 16px 均匀内边距在这种"搜索 + 列表 + 摘要"的三段式里显得很挤。 */
.rpd-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--bi-border-soft, #eef0f4);
}
.rpd-dialog :deep(.el-dialog__body) {
  padding: 14px 20px 6px;
}
.rpd-dialog :deep(.el-dialog__footer) {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--bi-border-soft, #eef0f4);
}
.rpd-dialog :deep(.el-dialog__headerbtn) {
  top: 14px;
  right: 14px;
}

/* ---------- 标题 ---------- */
.rpd-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rpd-head__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 8px;
  color: var(--bi-primary, #2b5cf6);
  background: var(--bi-primary-soft, #eef2ff);
  font-size: 16px;
}
.rpd-head__text {
  min-width: 0;
}
.rpd-head__text h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: var(--bi-text, #1d2129);
}
.rpd-head__text p {
  margin: 2px 0 0;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--bi-sub, #86909c);
}

/* ---------- 主体 ---------- */
.rpd {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rpd-search :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--bi-border, #e5e7ec) inset;
  background: var(--bi-input-bg, #fff);
}
.rpd-search :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--bi-primary, #2b5cf6) inset;
}

.rpd-treebox {
  /* 高度按"4 个片区标题 + 展开片区的 6 个院区"这一屏给定值（10 行 × 33px + 内边距），
     避免默认只展开第一个片区时最后一行被裁掉半截 */
  height: 342px;
  overflow: auto;
  padding: 4px;
  border: 1px solid var(--bi-border, #e5e7ec);
  border-radius: 8px;
  background: var(--bi-panel, #fff);
}

/* 树节点：行高 32、圆角、hover 浅底、选中左侧色条 —— 比 Element 默认的整行深蓝更克制 */
.rpd-tree {
  --el-tree-node-hover-bg-color: var(--bi-hover, #f7f9fc);
  background: transparent;
  color: var(--bi-text, #1d2129);
}
.rpd-tree :deep(.el-tree-node__content) {
  height: 32px;
  margin-bottom: 1px;
  padding-right: 8px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}
.rpd-tree :deep(.el-tree-node__expand-icon) {
  font-size: 12px;
  color: var(--bi-sub, #86909c);
}
.rpd-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--bi-select, #e6effd);
  box-shadow: inset 2px 0 0 var(--bi-primary, #2b5cf6);
}

.rpd-node {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 12.5px;
  line-height: 1;
}
.rpd-node.is-group {
  font-weight: 600;
}
.rpd-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--bi-text, #1d2129);
}
.rpd-node.is-group .rpd-name {
  color: var(--bi-text, #1d2129);
}
/* 编码药丸：等宽字体 + 浅底，和名称在视觉上分层，扫列时不会串行 */
.rpd-code,
.rpd-count {
  margin-left: auto;
  flex: none;
  padding: 0 6px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10.5px;
  line-height: 1;
  color: var(--bi-sub, #86909c);
  background: var(--bi-head-bg, #f7f8fa);
}
.rpd-count {
  min-width: 16px;
  justify-content: center;
}

/* ---------- 已选摘要 ---------- */
.rpd-current {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--bi-border-soft, #eef0f4);
  border-radius: 8px;
  background: var(--bi-head-bg, #f7f8fa);
  font-size: 12.5px;
}
.rpd-current.is-empty {
  border-style: dashed;
  background: transparent;
}
.rpd-current__label {
  flex: none;
  color: var(--bi-sub, #86909c);
}
.rpd-current__name {
  font-weight: 600;
  color: var(--bi-text, #1d2129);
}
.rpd-chip {
  flex: none;
  padding: 0 6px;
  height: 17px;
  display: inline-flex;
  align-items: center;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10.5px;
  line-height: 1;
  color: var(--bi-primary, #2b5cf6);
  background: var(--bi-primary-soft, #eef2ff);
}
.rpd-current__id {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10.5px;
  color: var(--bi-sub, #86909c);
}
.rpd-current__placeholder {
  color: var(--bi-sub, #86909c);
}

/* ---------- 底栏 ---------- */
.rpd-foot {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rpd-foot__spacer {
  flex: 1;
}
</style>
