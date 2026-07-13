<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="640px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div class="tpoc-container">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="选择打印方式" />
        <el-step title="选择模板" />
        <el-step title="确认打印" />
      </el-steps>

      <!-- 步骤 1 -->
      <div v-if="currentStep === 0" class="tpoc-step">
        <h4>请选择资产（共 {{ assets.length }} 项）</h4>
        <el-checkbox-group v-model="selectedAssets">
          <el-checkbox v-for="a in assets" :key="a.id" :label="a.id" :value="a.id">
            {{ a.name }} <span class="tpoc-meta">（{{ a.code }}）</span>
          </el-checkbox>
        </el-checkbox-group>

        <h4>请选择打印方式</h4>
        <el-radio-group v-model="printType">
          <el-radio-button label="direct">直接打印</el-radio-button>
          <el-radio-button label="export">导出 PDF</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 步骤 2 -->
      <div v-if="currentStep === 1" class="tpoc-step">
        <h4>请选择模板</h4>
        <el-radio-group v-model="templateId" class="tpoc-templates">
          <el-radio-button v-for="t in templates" :key="t.id" :label="t.id" border>
            <div class="tpoc-template-card">
              <div class="tpoc-template-name">{{ t.name }}</div>
              <div class="tpoc-template-meta">{{ t.width }}mm × {{ t.height }}mm</div>
            </div>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 步骤 3 -->
      <div v-if="currentStep === 2" class="tpoc-step">
        <h4>请确认打印信息</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="打印方式">
            {{ printType === 'direct' ? '直接打印' : '导出 PDF' }}
          </el-descriptions-item>
          <el-descriptions-item label="资产数量">{{ selectedAssets.length }}</el-descriptions-item>
          <el-descriptions-item label="模板">
            {{ currentTemplate?.name }}（{{ currentTemplate?.width }}mm × {{ currentTemplate?.height }}mm）
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="printing" class="tpoc-progress">
          <el-progress :percentage="progress" :status="progress >= 100 ? 'success' : ''" />
          <p class="tpoc-progress-tip">{{ progressTip }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
      <el-button
        v-if="currentStep < 2"
        type="primary"
        :disabled="!canNext"
        @click="currentStep++"
      >
        下一步
      </el-button>
      <el-button
        v-else
        type="primary"
        :loading="printing"
        @click="handlePrint"
      >
        {{ printType === 'direct' ? '开始打印' : '开始导出' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

export interface PrintAsset {
  id: string;
  name: string;
  code: string;
}
export interface PrintTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    assets?: PrintAsset[];
    templates?: PrintTemplate[];
  }>(),
  {
    title: '一物一码打印',
    assets: () => [
      { id: 'a-1', name: '中央空调', code: 'TS-2026-A-001' },
      { id: 'a-2', name: '消防泵', code: 'TS-2026-A-002' },
      { id: 'a-3', name: '电梯', code: 'TS-2026-A-003' },
      { id: 'a-4', name: '配电柜', code: 'TS-2026-A-004' },
    ],
    templates: () => [
      { id: 'tpl-1', name: '标准模板 100×60', width: 100, height: 60 },
      { id: 'tpl-2', name: '小型模板 60×40', width: 60, height: 40 },
      { id: 'tpl-3', name: '方形模板 80×80', width: 80, height: 80 },
    ],
  }
);

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'print', payload: any): void }>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const currentStep = ref(0);
const selectedAssets = ref<string[]>([]);
const printType = ref<'direct' | 'export'>('direct');
const templateId = ref<string>('');
const printing = ref(false);
const progress = ref(0);
const progressTip = ref('');

const currentTemplate = computed(() => props.templates.find((t) => t.id === templateId.value));

const canNext = computed(() => {
  if (currentStep.value === 0) return selectedAssets.value.length > 0;
  if (currentStep.value === 1) return !!templateId.value;
  return true;
});

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      currentStep.value = 0;
      selectedAssets.value = props.assets.length > 0 ? [props.assets[0].id] : [];
      templateId.value = props.templates[0]?.id || '';
      printing.value = false;
      progress.value = 0;
    }
  }
);

const handlePrint = () => {
  printing.value = true;
  progress.value = 0;
  progressTip.value = '准备数据...';

  const tick = () => {
    progress.value += Math.random() * 18 + 6;
    if (progress.value < 35) {
      progressTip.value = '正在拉取资产数据...';
    } else if (progress.value < 70) {
      progressTip.value = '正在生成图形码...';
    } else if (progress.value < 100) {
      progressTip.value = printType.value === 'direct' ? '正在打印...' : '正在导出 PDF...';
    } else {
      progress.value = 100;
      progressTip.value = '完成';
      const payload = {
        assetIds: selectedAssets.value,
        templateId: templateId.value,
        type: printType.value,
        template: currentTemplate.value,
      };
      emit('print', payload);
      ElMessage.success(printType.value === 'direct' ? '已发起打印' : '已导出 PDF');
      printing.value = false;
      setTimeout(() => (dialogVisible.value = false), 600);
      return;
    }
    setTimeout(tick, 400);
  };
  setTimeout(tick, 200);
};

const handleClose = () => {
  if (printing.value) return;
  dialogVisible.value = false;
};

defineOptions({ name: 'TePrintOneCode' });
</script>

<style lang="less" scoped>
.tpoc-container {
  padding: 0 16px;

  .tpoc-step {
    margin-top: 24px;

    h4 {
      margin: 16px 0 12px;
      font-size: 14px;
      color: #303133;
    }
  }

  :deep(.el-checkbox) {
    display: flex;
    width: 100%;
    margin-right: 0;
    margin-bottom: 8px;
    height: auto;
    padding: 8px 12px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }
}

.tpoc-meta { color: #909399; font-size: 12px; }

.tpoc-templates {
  display: flex;
  flex-direction: column;
  gap: 8px;
  :deep(.el-radio-button) {
    margin-right: 0;
    width: 100%;
  }
  :deep(.el-radio-button__inner) {
    width: 100%;
  }
}

.tpoc-template-card {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
}

.tpoc-template-name { font-size: 13px; }
.tpoc-template-meta { color: #909399; font-size: 12px; }

.tpoc-progress {
  margin-top: 16px;
  .tpoc-progress-tip {
    margin-top: 8px;
    color: #909399;
    font-size: 12px;
  }
}
</style>
