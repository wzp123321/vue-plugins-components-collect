<template>
  <div class="te-icon-lib">
    <div v-for="(item, index) in selected" :key="item.id" class="til-image">
      <img :src="item.url" :alt="item.name" />
      <div class="til-overlay">
        <el-icon class="til-view" @click="preview(index)"><View /></el-icon>
        <el-icon class="til-delete" @click="deleteImage(index)"><Delete /></el-icon>
      </div>
    </div>

    <te-icon-lib-select
      v-if="selected.length < limit"
      v-model="dialogVisible"
      :selected-ids="selected.map((s) => s.id)"
      :limit="limit - selected.length"
      :purpose-eq="purposeEq"
      @selected="handleConfirm"
    >
      <div class="til-upload">
        <el-icon class="til-upload-icon"><Plus /></el-icon>
        <div class="til-upload-text">上传</div>
      </div>
    </te-icon-lib-select>

    <el-dialog
      v-model="imagePreview"
      title="图片预览"
      width="600px"
      destroy-on-close
      append-to-body
    >
      <div class="til-preview-stage">
        <img v-if="previewItem" :src="previewItem.url" :alt="previewItem.name" class="til-preview-img" />
      </div>
      <div v-if="previewItem" class="til-preview-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="名称">{{ previewItem.name }}</el-descriptions-item>
          <el-descriptions-item label="ID">{{ previewItem.id }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElIcon, ElDialog, ElDescriptions, ElDescriptionsItem } from 'element-plus';
import { View, Delete, Plus } from '@element-plus/icons-vue';
import { mockIconLib, type MockIcon } from '../../_mock/icon-lib';
import TeIconLibSelect from './te-icon-lib-select.vue';

interface Props {
  modelValue?: MockIcon[];
  limit?: number;
  purposeEq?: string;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  limit: 9,
  purposeEq: '',
});
const emit = defineEmits<{ (e: 'update:modelValue', v: MockIcon[]): void; (e: 'change', v: MockIcon[]): void }>();

const dialogVisible = ref(false);
const imagePreview = ref(false);
const initialIndex = ref(0);

const selected = computed({
  get: () => props.modelValue,
  set: (v) => {
    emit('update:modelValue', v);
    emit('change', v);
  },
});

const previewItem = computed<MockIcon | undefined>(() => selected.value[initialIndex.value]);

const preview = (index: number) => {
  initialIndex.value = index;
  imagePreview.value = true;
};

const deleteImage = (index: number) => {
  const next = [...selected.value];
  next.splice(index, 1);
  emit('update:modelValue', next);
  emit('change', next);
};

const handleConfirm = (items: MockIcon[]) => {
  // 合并去重
  const map = new Map<string, MockIcon>();
  [...selected.value, ...items].forEach((i) => map.set(i.id, i));
  const next = Array.from(map.values()).slice(0, props.limit);
  emit('update:modelValue', next);
  emit('change', next);
  dialogVisible.value = false;
};

// 兼容原版接口: 默认拉一次 mock
void mockIconLib;

defineOptions({ name: 'TeIconLib' });
</script>

<style lang="less" scoped>
.te-icon-lib {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.til-image {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.til-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}

.til-image:hover .til-overlay { opacity: 1; }

.til-upload {
  width: 100px;
  height: 100px;
  border: 1px dashed #c0c4cc;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;

  &:hover { border-color: #409eff; color: #409eff; }
}

.til-upload-icon { font-size: 24px; }
.til-upload-text { font-size: 12px; margin-top: 4px; }

.til-preview-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  background: #fafbfc;
  border-radius: 4px;
}

.til-preview-img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.til-preview-info { margin-top: 12px; }
</style>
