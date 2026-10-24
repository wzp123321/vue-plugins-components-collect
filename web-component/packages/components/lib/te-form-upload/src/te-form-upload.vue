<template>
  <te-form :label-position="labelPosition">
    <te-form-item :label="labelName">
      <te-upload
        multiple
        v-bind="$attrs"
        style="line-height: 24px; width: 360px"
      >
        <te-button type="primary">{{ uploadBtnTitle }}</el-button>
      </el-upload>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { TeForm, TeFormItem, TeUpload, ElButton } from "element-plus";
// import { EpPropMergeType } from "element-plus/es/utils";
// import '../../../../../node_modules/@zpackage/web-package/dist/styles/index.css'

withDefaults(
  defineProps<{
    labelPosition?: any; // 参数可选
    labelName: string;
    uploadBtnTitle?: string;
  }>(),
  {
    // 设置默认值
    labelPosition: "left",
    uploadBtnTitle: "Click to upload",
  }
);
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<style scoped lang="scss">
:deep(.te-upload-list__item) {
  margin-bottom: 0px;
}

:deep(.te-upload-list) {
  margin-top: 8px;
}
</style>
