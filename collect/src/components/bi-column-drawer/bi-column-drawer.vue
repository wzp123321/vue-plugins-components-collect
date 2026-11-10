<!--
  列配置抽屉（三套 BI 录入台共用 · 单列配置）
  ============================================================================
  职责：点列头 / 点列表里的「配置」后，只配置**这一列**。
  交互（三套必须一致，本组件即唯一定义处）：
    · 容器：右侧 el-drawer，宽 440px，挂 .bi-dlg 继承 BI 色板；
    · 标题：「列配置 · 列名」（列名取打开时的快照，输入框改动不带着标题跳）；
    · 提交：草稿模式——改动先落在本地，点「确定」才整体回写，点「取消 / 遮罩 / Esc」丢弃；
    · 分区顺序固定：基本信息 → 类型配置 → 校验规则 → 跨列规则 → 显示与视图 → 危险操作。
  引擎差异只允许出现在**能力**上（caps）：冻结 / 表头分组 / 列宽，不做假统一。

  协作：各引擎把 colDef 映射成 :column 传进来，@confirm 里整体回写并重建表格。
-->
<template>
  <el-drawer
    :model-value="visible"
    :title="title"
    size="440px"
    class="bi-dlg"
    @close="close"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
  >
    <div v-if="column || isAddMode" class="bcd">
      <el-form label-width="88px" label-position="left" size="small" class="bcd-form">
        <!-- ===== 基本信息 ===== -->
        <section class="bcd-sec">
          <div class="bcd-sec__hd"><span>基本信息</span></div>
          <el-form-item label="列名">
            <el-input v-model="draft.label" maxlength="20" placeholder="列名" />
          </el-form-item>
          <el-form-item label="数据类型">
            <el-select v-model="draft.type" style="width: 100%">
              <el-option v-for="t in TYPES" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </el-form-item>
        </section>

        <!-- ===== 类型配置 ===== -->
        <section class="bcd-sec">
          <div class="bcd-sec__hd">
            <span>类型配置</span>
            <em class="bcd-sec__tag">{{ typeLabel }}</em>
          </div>
          <el-form-item v-if="draft.type === 'select'" label="下拉选项">
            <div class="bcd-options">
              <div v-for="(_, i) in draft.options" :key="i" class="bcd-option">
                <el-input v-model="draft.options[i]" placeholder="选项文本" />
                <el-button text type="danger" :disabled="draft.options.length <= 1" @click="removeOption(i)">✕</el-button>
              </div>
              <el-button text type="primary" @click="addOption">＋ 添加选项</el-button>
              <div class="bcd-hint">单元格以下拉形式录入，值必须落在选项内</div>
            </div>
          </el-form-item>
          <el-form-item v-else-if="draft.type === 'number'" label="数值范围">
            <div class="bcd-range">
              <el-input-number v-model="minRule" :controls="false" placeholder="最小" class="bcd-num" />
              <span class="bcd-tilde">~</span>
              <el-input-number v-model="maxRule" :controls="false" placeholder="最大" class="bcd-num" />
              <el-checkbox v-model="integerRule">整数</el-checkbox>
            </div>
          </el-form-item>
          <el-form-item v-else-if="draft.type === 'date'" label="显示格式">
            <el-select v-model="draft.dateFormat" filterable allow-create default-first-option style="width: 100%">
              <el-option v-for="f in DATE_FORMATS" :key="f" :label="f" :value="f" />
            </el-select>
          </el-form-item>
          <el-form-item v-else-if="draft.type === 'region'" label="院区选择">
            <div class="bcd-hint">点击该列单元格会弹出「院区选择框」，选中后回填院区名称，并保存 id / code</div>
          </el-form-item>
          <p v-else class="bcd-sec__empty">文本类型无需额外配置</p>
        </section>

        <!-- ===== 校验规则 ===== -->
        <section class="bcd-sec">
          <div class="bcd-sec__hd"><span>校验规则</span></div>
          <el-form-item v-if="draft.type === 'text'" label="长度限制">
            <div class="bcd-range">
              <el-input-number v-model="minLenRule" :controls="false" :min="0" placeholder="最短" class="bcd-num" />
              <span class="bcd-tilde">~</span>
              <el-input-number v-model="maxLenRule" :controls="false" :min="0" placeholder="最长" class="bcd-num" />
            </div>
          </el-form-item>
          <el-form-item v-if="draft.type === 'text'" label="正则">
            <div class="bcd-col">
              <el-input v-model="draft.rules.pattern" placeholder="正则源（不带斜杠），如 ^\d{11}$" />
              <el-input v-model="draft.rules.patternMsg" placeholder="不匹配时的提示文案" />
            </div>
          </el-form-item>
          <el-form-item label="整列唯一">
            <el-checkbox v-model="draft.rules.unique">同列取值不可重复（工号 / 邮箱等）</el-checkbox>
          </el-form-item>
        </section>

        <!-- ===== 跨列规则 ===== -->
        <section class="bcd-sec">
          <div class="bcd-sec__hd"><span>跨列规则</span></div>
          <div class="bcd-cross">
            <div v-for="(r, i) in draft.cross" :key="i" class="bcd-crossrow">
              <el-select v-model="r.kind" class="bcd-crosskind">
                <el-option v-for="k in CROSS_KINDS" :key="k.value" :label="k.label" :value="k.value" />
              </el-select>
              <el-select v-model="r.other" placeholder="参照列" class="bcd-crossother">
                <el-option
                  v-for="s in otherColumns"
                  :key="s.field"
                  :label="s.label"
                  :value="s.field"
                />
              </el-select>
              <div class="bcd-crossrow2">
                <el-input v-model="r.msg" placeholder="不通过时的提示（留空走默认文案）" />
                <el-button text type="danger" @click="draft.cross.splice(i, 1)">✕</el-button>
              </div>
            </div>
            <el-button text type="primary" :disabled="!otherColumns.length" @click="addCross">＋ 添加跨列规则</el-button>
            <div v-if="!otherColumns.length" class="bcd-hint">表里只有这一列，暂无可参照的列</div>
          </div>
        </section>

        <!-- ===== 显示与视图（能力差异走 caps） ===== -->
        <section class="bcd-sec">
          <div class="bcd-sec__hd"><span>显示与视图</span></div>
          <el-form-item label="列状态">
            <div class="bcd-flags">
              <div class="bcd-switches">
                <el-switch v-model="draft.required" inline-prompt active-text="必" inactive-text="选" />
                <el-switch v-model="draft.visible" inline-prompt active-text="显" inactive-text="隐" />
                <el-switch
                  v-if="caps.frozen"
                  v-model="draft.frozen"
                  inline-prompt
                  active-text="冻"
                  inactive-text="松"
                />
              </div>
              <div class="bcd-hint">必填 / 显示 / 冻结</div>
            </div>
          </el-form-item>
          <el-form-item v-if="caps.width" label="列宽">
            <div class="bcd-range">
              <el-input-number v-model="draft.width" :controls="false" :min="60" :step="10" class="bcd-num" />
              <span class="bcd-unit">px</span>
            </div>
          </el-form-item>
          <el-form-item v-if="caps.group" label="表头分组">
            <el-input v-model="draft.group" placeholder="留空=单层表头；相邻同名列归到一个父表头" />
          </el-form-item>
        </section>
      </el-form>

      <!-- ===== 危险操作（新增模式还没有这列，隐藏） ===== -->
      <section v-if="!isAddMode" class="bcd-sec bcd-sec--danger">
        <div class="bcd-sec__hd"><span>危险操作</span></div>
        <p class="bcd-sec__desc">删除后该列及已录入数据将从表格移除，且不可撤销。</p>
        <el-button type="danger" plain @click="onRemove">删除该列</el-button>
      </section>
    </div>
    <div v-else class="bcd-empty">列不存在或已被删除</div>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
// 说明：抽屉是纯 UI 层，不碰任何引擎 API。所有读写都走 draft，确认后由父级整体回写。
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
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

/** 分区标题上的当前类型小标签 */
const typeLabel = computed(() => TYPES.find((t) => t.value === draft.type)?.label ?? draft.type);

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
 * 确定：校验 → 裁剪 → 交出草稿 → 关抽屉。
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
/* 「＋ 添加」这类文字按钮的观感由全局 assets/style/bi-entry.less 统一还原（.bi-dlg 作用域），
 * 这里只管抽屉内部布局与分区层级。 */
.bcd-form {
  padding-right: 2px;
}
.bcd-form :deep(.el-form-item) {
  margin-bottom: 12px;
}
.bcd-form :deep(.el-form-item__label) {
  color: var(--bi-text);
  font-weight: 500;
}

/* ===== 分区卡片：把原平铺表单切成有层级的区块 ===== */
.bcd-sec {
  margin-bottom: 16px;
}
.bcd-sec__hd {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--bi-text);
  letter-spacing: 0.3px;
  padding: 0 0 7px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--bi-border-soft);
}
.bcd-sec__hd::before {
  content: '';
  width: 3px;
  height: 12px;
  border-radius: 2px;
  background: var(--bi-primary);
  flex: 0 0 auto;
}
.bcd-sec__tag {
  font-style: normal;
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
  color: var(--bi-primary);
  background: var(--bi-primary-soft);
  padding: 0 6px;
  border-radius: 4px;
}
.bcd-sec__empty {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--bi-sub);
}
.bcd-sec__desc {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--bi-sub);
}

/* ===== 危险区：浅红底 + 柔和红描边，明确隔离不可逆动作 ===== */
.bcd-sec--danger {
  background: var(--bi-danger-bg);
  border: 1px solid color-mix(in srgb, var(--bi-danger) 38%, transparent);
  border-radius: var(--bi-radius);
  padding: 12px 14px;
}
.bcd-sec--danger .bcd-sec__hd {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
  color: var(--bi-danger);
}
.bcd-sec--danger .bcd-sec__hd::before {
  background: var(--bi-danger);
}

/* ===== 字段内部堆叠布局（原逻辑保留） ===== */
.bcd-options,
.bcd-cross,
.bcd-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
/* 纵向堆叠容器里的按钮默认会被拉满整行，"＋ 添加选项"变成一条横条——靠左还给文字宽度 */
.bcd-options > .el-button,
.bcd-cross > .el-button {
  align-self: flex-start;
}
.bcd-flags {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.bcd-switches {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bcd-option,
.bcd-range,
.bcd-crossrow2 {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bcd-range {
  gap: 8px;
}
.bcd-num {
  width: 108px;
}
.bcd-tilde,
.bcd-unit,
.bcd-hint {
  font-size: 12px;
  color: var(--bi-sub);
}
.bcd-crossrow {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--bi-border);
  border-radius: 6px;
  background: var(--bi-hover);
}
.bcd-crosskind,
.bcd-crossother {
  width: 100%;
}
.bcd-empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: var(--bi-sub);
}
</style>
