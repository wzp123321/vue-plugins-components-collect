<template>
  <!-- 分页组件 -->
  <div class="optionDiv" v-if="row.parentIndex">
    <!-- 需要按钮权限控制的按钮，需要有permissionId -->
    <template v-for="(item, index) in rowButton?.slice(0, 4)" :key="item">
      <te-popover
        :ref="setPopoverRef(index)"
        trigger="click"
        placement="top"
        :width="182"
        v-if="item.showBtnPop"
      >
        <div class="con">
          <div class="tip">
            <img src="../assets/img/warning.svg" alt="注意" srcset="" />
            <p>{{ item?.pop?.tip || '确认点击吗?' }}</p>
          </div>
          <div class="btns">
            <te-button size="small" @click="closePop(index)">{{
              item?.pop?.cancel
            }}</el-button>
            <te-button
              size="small"
              type="primary"
              @click="operate(row, item.value)"
              >{{ item?.pop?.confirm }}</te-button
            >
          </div>
        </div>
        <template #reference>
          <te-button
            link
            :style="{
              color: item.buttonColor || 'var(--te-color-primary)',
            }"
          >
            {{ item.buttonName }}</te-button
          >
        </template>
      </el-popover>
      <template v-if="!item.showBtnPop">
        <te-button
          link
          :style="{
            color: item.buttonColor || 'var(--te-color-primary)',
          }"
          @click="operate(row, item.value)"
        >
          {{ item.buttonName }}
        </el-button>
      </template>
    </template>

    <te-popover placement="bottom-end" trigger="hover" width="50">
      <template #reference>
        <te-button
          style="width: 20px"
          v-if="rowButton?.length > 4"
          type="primary"
          link
        >
          <img src="../assets/img/more-btn.svg" alt="more" />
        </el-button>
      </template>
      <div class="popBtn">
        <te-button
          v-for="(item, index) in tableButton?.slice(4, tableButton?.length)"
          :key="index"
          link
          :style="{
            color: item.buttonColor || 'var(--te-color-primary)',
          }"
          @click="operate(row, item.value)"
        >
          {{ item.buttonName }}&nbsp;&nbsp;
        </el-button>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts" name="TableButtonGroup">
import { ref, watch } from 'vue';

interface ButtonType {
  buttonColor: string;
  buttonType: 'Primary' | 'Success' | 'Info' | 'Warning' | 'Danger';
  code: string;
  value: string;
  buttonName: string;
}

interface Props {
  row: any;
  tableButton: ButtonType[];
}

const emits = defineEmits(['operate']);

// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<Props>(), {
  row: {},
});

const rowButton = ref<any[]>([]);
const popoverRefs = ref([]);

watch(
  () => props.tableButton,
  (val) => {
    rowButton.value = JSON.parse(JSON.stringify(val));
  },
  { deep: true, immediate: true },
);

// 设置 popover 的 ref
const setPopoverRef = (index: number) => {
  return (el) => {
    if (el) {
      popoverRefs.value[index] = el;
    }
  };
};

// 操作
const operate = (row: any, value: any) => {
  emits('operate', { row, value });
};

// 关闭弹窗
const closePop = (index: number) => {
  if (popoverRefs.value[index]) {
    popoverRefs.value[index].hide();
  }
};
</script>

<style lang="less" scoped>
.optionDiv {
  display: inline-block;
  white-space: nowrap;
  box-sizing: border-box;
}

.tip {
  display: flex;

  img {
    margin-right: 6px;
  }

  p {
    color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
    font-family: var(--fontfamily, 'PingFang SC');
    font-weight: 400;
    font-size: 14px;
  }
}

.btns {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.te-pager li) {
  border-radius: 4px !important;
  background: rgba(245, 247, 250, 1);
}

:deep(.btn-pre, .btn-next) {
  border-radius: 4px !important;
  background: rgba(245, 247, 250, 1) !important;
}

.popBtn {
  .te-button + .te-button {
    margin: 0 !important;
  }
}
</style>
