<!--
  列配置抽屉（三套 BI 录入台共用 · 单列配置）
  ============================================================================
  职责：点列头 / 点列表里的「配置」后，只配置**这一列**。
  交互（三套必须一致，本组件即唯一定义处）：
    · 容器：右侧 el-drawer，宽 480px，挂 .bi-dlg / .bcd-drawer 继承 BI 色板；
    · 标题：「列配置 · 列名」（列名取打开时的快照，输入框改动不带着标题跳），右侧挂当前类型；
    · 提交：草稿模式——改动先落在本地，点「保存配置」才整体回写，点「取消 / 遮罩 / Esc」丢弃；
    · 分区顺序固定：基本信息 → 类型设置 → 校验规则 → 跨列规则 → 显示与视图 → 删除该列。
  引擎差异只允许出现在**能力**上（caps）：冻结 / 表头分组 / 列宽，不做假统一。

  版式约定（重设计要点，别退回"左标签 + 88px 定宽"的老样子）：
    · 字段一律「标签在上、控件满宽」：抽屉只有 480px，左侧定宽标签会把每个控件压成一条窄槽；
    · 每个分区只剩一条发丝线标题，不再用"竖条 + 整条下边框"包住每一段（五六段叠起来全是横线）；
    · 类型选五个 chip、列状态用三张方卡，一眼看完，不靠 select / 小开关去猜；
    · 空态不占位（文本类型不渲染"类型设置"整段），可加项用虚线框按钮，列表项的编号只在多条时出现。

  协作：各引擎把 colDef 映射成 :column 传进来，@confirm 里整体回写并重建表格。
-->
<template>
  <el-drawer
    :model-value="visible"
    size="480px"
    class="bi-dlg bcd-drawer"
    :show-close="true"
    @close="close"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
  >
    <template #header>
      <div class="bcd-head">
        <span class="bcd-head__title">{{ title }}</span>
        <span class="bcd-head__tag">{{ typeLabel }}</span>
      </div>
    </template>

    <div v-if="column || isAddMode" class="bcd">
      <el-form label-position="top" size="small" class="bcd-form" @submit.prevent>
        <!-- ===== 基本信息 ===== -->
        <section class="bcd-sec">
          <h4 class="bcd-sec__hd">基本信息</h4>
          <el-form-item label="列名">
            <el-input v-model="draft.label" maxlength="20" placeholder="表头显示的列名，如 姓名" />
          </el-form-item>
          <el-form-item label="数据类型">
            <el-radio-group v-model="draft.type" class="bcd-types">
              <el-radio-button v-for="t in TYPES" :key="t.value" :value="t.value">
                {{ t.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </section>

        <!-- ===== 类型设置（无配置项的类型整段不渲染，避免空段落） ===== -->
        <section v-if="draft.type !== 'text'" class="bcd-sec">
          <h4 class="bcd-sec__hd">
            <span>类型设置</span>
            <em class="bcd-sec__hint">{{ typeHint }}</em>
          </h4>

          <template v-if="draft.type === 'select'">
            <el-form-item label="下拉选项">
              <div class="bcd-list">
                <div v-for="(_, i) in draft.options" :key="i" class="bcd-list__row">
                  <span v-if="draft.options.length > 1" class="bcd-list__idx">{{ i + 1 }}</span>
                  <el-input v-model="draft.options[i]" placeholder="选项文本" />
                  <el-button
                    class="bcd-iconbtn"
                    text
                    :disabled="draft.options.length <= 1"
                    title="删除该选项"
                    @click="removeOption(i)"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
                <button type="button" class="bcd-addrow" @click="addOption">＋ 添加选项</button>
              </div>
            </el-form-item>
          </template>

          <template v-else-if="draft.type === 'number'">
            <el-form-item label="数值范围">
              <div class="bcd-range">
                <el-input-number v-model="minRule" :controls="false" placeholder="最小" />
                <span class="bcd-range__sep">~</span>
                <el-input-number v-model="maxRule" :controls="false" placeholder="最大" />
              </div>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="integerRule">只允许整数</el-checkbox>
            </el-form-item>
          </template>

          <template v-else-if="draft.type === 'date'">
            <el-form-item label="显示格式">
              <el-select v-model="draft.dateFormat" filterable allow-create default-first-option>
                <el-option v-for="f in DATE_FORMATS" :key="f" :label="f" :value="f" />
              </el-select>
            </el-form-item>
            <p class="bcd-note">存储恒为 YYYY-MM-DD，这里只决定单元格里怎么显示。</p>
          </template>

          <template v-else-if="draft.type === 'region'">
            <p class="bcd-note">双击单元格弹出「院区选择框」，选中后回填院区名称，并一并保存 id / code。</p>
          </template>
        </section>

        <!-- ===== 校验规则 ===== -->
        <section class="bcd-sec">
          <h4 class="bcd-sec__hd">校验规则</h4>
          <el-form-item v-if="draft.type === 'text'" label="长度限制">
            <div class="bcd-range">
              <el-input-number v-model="minLenRule" :controls="false" :min="0" placeholder="最短" />
              <span class="bcd-range__sep">~</span>
              <el-input-number v-model="maxLenRule" :controls="false" :min="0" placeholder="最长" />
              <span class="bcd-range__unit">字</span>
            </div>
          </el-form-item>
          <template v-if="draft.type === 'text'">
            <el-form-item label="正则校验">
              <div class="bcd-stack">
                <el-input v-model="draft.rules.pattern" placeholder="正则源（不带斜杠），如 ^\d{11}$" />
                <el-input v-model="draft.rules.patternMsg" placeholder="不匹配时的提示文案（选填）" />
              </div>
            </el-form-item>
          </template>
          <el-form-item>
            <el-checkbox v-model="draft.rules.unique">整列唯一（工号 / 邮箱这类不可重复的列）</el-checkbox>
          </el-form-item>
        </section>

        <!-- ===== 跨列规则 ===== -->
        <section class="bcd-sec">
          <h4 class="bcd-sec__hd">
            <span>跨列规则</span>
            <em v-if="draft.cross.length" class="bcd-sec__hint">{{ draft.cross.length }} 条</em>
          </h4>

          <div v-if="draft.cross.length" class="bcd-rules">
            <div v-for="(r, i) in draft.cross" :key="i" class="bcd-rule">
              <div class="bcd-rule__hd">
                <span>规则 {{ i + 1 }}</span>
                <el-button class="bcd-iconbtn" text title="删除该规则" @click="draft.cross.splice(i, 1)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              <div class="bcd-rule__grid">
                <label class="bcd-rule__cell">
                  <span>关系</span>
                  <el-select v-model="r.kind">
                    <el-option v-for="k in CROSS_KINDS" :key="k.value" :label="k.label" :value="k.value" />
                  </el-select>
                </label>
                <label class="bcd-rule__cell">
                  <span>参照列</span>
                  <el-select v-model="r.other" placeholder="选择一列">
                    <el-option v-for="s in otherColumns" :key="s.field" :label="s.label" :value="s.field" />
                  </el-select>
                </label>
              </div>
              <label class="bcd-rule__cell bcd-rule__cell--full">
                <span>提示文案</span>
                <el-input v-model="r.msg" placeholder="不通过时的提示（留空走默认文案）" />
              </label>
            </div>
          </div>
          <p v-else class="bcd-note">约束本列相对其它列的先后、大小、一致或必填关系。</p>

          <button v-if="otherColumns.length" type="button" class="bcd-addrow" @click="addCross">
            ＋ 添加跨列规则
          </button>
          <p v-else class="bcd-note">表里只有这一列，暂无可参照的列。</p>
        </section>

        <!-- ===== 显示与视图（能力差异走 caps） ===== -->
        <section class="bcd-sec">
          <h4 class="bcd-sec__hd">显示与视图</h4>
          <el-form-item label="列状态">
            <div class="bcd-flags" :style="{ '--bcd-flag-cols': caps.frozen ? 3 : 2 }">
              <el-checkbox v-model="draft.required" class="bcd-flag">必填</el-checkbox>
              <el-checkbox v-model="draft.visible" class="bcd-flag">显示</el-checkbox>
              <el-checkbox v-if="caps.frozen" v-model="draft.frozen" class="bcd-flag">冻结</el-checkbox>
            </div>
          </el-form-item>
          <el-form-item v-if="caps.width" label="列宽">
            <div class="bcd-range">
              <el-input-number v-model="draft.width" :controls="false" :min="60" :step="10" />
              <span class="bcd-range__unit">px</span>
            </div>
          </el-form-item>
          <el-form-item v-if="caps.group" label="表头分组">
            <el-input v-model="draft.group" placeholder="留空 = 单层表头；相邻同名列会归到一个父表头下" />
          </el-form-item>
        </section>
      </el-form>

      <!-- ===== 删除（新增模式还没有这列） ===== -->
      <section v-if="!isAddMode" class="bcd-danger">
        <div class="bcd-danger__txt">
          <p class="bcd-danger__title">删除该列</p>
          <p class="bcd-danger__desc">列定义与已录入数据一起移除，不可撤销。</p>
        </div>
        <el-button type="danger" plain @click="onRemove">删除</el-button>
      </section>
    </div>
    <div v-else class="bcd-missing">列不存在或已被删除</div>

    <template #footer>
      <div class="bcd-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="confirm">{{ isAddMode ? '添加列' : '保存配置' }}</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
// 说明：抽屉是纯 UI 层，不碰任何引擎 API。所有读写都走 draft，确认后由父级整体回写。
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { compactRules, DEFAULT_DATE_FORMAT, type BiColLike, type ColType, type CrossKind } from '@/utils/bi-entry';
import type { ColumnCaps, ColumnDraft, DraftState } from './types';

defineOptions({ name: 'BiColumnDrawer' });

const props = defineProps<{
  visible: boolean;
  /** 要配置的列（真实列定义；打开时拷入草稿，外部变化不影响正在编辑的内容） */
  column?: BiColLike | null;
  /** 新增模式：由「新增列」按钮打开，草稿置空、不显示删除区、确认时 emit('add') */
  add?: boolean;
  /** 引擎能力开关：不传即一律不显示对应项 */
  caps?: ColumnCaps;
  /** 同表其它列：跨列规则的参照列候选 */
  siblings?: BiColLike[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'confirm', draft: ColumnDraft): void;
  (e: 'remove'): void;
  (e: 'add', draft: Omit<ColumnDraft, 'field'>): void;
}>();

/** 五种列类型：这是产品口径，不跟随各引擎的类型枚举命名 */
const TYPES: { value: ColType; label: string }[] = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数字' },
  { value: 'select', label: '下拉' },
  { value: 'date', label: '日期' },
  { value: 'region', label: '院区' },
];

/** 日期格式预设：存储恒为 YYYY-MM-DD，这里只决定展示与编辑框呈现 */
const DATE_FORMATS = ['YYYY-MM-DD', 'YYYY/MM/DD', 'YYYY年MM月DD日', 'MM/DD/YYYY', 'DD-MM-YYYY'];

/** 跨列规则四种关系：文案对齐「日期先后 / 数值大小 / 相等 / 条件必填」四类真实需求 */
const CROSS_KINDS: { value: CrossKind; label: string }[] = [
  { value: 'gte', label: '不早于 / 不小于（≥）' },
  { value: 'lte', label: '不晚于 / 不大于（≤）' },
  { value: 'eq', label: '需与参照列一致（=）' },
  { value: 'requiredIf', label: '参照列已填则本列必填' },
];

const draft = reactive<DraftState>({
  field: '',
  label: '',
  type: 'text',
  required: false,
  visible: true,
  options: [],
  rules: {},
  cross: [],
  dateFormat: DEFAULT_DATE_FORMAT,
});

const caps = computed<ColumnCaps>(() => props.caps ?? {});
const otherColumns = computed(() => (props.siblings ?? []).filter((s) => s.field !== draft.field));

/** 新增模式由 add 显式指定：column 为空还可能是「列已被删除」，两者不能混为一谈 */
const isAddMode = computed(() => !!props.add);

/** 标题：新增模式固定「新增列」；编辑模式取打开时的列名快照（不随输入框实时跳动） */
const titleLabel = ref('');
const title = computed(() => {
  if (isAddMode.value) return '新增列';
  return titleLabel.value ? `列配置 · ${titleLabel.value}` : '列配置';
});

/** 头部与分区标题上的当前类型小标签 */
const typeLabel = computed(() => TYPES.find((t) => t.value === draft.type)?.label ?? draft.type);

/** 分区标题右侧的一句话说明：只在类型设置段用，解释这类列会被怎么渲染 */
const typeHint = computed(() => {
  switch (draft.type) {
    case 'select':
      return '单元格点一下弹选项';
    case 'number':
      return '可限定取值区间';
    case 'date':
      return '按格式显示与校验';
    case 'region':
      return '双击弹院区选择';
    default:
      return '';
  }
});

/** 打开（或换了一列）时把真实定义拷进草稿：数组/对象深拷一层，避免编辑过程中污染表格 */
const fillFrom = (col: BiColLike) => {
  draft.field = col.field;
  draft.label = col.label;
  draft.type = col.type;
  draft.required = !!col.required;
  draft.visible = col.visible !== false;
  draft.frozen = !!col.frozen;
  draft.width = col.width;
  draft.group = col.group ?? '';
  draft.dateFormat = col.dateFormat || DEFAULT_DATE_FORMAT;
  draft.options = [...(col.options ?? [])];
  draft.rules = { ...(col.rules ?? {}) };
  draft.cross = (col.cross ?? []).map((c) => ({ ...c }));
};

/** 新增模式：把草稿重置为空白列定义（不污染任何现有列） */
const resetForAdd = () => {
  draft.field = '';
  draft.label = '';
  draft.type = 'text';
  draft.required = false;
  draft.visible = true;
  draft.frozen = false;
  draft.width = undefined;
  draft.group = '';
  draft.dateFormat = DEFAULT_DATE_FORMAT;
  draft.options = [];
  draft.rules = {};
  draft.cross = [];
};

watch(
  () => [props.visible, props.column?.field, props.add] as const,
  ([visible]) => {
    if (!visible) return;
    if (props.add) {
      resetForAdd();
      titleLabel.value = '';
    } else if (props.column) {
      fillFrom(props.column);
      titleLabel.value = props.column.label;
    }
  },
  { immediate: true },
);

/** 新增模式下，把类型切到「院区」且列名还空时，自动预填「院区」 */
watch(
  () => draft.type,
  (t) => {
    if (isAddMode.value && t === 'region' && !draft.label.trim()) {
      draft.label = '院区';
    }
  },
);

// ===================== 数值类规则的可写代理 =====================
// 直接 v-model 到 draft.rules.min 会留下 `min: null` 这类脏值，且清空后 rules 变成空对象；
// 统一走代理：清空即 delete，空壳由 compactRules 在 confirm 时收口。
const numberRule = (key: 'min' | 'max' | 'minLen' | 'maxLen') => computed<number | undefined>({
  get: () => draft.rules[key],
  set: (v) => {
    if (v === undefined || v === null) {
      delete draft.rules[key];
    } else {
      draft.rules[key] = v;
    }
  },
});

const minRule = numberRule('min');
const maxRule = numberRule('max');
const minLenRule = numberRule('minLen');
const maxLenRule = numberRule('maxLen');

const integerRule = computed<boolean>({
  get: () => !!draft.rules.integer,
  set: (v) => {
    if (v) {
      draft.rules.integer = true;
    } else {
      delete draft.rules.integer;
    }
  },
});

// ===================== 列表增删 =====================
const addOption = () => draft.options.push('');

const removeOption = (i: number) => draft.options.splice(i, 1);

const addCross = () => draft.cross.push({ kind: 'gte', other: '', msg: '' });

// ===================== 提交 =====================
const close = () => emit('update:visible', false);

/**
 * 保存：校验 → 裁剪 → 交出草稿 → 关抽屉。
 * 只在这里做「形不形成一次合法列定义」的判定，业务侧（是否重校 / 是否入撤销栈）由各引擎自己负责。
 */
const confirm = () => {
  const label = draft.label.trim();
  if (!label) {
    ElMessage.warning('请输入列名');
    return;
  }
  const options = draft.type === 'select'
    ? draft.options.map((o) => o.trim()).filter(Boolean)
    : undefined;
  if (draft.type === 'select' && !options?.length) {
    ElMessage.warning('下拉列至少填一个选项');
    return;
  }
  const payload = {
    label,
    type: draft.type,
    required: draft.required,
    visible: draft.visible,
    frozen: caps.value.frozen ? !!draft.frozen : undefined,
    width: caps.value.width ? draft.width : undefined,
    group: caps.value.group ? draft.group?.trim() || undefined : undefined,
    dateFormat: draft.type === 'date' ? draft.dateFormat || DEFAULT_DATE_FORMAT : undefined,
    options,
    rules: compactRules(draft.rules),
    cross: draft.cross.filter((c) => c.other).map((c) => ({ ...c, msg: c.msg?.trim() || undefined })),
  };
  if (isAddMode.value) {
    emit('add', payload);
  } else {
    emit('confirm', { ...payload, field: draft.field });
  }
  close();
};

const onRemove = () => {
  emit('remove');
  close();
};
</script>

<style scoped>
/* 抽屉外壳（header/footer/padding）由下面非 scoped 的 .bcd-drawer 块负责，这里只管内容版式。 */
.bcd-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
.bcd-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
.bcd-form :deep(.el-form-item__label) {
  padding-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: var(--bi-text);
}

/* ===== 头部：标题 + 当前类型 ===== */
.bcd-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.bcd-head__title {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  color: var(--bi-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bcd-head__tag {
  flex: 0 0 auto;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
  color: var(--bi-primary);
  background: var(--bi-primary-soft);
  border-radius: 4px;
}

/* ===== 分区：只留一条发丝线，不再给每段套下边框 ===== */
.bcd-sec {
  margin-bottom: 22px;
}
.bcd-sec:last-of-type {
  margin-bottom: 0;
}
.bcd-sec__hd {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  color: var(--bi-text);
}
.bcd-sec__hd::after {
  flex: 1 1 auto;
  height: 1px;
  background: var(--bi-border);
  content: '';
}
.bcd-sec__hint {
  flex: 0 0 auto;
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  color: var(--bi-sub);
}

/* ===== 类型 chip：五等分，一眼看全五种，不用展开 select ===== */
.bcd-types {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  width: 100%;
}
.bcd-types :deep(.el-radio-button) {
  width: 100%;
}
.bcd-types :deep(.el-radio-button__inner) {
  width: 100%;
  padding: 6px 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--bi-text);
  background: var(--bi-panel);
  border: 1px solid var(--bi-border);
  border-radius: var(--bi-radius-sm);
  box-shadow: none;
}
.bcd-types :deep(.el-radio-button__inner:hover) {
  border-color: var(--bi-primary);
  color: var(--bi-primary);
}
.bcd-types :deep(.el-radio-button.is-active .el-radio-button__inner) {
  color: var(--bi-primary);
  background: var(--bi-primary-soft);
  border-color: var(--bi-primary);
  box-shadow: none;
  font-weight: 600;
}

/* ===== 列状态：三张方卡，勾选态用主色描边（比三个迷你 switch 好认） ===== */
.bcd-flags {
  display: grid;
  grid-template-columns: repeat(var(--bcd-flag-cols, 3), 1fr);
  gap: 8px;
  width: 100%;
}
.bcd-flags :deep(.el-checkbox) {
  box-sizing: border-box;
  width: 100%;
  height: auto;
  margin-right: 0;
  padding: 7px 10px;
  background: var(--bi-head-bg);
  border: 1px solid var(--bi-border);
  border-radius: var(--bi-radius-sm);
  transition: border-color 0.15s, background 0.15s;
}
.bcd-flags :deep(.el-checkbox__label) {
  padding-left: 6px;
  font-size: 12px;
  color: var(--bi-text);
}
.bcd-flags :deep(.el-checkbox.is-checked) {
  background: var(--bi-primary-soft);
  border-color: var(--bi-primary);
}
.bcd-flags :deep(.el-checkbox.is-checked .el-checkbox__label) {
  color: var(--bi-primary);
}
.bcd-flags :deep(.el-checkbox__inner) {
  border-radius: 3px;
}

/* ===== 区间输入：两格等分，单位贴右 ===== */
.bcd-range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.bcd-range :deep(.el-input-number) {
  flex: 1 1 0;
  width: auto;
}
.bcd-range :deep(.el-input__wrapper) {
  width: 100%;
}
/* el-input-number 默认把数字居中，区间输入里居中会看不出"从哪格填到哪格"，统一改左对齐 */
.bcd-range :deep(.el-input__inner) {
  text-align: left;
}
.bcd-range__sep,
.bcd-range__unit {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--bi-sub);
}

/* ===== 纵向堆叠（正则源 + 提示） ===== */
.bcd-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

/* ===== 选项列表 ===== */
.bcd-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.bcd-list__row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bcd-list__idx {
  flex: 0 0 16px;
  font-size: 11px;
  color: var(--bi-sub);
  text-align: center;
}
.bcd-iconbtn {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 12px;
  color: var(--bi-sub);
}
.bcd-iconbtn:hover {
  color: var(--bi-danger);
}

/* 可加项：虚线框按钮，比纯文字按钮更像"这里还能加一条" */
.bcd-addrow {
  display: block;
  width: 100%;
  padding: 6px 0;
  font-size: 12px;
  color: var(--bi-primary);
  cursor: pointer;
  background: transparent;
  border: 1px dashed var(--bi-border);
  border-radius: var(--bi-radius-sm);
  transition: border-color 0.15s, background 0.15s;
}
.bcd-addrow:hover {
  background: var(--bi-hover);
  border-color: var(--bi-primary);
}

/* ===== 跨列规则卡片 ===== */
.bcd-rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}
.bcd-rule {
  padding: 10px 12px 12px;
  background: var(--bi-head-bg);
  border: 1px solid var(--bi-border-soft);
  border-radius: var(--bi-radius);
}
.bcd-rule__hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--bi-sub);
}
.bcd-rule__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.bcd-rule__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.bcd-rule__cell > span {
  font-size: 11px;
  color: var(--bi-sub);
}
.bcd-rule__cell--full {
  margin-top: 8px;
}

/* ===== 说明文案 / 空态 ===== */
.bcd-note {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--bi-sub);
}
.bcd-missing {
  padding: 24px 0;
  font-size: 13px;
  color: var(--bi-sub);
  text-align: center;
}

/* ===== 删除区：细红线隔离，不做整块红底（红底在暗色下像报错） ===== */
.bcd-danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  margin-top: 22px;
  border: 1px solid color-mix(in srgb, var(--bi-danger) 34%, transparent);
  border-radius: var(--bi-radius);
}
.bcd-danger__title {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 600;
  color: var(--bi-danger);
}
.bcd-danger__desc {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--bi-sub);
}
</style>

<style>
/* 抽屉外壳：header / body / footer 三段统一 20px 内边距 + 发丝分割，
   底部按钮区定宽右对齐（默认的 footer 会把两个按钮拉成通栏）。 */
.bcd-drawer .el-drawer__header {
  padding: 14px 20px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--bi-border-soft);
}
.bcd-drawer .el-drawer__body {
  padding: 18px 20px 12px;
}
.bcd-drawer .el-drawer__footer {
  padding: 12px 20px;
  border-top: 1px solid var(--bi-border-soft);
}
.bcd-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 文字按钮在本作用域还原成真文字（站点全局把 .el-button 压成实心块，见 bi-entry.less 说明） */
.bcd-drawer .el-button.is-text {
  padding: 0 6px;
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}
.bcd-drawer .el-button--primary.is-text,
.bcd-drawer .el-button--primary.is-text:hover {
  color: var(--bi-primary) !important;
}
.bcd-drawer .el-button--danger.is-text,
.bcd-drawer .el-button--danger.is-text:hover {
  color: var(--bi-danger) !important;
}
.bcd-drawer .el-button.is-text:hover {
  background: var(--bi-hover) !important;
}

/* 暗色：输入框与抽屉同为最暗的一阶，只靠描边几乎看不出"这里能输入"。
   抬一阶底色（--bi-head-bg）做出输入槽，亮色保持 EP 默认白底不动。 */
html.dark .bcd-drawer .el-input__wrapper,
html.dark .bcd-drawer .el-textarea__inner,
html.dark .bcd-drawer .el-select__wrapper {
  background-color: var(--bi-head-bg);
  box-shadow: 0 0 0 1px var(--bi-border) inset;
}
</style>
