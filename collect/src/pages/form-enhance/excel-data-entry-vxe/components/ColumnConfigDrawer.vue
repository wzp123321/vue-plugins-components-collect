<script setup lang="ts">
// 列配置抽屉：点击列头打开，针对"单列"做配置。
// 配置项：列名、数据类型（文本/数字/日期/可选项），并按类型展开专属配置——
//   可选项 → 选项配置（增删改）；数字 → 最小值/最大值；日期 → 显示格式。
// 同时保留每列常用开关（必填/显隐/冻结）、校验规则（复用 RuleDialog）、删除列。
// 采用"草稿 + 确定"模式：打开时拷贝真实定义到本地草稿，确定时整体回写并只入一次撤销栈，
// 取消则丢弃，避免半截改动污染表格或产生一堆零散撤销记录。
// 协作：props.core(GridCore)→columnDefs / pushSnapshot / revalidateAll / bumpData；props.ops(GridOps)→removeCol；./RuleDialog
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from '../hooks/useGridCore';
import type { GridOps } from '../hooks/useGridOps';
import { type ColDef, type ColRule, typeLabel, DEFAULT_DATE_FORMAT } from '../types';
import RuleDialog from './RuleDialog.vue';

defineOptions({ name: 'ColumnConfigDrawer' });
const props = defineProps<{ core: GridCore; ops: GridOps; field: string; visible: boolean }>();
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>();

const { columnDefs } = props.core;
const { removeCol } = props.ops;

// el-drawer 的 v-model 代理：外部用 v-model:visible 控制开关
const proxyVisible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
});

// 真实列定义（响应式）：field 变化或列被删除时重新定位
const realDef = computed<ColDef | null>(() => columnDefs.value.find((d) => d.field === props.field) ?? null);

// 本地草稿：打开时从真实定义深拷贝，确定时整体回写
// options 定为必填数组：本抽屉始终以数组形态操作选项，避免可选类型带来的判空噪音
const draft = reactive<ColDef & { options: string[] }>({
  field: '',
  label: '',
  type: 'text',
  required: false,
  visible: true,
  frozen: false,
  options: [],
  width: 120,
});

// 日期格式预设（存储仍按 YYYY-MM-DD，仅展示/编辑框呈现走 dateFormat）
const DATE_FORMATS = ['YYYY-MM-DD', 'YYYY/MM/DD', 'YYYY年MM月DD日', 'MM/DD/YYYY', 'DD-MM-YYYY'];

// 打开时把真实定义拷入草稿（rules/cross 深拷贝，避免与真实定义共享引用）
watch(
  () => [props.visible, props.field] as const,
  ([v]) => {
    if (!v) return;
    const d = realDef.value;
    if (!d) {
      emit('update:visible', false);
      return;
    }
    draft.field = d.field;
    draft.label = d.label;
    draft.type = d.type;
    draft.required = !!d.required;
    draft.visible = d.visible;
    draft.frozen = !!d.frozen;
    draft.options = [...(d.options ?? [])];
    draft.width = d.width ?? 120;
    draft.dateFormat = d.dateFormat ?? DEFAULT_DATE_FORMAT;
    draft.group = d.group ?? '';
    draft.rules = d.rules ? { ...d.rules } : undefined;
    draft.cross = d.cross ? d.cross.map((c) => ({ ...c })) : undefined;
  },
  { immediate: true },
);

// ===================== 校验规则（复用 RuleDialog，直接编辑草稿的 rules/cross） =====================
const ruleVisible = ref(false);
const hasRule = computed(() => !!draft.rules || !!draft.cross?.length);
const saveRule = (p: { rules: any; cross: any[] }) => {
  draft.rules = Object.keys(p.rules).length ? p.rules : undefined;
  draft.cross = p.cross.length ? p.cross : undefined;
};

// ===================== 可选项编辑（草稿内） =====================
const addOption = () => draft.options.push('');
const removeOption = (i: number) => draft.options.splice(i, 1);

// 数字列「最小值/最大值」：直接编辑草稿的 rules.min / rules.max（ColRule 已有定义与校验）。
// 用计算属性代理，保证 rules 被清空回退为 undefined（避免"校验规则"按钮误报已有规则）。
const isRulesEmpty = (r?: ColRule): boolean =>
  !!r &&
  r.min === undefined &&
  r.max === undefined &&
  r.minLen === undefined &&
  r.maxLen === undefined &&
  !r.pattern &&
  !r.unique;

const numMin = computed<number | undefined>({
  get: () => draft.rules?.min,
  set: (v) => {
    if (!draft.rules) draft.rules = {};
    if (v === undefined || v === null) delete draft.rules.min;
    else draft.rules.min = v;
    if (isRulesEmpty(draft.rules)) draft.rules = undefined;
  },
});
const numMax = computed<number | undefined>({
  get: () => draft.rules?.max,
  set: (v) => {
    if (!draft.rules) draft.rules = {};
    if (v === undefined || v === null) delete draft.rules.max;
    else draft.rules.max = v;
    if (isRulesEmpty(draft.rules)) draft.rules = undefined;
  },
});

const close = () => emit('update:visible', false);

// 确定：整体回写真实定义并只入一次撤销栈，随后全量重校让标记立即同步
const apply = () => {
  const d = realDef.value;
  if (!d) {
    close();
    return;
  }
  if (!draft.label.trim()) {
    ElMessage.warning('请输入列名');
    return;
  }
  props.core.pushSnapshot(props.core.snapshotNow());
  d.label = draft.label.trim();
  d.type = draft.type;
  d.required = draft.required;
  d.visible = draft.visible;
  d.frozen = draft.frozen;
  // 仅可选项类型保留 options；其它类型清空（避免无用的选项残留影响筛选器）
  d.options = draft.type === 'select' ? draft.options.map((o) => o.trim()).filter(Boolean) : undefined;
  d.dateFormat = draft.dateFormat || DEFAULT_DATE_FORMAT;
  d.group = draft.group || undefined;
  d.rules = draft.rules;
  d.cross = draft.cross;
  props.core.revalidateAll();
  props.core.bumpData();
  ElMessage.success(`已更新列「${d.label}」`);
  close();
};

// 删除该列（沿用 ops.removeCol：内部已入撤销栈并处理行/错误/筛选清理）
const onDelete = () => {
  const d = realDef.value;
  if (!d) return;
  removeCol(d.field);
  close();
};
</script>

<template>
  <el-drawer v-model="proxyVisible" title="列配置" direction="rtl" size="440px" class="dt-dlg">
    <div v-if="realDef" class="col-cfg">
      <div class="cfg-row">
        <label>列名</label>
        <el-input v-model="draft.label" maxlength="20" placeholder="列名" />
      </div>

      <div class="cfg-row">
        <label>数据类型</label>
        <el-select v-model="draft.type" style="width: 100%">
          <el-option v-for="(t, k) in typeLabel" :key="k" :label="t" :value="k" />
        </el-select>
      </div>

      <!-- 可选项：选项配置 -->
      <div v-if="draft.type === 'select'" class="cfg-block">
        <div class="cfg-block-head">
          <label class="cfg-block-title">选项配置</label>
          <el-button size="small" plain @click="addOption">＋ 选项</el-button>
        </div>
        <div v-for="(_, i) in draft.options" :key="i" class="opt-row">
          <el-input v-model="draft.options[i]" size="small" placeholder="选项文本" />
          <el-button text type="danger" size="small" :disabled="draft.options.length <= 1" @click="removeOption(i)">✕</el-button>
        </div>
        <div v-if="!draft.options.length" class="cfg-hint">暂无选项，添加后单元格以下拉形式录入</div>
      </div>

      <!-- 数字：最小值/最大值 -->
      <div v-else-if="draft.type === 'number'" class="cfg-block">
        <label class="cfg-block-title">数值范围</label>
        <div class="cfg-row two">
          <div>
            <span class="mini-label">最小值</span>
            <el-input-number v-model="numMin" :controls="false" size="small" style="width: 100%" />
          </div>
          <div>
            <span class="mini-label">最大值</span>
            <el-input-number v-model="numMax" :controls="false" size="small" style="width: 100%" />
          </div>
        </div>
        <div class="cfg-hint">录入值需落在 [最小值, 最大值] 闭区间内；留空表示不限制</div>
      </div>

      <!-- 日期：显示格式 -->
      <div v-else-if="draft.type === 'date'" class="cfg-block">
        <label class="cfg-block-title">显示格式</label>
        <el-select v-model="draft.dateFormat" filterable allow-create default-first-option style="width: 100%">
          <el-option v-for="f in DATE_FORMATS" :key="f" :label="f" :value="f" />
        </el-select>
        <div class="cfg-hint">存储始终为 YYYY-MM-DD，仅影响单元格显示与编辑框呈现</div>
      </div>

      <!-- 表头分组（多级表头） -->
      <div class="cfg-block">
        <label class="cfg-block-title">表头分组（多级表头）</label>
        <el-input v-model="draft.group" placeholder="留空=单层表头；相同分组名且连续的列归到一个父表头" />
        <div class="cfg-hint">例：把「省」「市」都填「地区」，表头显示两层：地区 ▸ 省 / 市</div>
      </div>

      <el-divider />

      <div class="cfg-row toggles">
        <span>必填 <el-switch v-model="draft.required" inline-prompt active-text="是" inactive-text="否" /></span>
        <span>显示 <el-switch v-model="draft.visible" inline-prompt active-text="显" inactive-text="隐" /></span>
        <span>冻结 <el-switch v-model="draft.frozen" inline-prompt active-text="冻" inactive-text="松" /></span>
      </div>

      <div class="cfg-row actions">
        <el-button text :type="hasRule ? 'primary' : 'default'" @click="ruleVisible = true">⚙ 校验规则</el-button>
        <el-button text type="danger" @click="onDelete">🗑 删除该列</el-button>
      </div>
    </div>
    <div v-else class="cfg-empty">列不存在或已被删除</div>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="apply">确定</el-button>
    </template>

    <RuleDialog
      :visible="ruleVisible"
      :def="draft"
      :all-defs="columnDefs"
      @close="ruleVisible = false"
      @save="saveRule"
    />
  </el-drawer>
</template>

<style scoped>
.col-cfg {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.cfg-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cfg-row > label {
  font-size: 12.5px;
  color: var(--dt-sub);
}
.cfg-row.two {
  flex-direction: row;
  gap: 12px;
}
.cfg-row.two > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mini-label {
  font-size: 12px;
  color: var(--dt-sub);
}
.cfg-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--dt-border);
  border-radius: 8px;
  background: var(--dt-hover);
}
.cfg-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cfg-block-title {
  font-size: 12.5px;
  color: var(--dt-sub);
  font-weight: 600;
}
.opt-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cfg-hint {
  font-size: 12px;
  color: var(--dt-sub);
  line-height: 1.5;
}
.cfg-row.toggles {
  flex-direction: row;
  gap: 18px;
  align-items: center;
  font-size: 13px;
  color: var(--dt-text);
}
.cfg-row.actions {
  flex-direction: row;
  justify-content: space-between;
}
.cfg-empty {
  font-size: 13px;
  color: var(--dt-sub);
  padding: 20px 0;
  text-align: center;
}
</style>
