<template>
  <el-tree style="max-width: 600px" :data="props.data" v-bind="$attrs">
    <template #default="{ data }">
      <div class="tree-node" @mouseenter="handleMouseEnter(data)">
        <span>{{ data.label }}</span>
        <span class="desc" v-if="data.desc">{{ data.desc }}</span>
      </div>
    </template>
  </el-tree>
</template>

<script lang="ts"></script>
<script lang="ts" setup>
interface Tree {
  label: string;
  id: string;
  children?: Tree[];
}
const props = withDefaults(defineProps<{ data: Tree[] }>(), {
  data: () => [],
});
const emit = defineEmits(['mouseenter']);
const handleMouseEnter = (data: Tree) => {
  emit('mouseenter', data);
};
</script>

<style lang="less" scoped>
.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .desc {
    font-size: 12px;
    color: #999;
    margin-right: 20px;
  }
}
</style>
