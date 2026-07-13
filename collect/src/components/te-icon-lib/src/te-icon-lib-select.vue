<template>
  <el-dialog v-model="visible" title="选择图标" width="760px" :close-on-click-modal="false" destroy-on-close>
    <div class="tils">
      <div class="tils-top">
        <el-input v-model="searchValue" placeholder="搜索图标名称" clearable :prefix-icon="Search" />
        <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="onUpload" accept="image/*">
          <el-button type="primary">上传图片</el-button>
        </el-upload>
      </div>

      <el-tabs v-model="activeCategory" class="tils-tabs">
        <el-tab-pane
          v-for="cat in categories"
          :key="cat.id"
          :label="`${cat.name} (${getCountByCategory(cat.id)})`"
          :name="cat.id"
        />
      </el-tabs>

      <div class="tils-grid">
        <div
          v-for="item in filteredIcons"
          :key="item.id"
          class="tils-cell"
          :class="{ selected: isSelected(item.id) }"
          @click="toggleSelect(item)"
        >
          <img :src="item.url" :alt="item.name" class="tils-img" />
          <div class="tils-cell-name">{{ item.name }}</div>
        </div>
        <el-empty v-if="filteredIcons.length === 0" description="无匹配图标" :image-size="60" />
      </div>
    </div>

    <template #footer>
      <div class="tils-footer">
        <span>已选 {{ picked.length }} / {{ limit }}</span>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElDialog, ElInput, ElTabs, ElTabPane, ElUpload, ElButton, ElEmpty } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { mockIconCategories, mockIconLib, type MockIcon } from '../../_mock/icon-lib';

interface Props {
  modelValue: boolean;
  /** 初始已选 id 列表 */
  selectedIds?: string[];
  limit?: number;
  purposeEq?: string;
}
const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => [],
  limit: 9,
  purposeEq: '',
});
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'selected', items: MockIcon[]): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const searchValue = ref('');
const activeCategory = ref<string>('');
const picked = ref<MockIcon[]>([]);

const categories = computed(() => mockIconCategories);

const filteredIcons = computed(() => {
  const k = searchValue.value.trim().toLowerCase();
  return mockIconLib.filter((i) => {
    if (activeCategory.value && i.categoryId !== activeCategory.value) return false;
    if (k && !i.name.toLowerCase().includes(k)) return false;
    if (props.purposeEq && i.purpose !== props.purposeEq) return false;
    return true;
  });
});

const getCountByCategory = (id: string) => mockIconLib.filter((i) => i.categoryId === id).length;

const isSelected = (id: string) => picked.value.some((p) => p.id === id);

watch(
  () => props.selectedIds,
  (ids) => {
    picked.value = mockIconLib.filter((i) => ids.includes(i.id));
  },
  { immediate: true },
);

const toggleSelect = (item: MockIcon) => {
  const idx = picked.value.findIndex((p) => p.id === item.id);
  if (idx >= 0) {
    picked.value.splice(idx, 1);
  } else {
    if (picked.value.length >= props.limit) {
      picked.value.shift();
    }
    picked.value.push(item);
  }
};

const onUpload = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    const newItem: MockIcon = {
      id: `up-${Date.now()}`,
      name: file.name.replace(/\.[^.]+$/, ''),
      url: dataUrl,
      categoryId: activeCategory.value || categories.value[0]?.id || 'c-1',
      purpose: props.purposeEq || 'default',
    };
    mockIconLib.push(newItem);
  };
  reader.readAsDataURL(file.raw);
};

const confirm = () => {
  emit('selected', [...picked.value]);
  visible.value = false;
};

defineOptions({ name: 'TeIconLibSelect' });
</script>

<style lang="less" scoped>
.tils {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tils-top {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tils-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 8px;
  }
}

.tils-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 380px;
  overflow: auto;
  padding: 4px;
}

.tils-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;

  &.selected {
    border-color: #409eff;
    background: #ecf5ff;
  }
  &:hover {
    border-color: #409eff;
  }
}

.tils-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.tils-cell-name {
  margin-top: 4px;
  font-size: 12px;
  text-align: center;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.tils-footer {
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    color: #909399;
    font-size: 12px;
    margin-right: auto;
  }
}
</style>
