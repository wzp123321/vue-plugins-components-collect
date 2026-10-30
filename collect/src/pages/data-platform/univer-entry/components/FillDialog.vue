<script setup lang="ts">
// 批量填充分钟：选列 + 填值 + 作用范围（选区 / 全部行）→ 一次 setValues 写入
// 与 vxe 版 GridFillBar 等价；数字列在 ops.batchFill 内部做 NaN 拦截。
import { computed, reactive, watch } from 'vue';
import type { ColDef } from '../schema';
import type { EntryOps } from '../useEntryOps';

defineOptions({ name: 'FillDialog' });

const props = defineProps<{
  visible: boolean;
  defs: ColDef[];
  ops: EntryOps;
}>();

const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>();

const form = reactive({ field: '', value: '', scope: 'selection' as 'selection' | 'all' });

// 首次打开时默认选中第一列，避免空下拉
watch(
  () => props.visible,
  (v) => {
    if (v && !form.field) form.field = props.defs[0]?.field ?? '';
  },
);

const currentDef = computed(() => props.defs.find((d) => d.field === form.field));

const apply = () => {
  if (!form.field) return;
  props.ops.batchFill(form.field, form.value, form.scope);
  emit('update:visible', false);
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="批量填充"
    width="420px"
    class="ue-dlg"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
  >
    <div class="fd-form">
      <div class="fd-row">
        <span class="fd-label">目标列</span>
        <el-select v-model="form.field" size="small" style="width: 200px">
          <el-option v-for="d in defs" :key="d.field" :label="`${d.label}（${d.type}）`" :value="d.field" />
        </el-select>
      </div>
      <div class="fd-row">
        <span class="fd-label">填充值</span>
        <el-input v-model="form.value" size="small" style="width: 200px" placeholder="留空表示清空该列" />
      </div>
      <div class="fd-row">
        <span class="fd-label">作用范围</span>
        <el-radio-group v-model="form.scope" size="small">
          <el-radio-button value="selection">当前选区</el-radio-button>
          <el-radio-button value="all">全部数据行</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="currentDef?.type === 'select'" class="fd-tip">
        下拉列可选项：{{ (currentDef.options ?? []).join('、') || '未配置' }}
      </div>
      <div v-else-if="currentDef?.type === 'number'" class="fd-tip">数字列只接受数值，非法内容会被拦截</div>
    </div>
    <template #footer>
      <el-button size="small" @click="emit('update:visible', false)">取消</el-button>
      <el-button size="small" type="primary" @click="apply">填充</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.fd-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fd-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fd-label {
  width: 64px;
  font-size: 13px;
  color: var(--ue-sub);
}
.fd-tip {
  font-size: 12px;
  color: var(--ue-sub);
  line-height: 1.5;
}
</style>
