<template>
  <te-form :label-position="labelPosition">
    <te-form-item :label="labelName">
      <te-tag
        v-for="(tag, index) in dynamicTags"
        :key="tag"
        class="mr-1"
        v-bind="$attrs"
        :disable-transitions="false"
        @close="handleClose(tag)"
        effect="plain"
        :style="{ 'margin-left': index == 0 ? '0px' : '0.25rem' }"
        >{{ tag }}</te-tag
      >
      <te-input
        v-if="inputVisible"
        ref="InputRef"
        v-model="inputValue"
        class="ml-1 w-20"
        size="small"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      <te-button
        v-else
        class="button-new-tag ml-1"
        size="small"
        @click="showInput"
      >
        + 添加标签
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import {
  TeForm,
  TeFormItem,
  ElInput,
  ElButton,
  ElTag,
} from "element-plus";
// import { EpPropMergeType } from "element-plus/es/utils";
import { ref, nextTick } from "vue";
// import '../../../../../node_modules/@zpackage/web-package/dist/styles/index.css'

const props = withDefaults(
  defineProps<{
    labelPosition?: any; // 参数可选
    labelName: string;
    dynamicTags?: Array<string>;
  }>(),
  {
    // 设置默认值
    labelPosition: "left",
    dynamicTags: () => [],
  }
);

const inputVisible = ref(false);
const inputValue = ref("");
const InputRef = ref<InstanceType<typeof ElInput>>();

/**
 * emit事件
 * onDelete：删除回调事件
 * onAdd：添加标签回调事件
 */
const emits = defineEmits(["onDelete", "onAdd"]);

/**
 * 删除标签回调
 * @param tag 标签名
 */
const handleClose = (tag: string) => {
  props.dynamicTags?.splice(props.dynamicTags?.indexOf(tag), 1);
  emits("onDelete", tag, props.dynamicTags);
};

/**
 * 标签输入完成事件
 */
const handleInputConfirm = () => {
  if (inputValue.value) {
    props.dynamicTags?.push(inputValue.value);
    emits("onAdd", inputValue.value, props.dynamicTags);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

/**
 * 展示input输入框事件
 */
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<style scoped lang="scss">
// 标签高度
$tagHeight: 30px;

.mr-1 {
  margin-right: 0.25rem;
}
.ml-1 {
  margin-left: 0.25rem;
}

.w-20 {
  width: 102px;
  height: $tagHeight;
}

:deep(.te-tag) {
  height: $tagHeight;
}

.button-new-tag {
  height: $tagHeight;
  font-size: 14px;
  font-weight: 400;
  width: 102px;
}
</style>
