<script setup lang="ts">
// 列设置抽屉：新增列 + 逐列改定义（名称/类型/必填/宽度/显隐/移序/删除/校验规则/跨列规则）
// 纯 UI 层：所有改动都通过 ops.updateColumn 落到"列定义 → 重写表头 + 重下发验证"这条链路上。
// ⚠️ 这里刻意用 @change（失焦/回车才提交）而非 v-model：每次改列定义都会重写整表数据，
//    逐字符触发会把表格打回重绘风暴。
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { ColDef, ColType, CrossKind } from '../schema';
import { typeLabel } from '../schema';
import type { EntryOps } from '../useEntryOps';

defineOptions({ name: 'ColumnDrawer' });

const props = defineProps<{
  visible: boolean;
  defs: ColDef[];
  ops: EntryOps;
  /** 打开时要定位的列 field（点列标触发）：滚动到该列 + 展开其规则 + 短暂高亮 */
  focusField?: string;
}>();

const emit = defineEmits<{ (e: 'update:visible', v: boolean): void; (e: 'close'): void }>();

const types: ColType[] = ['text', 'number', 'select', 'date'];
const crossKinds: { value: CrossKind | ''; label: string }[] = [
  { value: '', label: '无跨列规则' },
  { value: 'gte', label: '不早于/小于（≥）' },
  { value: 'lte', label: '不晚于/大于（≤）' },
  { value: 'eq', label: '需与参照列一致（=）' },
  { value: 'requiredIf', label: '参照列已填则本列必填' },
];

// 新增列表单
const addForm = reactive({ label: '', type: 'text' as ColType, options: '', required: false });

const close = () => {
  emit('update:visible', false);
  emit('close');
};

const onAdd = () => {
  const label = addForm.label.trim();
  if (!label) {
    ElMessage.warning('请输入列名');
    return;
  }
  const options = addForm.type === 'select' ? addForm.options.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : undefined;
  if (addForm.type === 'select' && !options?.length) {
    ElMessage.warning('下拉列至少填一个选项（用逗号分隔）');
    return;
  }
  props.ops.addColumn({ label, type: addForm.type, options, required: addForm.required });
  addForm.label = '';
  addForm.options = '';
  addForm.required = false;
};

/** 更新单列规则中的某个字段（undefined 表示清空该规则） */
const patchRule = (d: ColDef, key: string, raw: string | number | boolean | null) => {
  const rules = { ...(d.rules ?? {}) } as Record<string, unknown>;
  if (raw === null || raw === '') delete rules[key];
  else rules[key] = raw;
  props.ops.updateColumn(d.field, { rules: Object.keys(rules).length ? rules : undefined });
};

/** 跨列规则：单条（参照列 + 关系），空选择表示清除 */
const patchCross = (d: ColDef, kind: CrossKind | '', other: string) => {
  if (!kind || !other) {
    props.ops.updateColumn(d.field, { cross: undefined });
    return;
  }
  props.ops.updateColumn(d.field, { cross: [{ kind, other }] });
};

const crossKindOf = (d: ColDef): CrossKind | '' => d.cross?.[0]?.kind ?? '';
const crossOtherOf = (d: ColDef): string => d.cross?.[0]?.other ?? '';

// 展开态：默认收起，避免一屏堆满输入框
const openFields = ref<string[]>([]);

// ===================== 点列标 → 定位到该列 =====================
// 与 vxe 版一致：点列头打开"这一列"的配置。这里复用全量列表，靠滚动 + 展开 + 高亮表达"就是这列"，
// 不再单独做一份单列抽屉（两套结构会漂移）。
const listRef = ref<HTMLElement>();
/** 当前聚焦列（用于标题 + 高亮）；高亮单独一个变量，2 秒后只清高亮、标题保持 */
const focusedField = ref('');
const highlightField = ref('');

/** 抽屉标题带上当前聚焦列名，避免列表太长看不出定位到哪列 */
const drawerTitle = computed(() => {
  const d = props.defs.find((x) => x.field === focusedField.value);
  return d ? `列设置 · ${d.label}` : '列设置';
});

watch(
  () => [props.visible, props.focusField] as const,
  ([visible, field], old) => {
    // 只在"打开"或"换了一列"时定位；单纯关抽屉不复位，避免闪烁
    if (!visible || !field) return;
    const opened = !old || !old[0];
    if (!opened && old[1] === field) return;
    focusedField.value = field;
    highlightField.value = field;
    openFields.value = [field];
    nextTick(() => {
      const el = listRef.value?.querySelector<HTMLElement>(`[data-field="${field}"]`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      window.setTimeout(() => {
        if (highlightField.value === field) highlightField.value = '';
      }, 2000);
    });
  },
  { immediate: true },
);
</script>

<template>
  <el-drawer :model-value="visible" :title="drawerTitle" size="520px" class="ue-dlg" @close="close" @update:model-value="(v: boolean) => emit('update:visible', v)">
    <div class="cd-add">
      <div class="cd-add-title">新增列</div>
      <div class="cd-add-row">
        <el-input v-model="addForm.label" placeholder="列名" size="small" style="width: 130px" />
        <el-select v-model="addForm.type" size="small" style="width: 96px">
          <el-option v-for="t in types" :key="t" :label="typeLabel[t]" :value="t" />
        </el-select>
        <el-checkbox v-model="addForm.required" size="small">必填</el-checkbox>
        <el-button size="small" type="primary" @click="onAdd">添加</el-button>
      </div>
      <el-input
        v-if="addForm.type === 'select'"
        v-model="addForm.options"
        placeholder="下拉选项，用逗号分隔，如：在职,试用期,离职"
        size="small"
        style="margin-top: 6px"
      />
    </div>

    <div class="cd-list" ref="listRef">
      <div
        v-for="(d, i) in defs"
        :key="d.field"
        class="cd-item"
        :class="{ 'is-focus': highlightField === d.field }"
        :data-field="d.field"
      >
        <div class="cd-item-head">
          <span class="cd-index">{{ i + 1 }}</span>
          <el-input
            :model-value="d.label"
            size="small"
            style="width: 120px"
            @change="(v: string) => ops.updateColumn(d.field, { label: v })"
          />
          <el-select
            :model-value="d.type"
            size="small"
            style="width: 88px"
            @change="(v: ColType) => ops.updateColumn(d.field, { type: v })"
          >
            <el-option v-for="t in types" :key="t" :label="typeLabel[t]" :value="t" />
          </el-select>
          <el-tooltip content="必填" placement="top">
            <el-switch
              :model-value="d.required"
              size="small"
              @update:model-value="(v: boolean | string | number) => ops.updateColumn(d.field, { required: Boolean(v) })"
            />
          </el-tooltip>
          <el-tooltip content="显示 / 隐藏" placement="top">
            <el-switch
              :model-value="d.visible"
              size="small"
              inline-prompt
              active-text="显"
              inactive-text="隐"
              @update:model-value="() => ops.toggleColumnVisible(d.field)"
            />
          </el-tooltip>
          <div class="cd-item-actions">
            <el-button size="small" text :disabled="i === 0" @click="ops.moveColumn(i, -1)">←</el-button>
            <el-button size="small" text :disabled="i === defs.length - 1" @click="ops.moveColumn(i, 1)">→</el-button>
            <el-button size="small" text type="danger" @click="ops.removeColumn(d.field)">删</el-button>
          </div>
        </div>

        <el-collapse v-model="openFields" class="cd-collapse">
          <el-collapse-item :name="d.field">
            <template #title>
              <span class="cd-collapse-title">校验规则 / 列宽{{ d.rules || d.cross ? ' · 已配置' : '' }}</span>
            </template>
            <div class="cd-rules">
              <template v-if="d.type === 'number'">
                <el-input
                  :model-value="d.rules?.min ?? ''"
                  placeholder="最小值"
                  size="small"
                  style="width: 110px"
                  @change="(v: string) => patchRule(d, 'min', v === '' ? null : Number(v))"
                />
                <el-input
                  :model-value="d.rules?.max ?? ''"
                  placeholder="最大值"
                  size="small"
                  style="width: 110px"
                  @change="(v: string) => patchRule(d, 'max', v === '' ? null : Number(v))"
                />
              </template>
              <template v-if="d.type === 'text'">
                <el-input
                  :model-value="d.rules?.minLen ?? ''"
                  placeholder="最小长度"
                  size="small"
                  style="width: 110px"
                  @change="(v: string) => patchRule(d, 'minLen', v === '' ? null : Number(v))"
                />
                <el-input
                  :model-value="d.rules?.maxLen ?? ''"
                  placeholder="最大长度"
                  size="small"
                  style="width: 110px"
                  @change="(v: string) => patchRule(d, 'maxLen', v === '' ? null : Number(v))"
                />
              </template>
              <el-input
                :model-value="d.rules?.pattern ?? ''"
                placeholder="正则源（不带斜杠），如 ^\d{11}$"
                size="small"
                style="width: 200px"
                @change="(v: string) => patchRule(d, 'pattern', v)"
              />
              <el-input
                :model-value="d.rules?.patternMsg ?? ''"
                placeholder="正则不匹配时的提示"
                size="small"
                style="width: 180px"
                @change="(v: string) => patchRule(d, 'patternMsg', v)"
              />
              <el-checkbox
                :model-value="!!d.rules?.unique"
                size="small"
                @update:model-value="(v: boolean | string | number) => patchRule(d, 'unique', v ? true : null)"
              >
                列内唯一
              </el-checkbox>
              <div class="cd-rules-row">
                <el-select
                  :model-value="crossKindOf(d)"
                  size="small"
                  style="width: 190px"
                  @change="(v: CrossKind | '') => patchCross(d, v, crossOtherOf(d))"
                >
                  <el-option v-for="k in crossKinds" :key="k.value" :label="k.label" :value="k.value" />
                </el-select>
                <el-select
                  :model-value="crossOtherOf(d)"
                  size="small"
                  placeholder="参照列"
                  style="width: 130px"
                  :disabled="!crossKindOf(d)"
                  @change="(v: string) => patchCross(d, crossKindOf(d), v)"
                >
                  <el-option v-for="o in defs.filter((x) => x.field !== d.field)" :key="o.field" :label="o.label" :value="o.field" />
                </el-select>
                <el-input
                  :model-value="d.width"
                  size="small"
                  style="width: 100px"
                  @change="(v: string) => ops.updateColumn(d.field, { width: Math.max(60, Number(v) || 120) })"
                >
                  <template #prepend>宽</template>
                </el-input>
              </div>
              <div v-if="d.type === 'select'" class="cd-rules-row">
                <el-input
                  :model-value="(d.options ?? []).join(',')"
                  size="small"
                  style="width: 100%"
                  placeholder="下拉选项，用逗号分隔"
                  @change="(v: string) => ops.updateColumn(d.field, { options: v.split(/[,，]/).map((s) => s.trim()).filter(Boolean) })"
                />
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.cd-add {
  border: 1px solid var(--ue-border);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 12px;
  background: var(--ue-panel);
}
.cd-add-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}
.cd-add-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cd-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cd-item {
  border: 1px solid var(--ue-border);
  border-radius: 10px;
  padding: 8px 10px;
  background: var(--ue-panel);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
/* 点列标定位过来的那一列：2 秒高亮，让人一眼看到"就是这列" */
.cd-item.is-focus {
  border-color: var(--ue-primary, #2b5cf6);
  box-shadow: 0 0 0 3px rgb(43 92 246 / 12%);
}
.cd-item-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cd-index {
  width: 18px;
  color: var(--ue-sub);
  font-variant-numeric: tabular-nums;
}
.cd-item-actions {
  margin-left: auto;
  display: flex;
  gap: 2px;
}
.cd-collapse {
  margin-top: 4px;
  border: none;
}
.cd-collapse-title {
  font-size: 12px;
  color: var(--ue-sub);
}
.cd-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.cd-rules-row {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}
</style>
