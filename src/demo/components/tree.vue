<template>
  <el-tree style="max-width: 600px" :data="props.data" v-bind="$attrs" @node-click="handleClick">
    <template #default="{ node, data }">
      <div class="tree-node" @mouseenter="handleMouseEnter(data)">
        <span>{{ data.label }}</span>
        <span class="desc" v-if="data.desc">{{ data.desc }}</span>
      </div>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{ data: any[] }>(), {
  data: () => [],
});
const emit = defineEmits(['mouseenter', 'node-click']);
const handleMouseEnter = (data: any) => {
  emit('mouseenter', data);
};

const handleClick = (data: any) => {
  console.log(data);
  emit('node-click', data);
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
