<template>
  <el-dialog v-model="dialogVisible" :title="title" width="480px" destroy-on-close>
    <div class="tpq-container">
      <el-radio-group v-model="localStyle" class="tpq-mode">
        <el-radio-button label="lbp">浏览器打印</el-radio-button>
        <el-radio-button label="brother">兄弟打印机</el-radio-button>
        <el-radio-button label="postek">Postek RFID</el-radio-button>
      </el-radio-group>

      <div class="tpq-stage">
        <component :is="currentComp" :content="content" :device="device" />
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, markRaw } from 'vue';
import { ElDialog, ElRadioGroup, ElRadioButton } from 'element-plus';
import TpqLbp from './components/tpq-lbp.vue';
import TpqBrother from './components/tpq-brother.vue';
import TpqPostek from './components/tpq-postek.vue';

export type PrintStyle = 'lbp' | 'brother' | 'postek';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    content?: string;
    templateStyle?: PrintStyle;
    device?: string;
  }>(),
  {
    title: '打印二维码',
    content: 'TS-2026-A-001',
    templateStyle: 'lbp',
    device: 'Default',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'update:templateStyle', v: PrintStyle): void;
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});
const localStyle = ref<PrintStyle>(props.templateStyle);

watch(
  () => props.templateStyle,
  (v) => (localStyle.value = v),
);
watch(localStyle, (v) => emit('update:templateStyle', v));

/* 分发器: 用 shallowRef 避免深度响应 */
const currentComp = computed(() => {
  switch (localStyle.value) {
    case 'brother':
      return markRaw(TpqBrother);
    case 'postek':
      return markRaw(TpqPostek);
    default:
      return markRaw(TpqLbp);
  }
});

defineOptions({ name: 'TePrintQr' });
</script>

<style lang="less" scoped>
.tpq-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tpq-mode {
  display: flex;
  justify-content: center;
}
.tpq-stage {
  padding: 8px 0;
}
</style>
