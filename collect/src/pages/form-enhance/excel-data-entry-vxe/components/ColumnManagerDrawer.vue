<script setup lang="ts">
// 列设置抽屉：排序 / 显隐 / 冻结 / 必填 / 校验规则 / 删除，改动即时生效
// 本组件直接编辑 ColumnManagerDrawer 暴露的 ColumnDef 响应式对象（label/visible/frozen/required 实时反映到表格）；
// 校验规则编辑交给嵌套的 RuleDialog，保存后调用 core.revalidateAll() 让错误标记立即同步。
// 协作：props.core(GridCore)→columnDefs / revalidateAll；props.ops(GridOps)→colDrawer / moveCol / removeCol；./RuleDialog
import { ref } from 'vue';
import type { GridCore } from '../hooks/useGridCore';
import type { GridOps } from '../hooks/useGridOps';
import { type ColDef, typeLabel } from '../types';
import RuleDialog from './RuleDialog.vue';

defineOptions({ name: 'ColumnManagerDrawer' });
const props = defineProps<{ core: GridCore; ops: GridOps }>();

const { columnDefs } = props.core;
const { colDrawer, moveCol, removeCol } = props.ops;

// 校验规则弹窗：直接编辑 ColDef（响应式），保存后全量重校让标记立即同步
const ruleVisible = ref(false);
const ruleDef = ref<ColDef | null>(null);
const openRule = (d: ColDef) => {
  ruleDef.value = d;
  ruleVisible.value = true;
};
const saveRule = (p: { rules: any; cross: any[] }) => {
  const d = ruleDef.value;
  if (!d) return;
  // 规则对象为空时写 undefined（而非空对象），避免无意义字段占用 ColDef
  d.rules = Object.keys(p.rules).length ? p.rules : undefined;
  d.cross = p.cross.length ? p.cross : undefined;
  // 规则变化后全量重校，使 cellErrors / errorList / 状态栏错误数立即更新
  props.core.revalidateAll();
};
// 判断某列是否配置了规则（用于在列设置行显示高亮齿轮）
const hasRule = (d: ColDef) => !!d.rules || !!d.cross?.length;
</script>

<template>
  <el-drawer v-model="colDrawer" title="列设置" direction="rtl" size="480px" class="dt-dlg">
    <div class="col-set-tip">拖拽排序、显隐、冻结、必填、校验规则；改完即时生效。可删除多余列。</div>
    <div class="col-set-list">
      <!-- 直接 v-model 绑定 ColDef 字段：label/visible/frozen/required 的改动会即时反映到表格（响应式） -->
      <div v-for="(d, i) in columnDefs" :key="d.field" class="col-set-item">
        <span class="col-order">
          <!-- 上移：首行禁用；下移：末行禁用 -->
          <el-button text size="small" :disabled="i === 0" @click="moveCol(i, -1)">↑</el-button>
          <el-button text size="small" :disabled="i === columnDefs.length - 1" @click="moveCol(i, 1)">↓</el-button>
        </span>
        <el-input v-model="d.label" size="small" class="col-label" />
        <el-tag size="small" effect="plain">{{ typeLabel[d.type] }}</el-tag>
        <el-switch v-model="d.visible" size="small" inline-prompt active-text="显" inactive-text="隐" />
        <el-switch v-model="d.frozen" size="small" inline-prompt active-text="冻" inactive-text="松" />
        <el-switch v-model="d.required" size="small" inline-prompt active-text="必" inactive-text="选" />
        <el-button
          text
          size="small"
          :type="hasRule(d) ? 'primary' : 'default'"
          title="校验规则（区间/长度/正则/唯一/跨列）"
          @click="openRule(d)"
        >
          ⚙
        </el-button>
        <el-button text size="small" type="danger" title="删除列" @click="removeCol(d.field)">🗑</el-button>
      </div>
    </div>
    <RuleDialog
      :visible="ruleVisible"
      :def="ruleDef"
      :all-defs="columnDefs"
      @close="ruleVisible = false"
      @save="saveRule"
    />
  </el-drawer>
</template>

<style scoped>
.col-set-tip {
  font-size: 12px;
  color: var(--dt-sub);
  margin-bottom: 10px;
}
.col-set-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.col-set-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--dt-border);
  border-radius: 8px;
  background: var(--dt-hover);
}
.col-order {
  display: flex;
  flex-direction: column;
}
.col-label {
  flex: 1;
}
</style>
