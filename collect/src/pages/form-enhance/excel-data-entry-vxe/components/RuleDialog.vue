<script setup lang="ts">
// 列校验规则编辑弹窗：把 ColDef.rules / ColDef.cross 可视化配置出来。
// 动机：校验规则声明化后，新增/修改列也应能直接配规则，而不是回去改代码。
// 本组件是"纯表单"：打开时把当前 ColDef 的规则灌入内部 form，保存时产出 { rules, cross } 交给父级落库。
// 协作：props.def(当前列) / allDefs(跨列规则可参照的列)；emit('save') 把规则交回 ColumnManagerDrawer。
import { reactive, watch } from 'vue';
import type { ColDef, CrossKind } from '../types';

defineOptions({ name: 'RuleDialog' });
const props = defineProps<{ visible: boolean; def: ColDef | null; allDefs: ColDef[] }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'save', payload: { rules: any; cross: any[] }): void }>();

interface CrossForm {
  kind: CrossKind;
  other: string;
  msg: string;
}

// 内部表单：数字类字段用字符串表示，便于"留空=未设置"（空串在保存时被过滤）
const form = reactive({
  min: '',
  max: '',
  minLen: '',
  maxLen: '',
  pattern: '',
  patternMsg: '',
  unique: false,
  cross: [] as CrossForm[],
});

const kindLabel: Record<CrossKind, string> = {
  gte: '≥ 参照列',
  lte: '≤ 参照列',
  eq: '= 参照列',
  requiredIf: '参照列有值时必填',
};

// 打开时把 def 现有规则灌入表单（数字转字符串便于留空表达"未设置"）
watch(
  () => props.visible,
  (v) => {
    if (!v || !props.def) return;
    const r = props.def.rules ?? {};
    form.min = r.min === undefined ? '' : String(r.min);
    form.max = r.max === undefined ? '' : String(r.max);
    form.minLen = r.minLen === undefined ? '' : String(r.minLen);
    form.maxLen = r.maxLen === undefined ? '' : String(r.maxLen);
    form.pattern = r.pattern ?? '';
    form.patternMsg = r.patternMsg ?? '';
    form.unique = !!r.unique;
    form.cross = (props.def.cross ?? []).map((c) => ({ kind: c.kind, other: c.other, msg: c.msg ?? '' }));
  },
  { immediate: true },
);

// 空串 → undefined（不写入规则）；否则 Number 转换（注意：Number('') === 0，故先 trim 判空）
const num = (s: string): number | undefined => (s.trim() === '' ? undefined : Number(s));
// 新增一条跨列规则：默认参照列取"非当前列"的第一列，kind 默认 gte
const addCross = () => {
  const other = props.allDefs.find((d) => d.field !== props.def?.field)?.field;
  if (other) form.cross.push({ kind: 'gte', other, msg: '' });
};
const removeCross = (i: number) => form.cross.splice(i, 1);

const save = () => {
  const rules: any = {};
  const min = num(form.min);
  const max = num(form.max);
  const minLen = num(form.minLen);
  const maxLen = num(form.maxLen);
  // 仅当转换成功且非 NaN 才写入上下界/长度规则
  if (min !== undefined && !Number.isNaN(min)) rules.min = min;
  if (max !== undefined && !Number.isNaN(max)) rules.max = max;
  if (minLen !== undefined && !Number.isNaN(minLen)) rules.minLen = minLen;
  if (maxLen !== undefined && !Number.isNaN(maxLen)) rules.maxLen = maxLen;
  if (form.pattern.trim()) rules.pattern = form.pattern.trim();
  if (form.patternMsg.trim()) rules.patternMsg = form.patternMsg.trim();
  if (form.unique) rules.unique = true;
  // 跨列规则：过滤掉未选参照列的；msg 空则不输出 msg 字段
  const cross = form.cross
    .filter((c) => c.other)
    .map((c) => (c.msg.trim() ? { kind: c.kind, other: c.other, msg: c.msg.trim() } : { kind: c.kind, other: c.other }));
  emit('save', { rules, cross });
  emit('close');
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="def ? `校验规则 · ${def.label}` : '校验规则'"
    width="520px"
    class="dt-dlg"
    @close="emit('close')"
    @update:model-value="(v: boolean) => !v && emit('close')"
  >
    <div class="rule-form">
      <!-- 仅数字列展示数值区间；长度/正则/唯一对所有文本类列通用 -->
      <div class="rule-row" v-if="def?.type === 'number'">
        <span class="rule-label">数值区间</span>
        <el-input v-model="form.min" placeholder="最小值" style="width: 110px" />
        <span class="rule-tilde">~</span>
        <el-input v-model="form.max" placeholder="最大值" style="width: 110px" />
      </div>
      <div class="rule-row">
        <span class="rule-label">长度</span>
        <el-input v-model="form.minLen" placeholder="最少字符" style="width: 110px" />
        <span class="rule-tilde">~</span>
        <el-input v-model="form.maxLen" placeholder="最多字符" style="width: 110px" />
      </div>
      <div class="rule-row">
        <span class="rule-label">正则</span>
        <el-input v-model="form.pattern" placeholder="如 ^1\d{10}$（不带斜杠）" style="flex: 1" />
      </div>
      <div class="rule-row">
        <span class="rule-label">提示语</span>
        <el-input v-model="form.patternMsg" placeholder="正则不通过时的提示，如：手机号格式不正确" style="flex: 1" />
      </div>
      <div class="rule-row">
        <span class="rule-label">唯一</span>
        <el-switch v-model="form.unique" inline-prompt active-text="唯一" inactive-text="可重复" />
        <span class="rule-hint">整列不允许出现重复值（工号、邮箱等）</span>
      </div>

      <div class="rule-cross-head">
        <span class="rule-label">跨列规则</span>
        <el-button size="small" plain @click="addCross">＋ 添加</el-button>
      </div>
      <div v-if="!form.cross.length" class="rule-hint" style="padding-left: 2px">暂无（例：入职 ≤ 离职、确认值 = 输入值）</div>
      <div v-for="(c, i) in form.cross" :key="i" class="rule-cross-row">
        <el-select v-model="c.kind" style="width: 132px">
          <el-option v-for="(label, k) in kindLabel" :key="k" :label="label" :value="k" />
        </el-select>
        <!-- 参照列下拉：排除"自身列"，避免跨列规则指向自己 -->
        <el-select v-model="c.other" style="width: 120px" placeholder="参照列">
          <el-option
            v-for="d in allDefs.filter((x) => x.field !== def?.field)"
            :key="d.field"
            :label="d.label"
            :value="d.field"
          />
        </el-select>
        <el-input v-model="c.msg" placeholder="自定义提示（可空）" style="flex: 1" />
        <el-button text type="danger" size="small" @click="removeCross(i)">✕</el-button>
      </div>
    </div>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.rule-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rule-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rule-label {
  width: 76px;
  flex: none;
  font-size: 12.5px;
  color: var(--dt-sub);
}
.rule-tilde {
  color: var(--dt-sub);
}
.rule-hint {
  font-size: 12px;
  color: var(--dt-sub);
}
.rule-cross-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px dashed var(--dt-border);
  padding-top: 10px;
  margin-top: 2px;
}
.rule-cross-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
