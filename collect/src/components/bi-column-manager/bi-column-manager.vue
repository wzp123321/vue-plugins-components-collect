<!--
  列设置抽屉（三套 BI 录入台共用 · 列表级管理）
  ============================================================================
  职责：整张表的列清单——增列、移序、显隐、冻结、必填，以及每列的「配置」入口。
  与「单列配置抽屉」（components/bi-column-drawer）的分工：
    · 本抽屉 = 列表级，开关类改动即时生效（每次都是一条独立操作，进各自撤销栈）；
    · 单列配置 = 草稿 + 确定，管类型专属项与校验规则。
  引擎差异只允许走 caps（frozen / retype / add），不做假统一：
    · frozen：Univer 只支持冻结首列，不给这个开关 → false；
    · retype：vxe 版改类型要连带转数据，只能在「配置」里做 → false；
    · add：vxe 的新增列在工具栏，VTable 的列名由引擎生成 → 各自为 false。

  协作：各引擎把 colDef 映射成 :cols（BiColLike）传进来，事件里做自己的副作用
  （撤销栈 / 重校验 / 整表重建），本组件只管视觉与交互，不碰任何引擎 API。
-->
<template>
  <el-drawer
    :model-value="visible"
    size="560px"
    class="bi-dlg"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
    @close="close"
  >
    <template #header>
      <div class="bcm-head">
        <span class="bcm-head-title">列设置</span>
        <span class="bcm-head-meta">
          {{ cols.length }} 列<template v-if="hiddenCount"> · <em>{{ hiddenCount }} 列已隐藏</em></template>
        </span>
      </div>
    </template>

    <div class="bcm">
      <!-- ===== 新增列（caps.add） ===== -->
      <section v-if="caps.add" class="bcm-add">
        <div class="bcm-add-title">新增列</div>
        <div class="bcm-add-row">
          <el-input v-model="addForm.label" size="small" placeholder="新列名" class="bcm-add-name" />
          <el-select v-model="addForm.type" size="small" class="bcm-add-type">
            <el-option v-for="t in TYPES" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
          <el-checkbox v-model="addForm.required" size="small">必填</el-checkbox>
          <el-button size="small" type="primary" :disabled="!addForm.label.trim()" @click="onAdd">添加</el-button>
        </div>
        <el-input
          v-if="addForm.type === 'select'"
          v-model="addForm.options"
          size="small"
          placeholder="下拉选项，用逗号分隔，如：在职,试用期,离职"
        />
      </section>

      <!-- ===== 引擎专属工具（列模板等） ===== -->
      <section v-if="$slots.tools" class="bcm-tools">
        <slot name="tools" />
      </section>

      <!-- ===== 列清单 ===== -->
      <template v-if="cols.length">
        <div class="bcm-list">
          <div class="bcm-list-head">
            <span class="bcm-idx">#</span>
            <span>列名</span>
            <span>类型</span>
            <span>状态</span>
            <span class="bcm-acts-head">操作</span>
          </div>

          <div
            v-for="(c, i) in cols"
            :key="c.field"
            class="bcm-row"
            :class="{ 'is-off': c.visible === false }"
          >
            <span class="bcm-idx">{{ i + 1 }}</span>

            <el-input
              :model-value="c.label"
              size="small"
              class="bcm-name"
              maxlength="20"
              @change="(v: string) => emit('rename', c.field, v)"
            />

            <el-select
              v-if="caps.retype"
              :model-value="c.type"
              size="small"
              class="bcm-type"
              @change="(v: ColType) => emit('retype', c.field, v)"
            >
              <el-option v-for="t in TYPES" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
            <span v-else class="bcm-type-static">{{ typeText(c.type) }}</span>

            <div class="bcm-flags">
              <button
                type="button"
                class="bcm-flag bcm-flag--req"
                :class="{ 'is-on': c.required }"
                title="必填：空值提交时报错"
                @click="emit('toggle', c.field, 'required')"
              >
                必
              </button>
              <button
                type="button"
                class="bcm-flag bcm-flag--vis"
                :class="{ 'is-on': c.visible !== false }"
                title="显示 / 隐藏该列"
                @click="emit('toggle', c.field, 'visible')"
              >
                {{ c.visible === false ? '隐' : '显' }}
              </button>
              <button
                v-if="caps.frozen"
                type="button"
                class="bcm-flag"
                :class="{ 'is-on': !!c.frozen }"
                title="冻结该列"
                @click="emit('toggle', c.field, 'frozen')"
              >
                冻
              </button>
              <span v-if="hasRules(c)" class="bcm-flag bcm-flag--rule" title="已配置校验规则">验</span>
            </div>

            <div class="bcm-acts">
              <el-button text size="small" :icon="ArrowUp" title="上移" :disabled="i === 0" @click="emit('move', i, -1)" />
              <el-button
                text
                size="small"
                :icon="ArrowDown"
                title="下移"
                :disabled="i === cols.length - 1"
                @click="emit('move', i, 1)"
              />
              <el-button text size="small" :icon="Setting" title="配置该列" @click="emit('config', c.field)" />
              <el-button
                v-if="caps.duplicate"
                text
                size="small"
                :icon="CopyDocument"
                title="复制列（克隆该列到右侧）"
                @click="emit('duplicate', c.field)"
              />
              <el-button
                text
                size="small"
                type="danger"
                :icon="Delete"
                title="删除该列"
                @click="emit('remove', c.field)"
              />
            </div>
          </div>
        </div>

        <p class="bcm-foot">
          开关即时生效；类型专属项与校验规则点「配置」在单列抽屉里改。
          <template v-if="hiddenCount">隐藏列数据仍在，导出按可见列输出。</template>
        </p>
      </template>

      <el-empty v-else description="还没有任何列" :image-size="70" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowDown, ArrowUp, CopyDocument, Delete, Setting } from '@element-plus/icons-vue';
import type { BiColLike, ColType } from '@/utils/bi-entry';

/** 引擎能力开关：不传即视为该能力不支持，对应控件不渲染（不做「按钮在、点了没反应」的假统一） */
interface ListCaps {
  /** 支持冻结列 */
  frozen?: boolean;
  /** 支持在列表里直接改类型（改类型需连带转数据时置 false） */
  retype?: boolean;
  /** 支持在抽屉内新增列 */
  add?: boolean;
  /** 支持复制（克隆）列：每列一项「复制列」按钮 */
  duplicate?: boolean;
}

defineOptions({ name: 'BiColumnManager' });

const props = withDefaults(
  defineProps<{
    visible: boolean;
    /** 列定义（真实响应式对象；本组件只读渲染，改动一律通过事件交给调用方） */
    cols: BiColLike[];
    caps?: ListCaps;
  }>(),
  { caps: () => ({}) },
);

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'move', index: number, dir: -1 | 1): void;
  (e: 'rename', field: string, label: string): void;
  (e: 'retype', field: string, type: ColType): void;
  (e: 'toggle', field: string, flag: 'required' | 'visible' | 'frozen'): void;
  (e: 'config', field: string): void;
  (e: 'remove', field: string): void;
  (e: 'add', payload: { label: string; type: ColType; required: boolean; options?: string[] }): void;
  (e: 'duplicate', field: string): void;
}>();

/** 四种列类型：产品口径，不跟随各引擎的类型枚举命名 */
const TYPES: { value: ColType; label: string }[] = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数字' },
  { value: 'select', label: '下拉' },
  { value: 'date', label: '日期' },
];

const caps = computed<ListCaps>(() => props.caps ?? {});

const typeText = (t: ColType) => TYPES.find((x) => x.value === t)?.label ?? t;

/** 有校验规则 / 跨列规则时给一枚「验」徽标——信息而不是操作，所以不做成按钮 */
const hasRules = (c: BiColLike) => Boolean(c.rules && Object.keys(c.rules).length) || Boolean(c.cross?.length);

const hiddenCount = computed(() => props.cols.filter((c) => c.visible === false).length);

// ===================== 新增列 =====================
const addForm = reactive({ label: '', type: 'text' as ColType, options: '', required: false });

const onAdd = () => {
  const label = addForm.label.trim();
  if (!label) {
    ElMessage.warning('请输入列名');
    return;
  }
  const options = addForm.type === 'select'
    ? addForm.options.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
    : undefined;
  if (addForm.type === 'select' && !options?.length) {
    ElMessage.warning('下拉列至少填一个选项（用逗号分隔）');
    return;
  }
  emit('add', { label, type: addForm.type, required: addForm.required, options });
  addForm.label = '';
  addForm.options = '';
  addForm.required = false;
};

const close = () => emit('update:visible', false);
</script>

<style scoped>
.bcm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== 抽屉头 ===== */
.bcm-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.bcm-head-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--bi-text);
}
.bcm-head-meta {
  font-size: 12px;
  color: var(--bi-sub);
  font-variant-numeric: tabular-nums;
}
.bcm-head-meta em {
  font-style: normal;
  color: var(--bi-warn);
}

/* ===== 新增列 ===== */
.bcm-add {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--bi-border-soft);
  border-radius: var(--bi-radius);
  background: var(--bi-head-bg);
}
.bcm-add-title {
  font-size: 12px;
  color: var(--bi-sub);
}
.bcm-add-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bcm-add-name {
  flex: 1 1 auto;
  min-width: 0;
}
.bcm-add-type {
  flex: 0 0 92px;
}

/* ===== 引擎专属工具（列模板） ===== */
.bcm-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* ===== 列清单：行式，不套卡片 ===== */
.bcm-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--bi-border-soft);
}
.bcm-list-head,
.bcm-row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 84px 116px 104px;
  align-items: center;
  gap: 8px;
}
.bcm-list-head {
  padding: 6px 6px;
  font-size: 12px;
  color: var(--bi-sub);
  border-bottom: 1px solid var(--bi-border-soft);
}
.bcm-row {
  padding: 5px 6px;
  border-bottom: 1px solid var(--bi-border-soft);
  transition: background 0.15s;
}
.bcm-row:hover {
  background: var(--bi-hover);
}
.bcm-row:last-child {
  border-bottom: 0;
}
.bcm-type-static {
  font-size: 12px;
  color: var(--bi-sub);
  padding-left: 6px;
}
.bcm-row.is-off .bcm-name {
  opacity: 0.5;
}
.bcm-row.is-off .bcm-type-static {
  text-decoration: line-through;
  text-decoration-color: var(--bi-border);
}
.bcm-idx {
  font-size: 12px;
  color: var(--bi-sub);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

/* 行内输入：无框，hover 才给边界，focus 才变实底——避免每行都长成一个「框」 */
.bcm-name :deep(.el-input__wrapper) {
  padding: 0 6px;
  background: transparent;
  box-shadow: 0 0 0 1px transparent inset;
  transition: box-shadow 0.15s, background 0.15s;
}
.bcm-name :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--bi-border) inset;
}
.bcm-name :deep(.el-input__wrapper.is-focus) {
  background: var(--bi-input-bg);
  box-shadow: 0 0 0 1px var(--bi-primary) inset;
}
.bcm-name :deep(.el-input__inner) {
  color: var(--bi-text);
}
.bcm-type :deep(.el-select__wrapper),
.bcm-type :deep(.el-input__wrapper) {
  box-shadow: none;
  background: transparent;
}

/* ===== 状态徽标：默认只有灰字，亮起只提字色，唯一的彩色留给「必填」 ===== */
.bcm-flags {
  display: flex;
  align-items: center;
  gap: 2px;
}
.bcm-flag {
  min-width: 22px;
  height: 20px;
  padding: 0 4px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--bi-sub);
  font-family: inherit;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.bcm-flag:hover {
  border-color: var(--bi-border);
  color: var(--bi-text);
}
.bcm-flag.is-on {
  color: var(--bi-text);
}
/* 「显」是默认状态，亮起不给强调——真要看的是变成「隐」的那些行（行本身已压暗） */
.bcm-flag--vis.is-on {
  color: var(--bi-sub);
}
.bcm-flag--req.is-on {
  color: var(--bi-warn);
}
.bcm-flag--rule {
  border: 1px dashed var(--bi-border);
  cursor: default;
}
.bcm-flag--rule:hover {
  border-color: var(--bi-border);
  color: var(--bi-sub);
}

/* ===== 操作：常驻但低对比，hover 行才提亮 ===== */
.bcm-acts {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}
.bcm-acts :deep(.el-button.is-text) {
  margin: 0;
  padding: 0 5px;
  color: var(--bi-sub);
}
.bcm-acts :deep(.el-button.is-text:hover) {
  color: var(--bi-text);
}
.bcm-acts :deep(.el-button.is-disabled) {
  color: var(--bi-border);
}
.bcm-acts :deep(.el-button--danger:hover) {
  color: var(--bi-danger);
}
.bcm-acts-head {
  text-align: right;
}

.bcm-foot {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--bi-sub);
}
</style>
