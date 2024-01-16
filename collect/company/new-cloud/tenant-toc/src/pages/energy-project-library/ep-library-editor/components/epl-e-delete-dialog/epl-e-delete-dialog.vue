<template>
  <div id="epl-e-delete-dialog">
    <div style="margin-bottom: 8px">
      <el-icon style="vertical-align: text-top; margin-right: 8px" color="#FAAD14"><WarningFilled /></el-icon>
      <span>确定要删除项目？</span>
    </div>
    <div style="margin-left: 22px; margin-bottom: 20px">
      <p>删除项目将一并删除所有历史版本，删除后无法找回。</p>
    </div>
    <el-divider></el-divider>
    <el-row type="flex" justify="end">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onDelSubmit">确定</el-button>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { WarningFilled } from '@element-plus/icons-vue';

const emit = defineEmits(['close', 'delSubmit']);

const onCancel = () => {
  emit('close');
};

const onDelSubmit = () => {
  emit('delSubmit');
  emit('close');
};
</script>
<style lang="less" scoped></style>
