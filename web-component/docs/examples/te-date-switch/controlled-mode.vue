<script setup lang="ts">
import {
  ElConfigProvider,
  ElMessageBox,
  ElDialog,
  ElButton,
  dayjs,
} from "element-plus";
import { TeDateSwitch } from "@ts-web-package/components/lib/te-date-switch";
// import "@/components/styles/index.scss";
import { ref } from "vue";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

// 日期v-model
const dateValue = ref<string>(dayjs().format("YYYY-MM").toString());

// 弹窗展示
const dialogVisible = ref<boolean>(false);

// 接收change事件
const handleMyChange = (date: string) => {
  console.log("change事件参数", date);
  dateValue.value = date;
};

// 自定义前进事件
const forward = (date: string) => {
  console.log("🚀 ~ forward ~ date:", date);
  // 如果当前选中的日期已经在本月之后了，则弹出确认框确认
  if (dayjs(date).isAfter(dayjs("2023-01"))) {
    console.log("已经在2023-01之后了");
    dialogVisible.value = true;
  } else {
    // 否则自行处理向前的事件
    dateValue.value = dayjs(date).add(1, "month").format("YYYY-MM").toString();
  }
};

// 自定义后退事件
const backward = (date: string) => {
  // 如果当前选中的日期已经在本月之后了，则弹出确认框确认
  if (dayjs(date).isAfter("2023-01")) {
    dialogVisible.value = true;
  } else {
    // 否则自行处理向后的事件
    dateValue.value = dayjs(date)
      .subtract(1, "month")
      .format("YYYY-MM")
      .toString();
  }
};

// 关闭弹窗
const handleClose = (done: () => void) => {
  ElMessageBox.confirm("Are you sure to close this dialog?")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};
</script>
<template>
  <section class="te-datepicker-pro">
    <te-config-provider :locale="zhCn">
      <te-date-switch
        v-model="dateValue"
        type="month"
        format="YYYY-MM"
        valueFormat="YYYY-MM"
        :handleForward="forward"
        :handleBackward="backward"
        :handleDateChange="handleMyChange"
        :forwardLimit="false"
      >
      </te-date-switch>
    </el-config-provider>
    <te-dialog
      v-model="dialogVisible"
      title="Tips"
      width="30%"
      :before-close="handleClose"
    >
      <span>This is a message</span>
      <template #footer>
        <span class="dialog-footer">
          <te-button @click="dialogVisible = false">Cancel</el-button>
          <te-button type="primary" @click="dialogVisible = false">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </section>
</template>
<style lang="scss" scoped>
.te-datepicker-pro {
  width: 100%;
}
</style>
