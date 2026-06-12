<template>
  <!-- 搜索框 -->
  <tsm-search
    v-model="searchValue"
    :clearable="true"
    :delay="300"
    placeholder="搜索姓名、拼音、工号"
    class="tsm-select-department-employee-search"
    @search="handleSearch"
  />
  <!-- 搜索结果 -->
  <view v-if="searchValue && !showEmpty" class="tsm-select-department-employee-search-result">
    <list-cell
      v-for="item in searchList"
      :key="item.id"
      :data="item"
      v-model:selected="selected"
      @select="handleSelect"
    />
  </view>
  <tsm-empty class="tsm-select-department-employee-search-result-empty" type="noSearch" v-if="showEmpty" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { type dataProps } from '../../../common/list-cell/props';
import ListCell from '../../../common/list-cell/list-cell.vue';

const props = withDefaults(
  defineProps<{
    loading: boolean;
    searchValue: string;
    searchList: dataProps[];
    selected: dataProps[];
  }>(),
  {
    loading: false,
    searchValue: '',
    searchList: () => [],
    selected: () => [],
  }
);

const showEmpty = ref(false);
const searchValue = computed({
  get: () => props.searchValue,
  set: val => {
    if (!val) showEmpty.value = false;
    emit('update:search-value', val)
  },
});
const selected = computed({
  get: () => props.selected,
  set: val => emit('update:selected', val),
});
const searchList = computed(() => props.searchList.map(i => ({ ...i, subtitle: i.departmentFullName! })));
const emit = defineEmits(['search', 'update:search-value', 'update:selected']);
const handleSearch = async (val: string) => {
  showEmpty.value = false;
  await emit('search', val);
  showEmpty.value = searchList.value.length === 0 && !props.loading && !!searchValue.value;
};
const handleSelect = (item: dataProps) => {
  selected.value = selected.value?.some(i => i.id === item.id && !i.isDepartment)
    ? selected.value?.filter(i => i.id !== item.id && !i.isDepartment)
    : (selected.value || []).concat(item);
};
</script>

<style scoped lang="scss">
.tsm-select-department-employee-search {
  margin-bottom: 8px;
}

.tsm-select-department-employee-search-result-empty {
  height: calc(100% - 48px);
  gap: 0;
}
</style>
