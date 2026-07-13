<template>
  <div class="te-project-list">
    <el-input v-model="searchValue" placeholder="搜索项目" clearable :prefix-icon="Search" class="tpl-search" />
    <div class="tpl-body">
      <el-checkbox-group v-if="multiple" v-model="innerValue" class="tpl-group">
        <div v-for="p in filteredList" :key="p.id" class="tpl-item" :class="{ checked: innerValue.includes(p.id) }">
          <el-checkbox :label="p.id" :value="p.id" />
          <div class="tpl-item-info">
            <div class="tpl-item-name">
              {{ p.name }}
              <span class="tpl-item-code">@{{ p.code }}</span>
            </div>
            <div class="tpl-item-meta">
              <el-tag size="small" effect="plain">{{ p.campusName }}</el-tag>
              <el-tag size="small" type="info" effect="plain">{{ p.groupName }}</el-tag>
            </div>
          </div>
        </div>
      </el-checkbox-group>
      <el-radio-group v-else v-model="innerValue[0]" class="tpl-group" @change="onRadioChange">
        <div
          v-for="p in filteredList"
          :key="p.id"
          class="tpl-item"
          :class="{ checked: !multiple && innerValue[0] === p.id }"
        >
          <el-radio :label="p.id">{{ p.name }}</el-radio>
          <div class="tpl-item-info">
            <div class="tpl-item-meta">
              <el-tag size="small" effect="plain">{{ p.campusName }}</el-tag>
            </div>
          </div>
        </div>
      </el-radio-group>
      <el-empty v-if="filteredList.length === 0" description="无匹配项目" :image-size="60" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElInput, ElCheckboxGroup, ElCheckbox, ElRadioGroup, ElRadio, ElEmpty, ElTag } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { searchProjects } from '../../../_mock/project';

const props = defineProps<{ modelValue: string[]; multiple: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void; (e: 'change', v: string[]): void }>();

const searchValue = ref('');
const innerValue = ref<string[]>([...props.modelValue]);

watch(
  () => props.modelValue,
  (v) => (innerValue.value = [...v]),
);
watch(innerValue, (v) => {
  emit('update:modelValue', v);
  emit('change', v);
});

const filteredList = computed(() => searchProjects(searchValue.value));

const onRadioChange = (val: any) => {
  innerValue.value = [val];
};

defineOptions({ name: 'ProjectList' });
</script>

<style lang="less" scoped>
.te-project-list {
  display: flex;
  flex-direction: column;
  height: 400px;

  .tpl-search {
    margin-bottom: 8px;
  }
  .tpl-body {
    flex: 1;
    overflow: auto;
  }
  .tpl-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tpl-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    transition: all 0.15s;

    &.checked {
      background: #ecf5ff;
      border-color: #409eff;
    }
  }
  .tpl-item-info {
    flex: 1;
    margin-left: 8px;
  }
  .tpl-item-name {
    font-size: 13px;
  }
  .tpl-item-code {
    color: #909399;
    font-size: 12px;
  }
  .tpl-item-meta {
    display: flex;
    gap: 4px;
    margin-top: 4px;
  }
}
</style>
