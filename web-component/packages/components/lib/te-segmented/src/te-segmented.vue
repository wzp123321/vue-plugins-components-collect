<template>
  <div
    class="te-segmented"
    :style="{
      '--fontSize': props.size === 'small' ? '12px' : '14px',
      '--height': getButtonHeight(),
      '--paddingLR': getButtonPaddingLR(),
      '--fontColor': props.theme === 'dark' ? '#e5eaf3' : '#303133',
      '--backColor': props.theme === 'dark' ? '#303030' : '#f0f2f5',
      '--frontColor': props.theme === 'dark' ? '#1d1e1f' : '#fff',
      '--shadowColor': props.theme === 'dark' ? 'transparent' : '#00000024',
    }"
  >
    <te-radio-group v-model="dimension" size="small" v-bind="$attrs">
      <te-radio-button :key="item.value" v-for="item in props.dimensionOptions" :label="item.value">
        <te-icon v-if="props.showIcon"><Grid /></te-icon>
        {{ item.text }}</te-radio-button
      >
    </te-radio-group>
  </div>
</template>
<script lang="ts" setup>
import { TeRadioGroup, TeRadioButton, TeIcon } from "@tiansu/element-plus";
import { ref, watch } from "vue";
import { Grid } from "@element-plus/icons-vue";

interface TeSegmentProps {
  modelValue: number | string;
  theme: "light" | "dark";
  size: "medium" | "large" | "small";
  showIcon: boolean;
  dimensionOptions: DimensionType[];
}

interface DimensionType {
  value?: string | number;
  text?: string;
}

const props = withDefaults(defineProps<TeSegmentProps>(), {
  modelValue: "",
  theme: "light",
  size: "medium",
  showIcon: false,
  dimensionOptions: () => [],
});
const dimension = ref<string | number>(props.modelValue);
const emit = defineEmits(["update:modelValue"]);

watch(
  () => props.modelValue,
  () => {
    dimension.value = props.modelValue;
  },
  {
    immediate: true,
  }
);

watch(
  () => dimension.value,
  (val) => {
    emit("update:modelValue", dimension.value);
  }
);

/**
 * 设置组件高度
 */
const getButtonHeight = () => {
  if (props.size === "large") {
    return "36px";
  } else if (props.size === "small") {
    return "20px";
  } else {
    return "28px";
  }
};

/**
 * 设置组件padding
 */
const getButtonPaddingLR = () => {
  if (props.size === "small") {
    return "7px";
  } else {
    return "11px";
  }
};
</script>

<style scoped lang="less">
.te-segmented {
  text-align: right;
  :deep(.te-radio-group) {
    width: fit-content;
    height: calc(var(--height) + 4px);
    padding: 0 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--backColor) !important;
    border-radius: 4px;
    .te-radio-button {
      height: var(--height);
      .te-radio-button__inner {
        display: flex;
        align-items: center;
        height: var(--height);
        line-height: var(--height);
        padding: 0 var(--paddingLR);
        background: var(--backColor);
        font-size: var(--fontSize);
        color: var(--fontColor);
        border: none;
        border-radius: 4px !important;
        box-shadow: none;
        .te-icon {
          margin-right: 4px;
        }
      }
    }
    .te-radio-button.is-active {
      .te-radio-button__inner {
        background-color: var(--frontColor);
        color: var(--fontColor);
        border: none;
        border-radius: 4px !important;
        box-shadow: 0px 2px 6px var(--shadowColor) !important;
      }
    }
  }
}
</style>
