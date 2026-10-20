<template>
  <section class="edit-table">
    <te-dynamic-table
      v-model="tableData"
      :columns="columns"
      ref="dynamicTableRef"
      :required="true"
      :maxCount="15"
      @addRow="addRow"
      @deleteRow="deleteRow"
    >
      <template #notify="scope">
        <te-radio-group v-model="scope.row.notify">
          <te-radio label="1">是</te-radio>
          <te-radio label="2">否</te-radio>
        </te-radio-group>
      </template>
    </te-dynamic-table>
    <section class="submit-button">
      <te-button type="primary" @click="handleSubmit">提交</te-button>
      <te-button type="danger" @click="reset">重置</te-button>  
    </section>
  </section>
</template>
<script setup lang="ts">
import { TeRadioGroup, TeRadio, TeTag, TeButton } from "@tiansu/element-plus";
import {
  TeDynamicTable,
  Columns,
} from "@ts-web-package/components/lib/te-dynamic-table";
// import "@/components/styles/index.scss";

import { ref, reactive, Ref, watch } from "vue";

const dynamicTableRef = ref<InstanceType<typeof TeDynamicTable>>();

// 编辑表格内容采用了Form + Table的封装模式，表格的数据使用tableData表示
const tableData = ref([
  { content: "测试填写默认内容", remark: "测试填写备注" },
]);

// 定义列的渲染方式
const columns: Ref<Columns[]> = ref([
  {
    prop: "content",
    label: "内容",
    type: "input",
    elementAttrs: {
      placeholder: "请输入",
    },
    columnAttrs: {
      minWidth: "200",
    },
    rules: [
      {
        required: true,
        message: "内容不能为空",
        trigger: "blur",
      },
    ],
  },
  {
    prop: "remark",
    label: "备注",
    type: "input",
    columnAttrs: {
      minWidth: "200",
    },
    elementAttrs: {
      placeholder: "请输入",
    },
    rules: [
      {
        required: true,
        message: "备注不能为空",
        trigger: "blur",
      },
    ],
  },
  {
    prop: "cost",
    label: "金额",
    type: "inputNumber",
    elementAttrs: {
      placeholder: "请输入",
      precision: 2,
      min: 0,
    },
    columnAttrs: {
      minWidth: "200",
    },
    rules: [
      {
        required: true,
        message: "金额不能为空",
        trigger: "blur",
      },
    ],
  },
  {
    prop: "date",
    label: "日期",
    type: "datePicker",
    columnAttrs: {
      minWidth: "200",
    },
    elementAttrs: {
      type: "date",
      placeholder: "请选择日期",
      format: "YYYY/MM/DD",
      valueFormat: "YYYY-MM-DD",
    },
    rules: [
      {
        required: true,
        message: "日期不能为空",
        trigger: "blur",
      },
    ],
  },
  {
    prop: "operator",
    label: "操作人",
    type: "select",
    columnAttrs: {
      minWidth: "200",
    },
    elementAttrs: {
      placeholder: "请选择",
    },
    dataSource: [
      {
        label: "张三",
        value: "zhangsan",
      },
      {
        label: "李四",
        value: "lisi",
      },
      {
        label: "王五",
        value: "wangwu",
      },
    ],
    rules: [
      {
        required: true,
        message: "操作人不能为空",
        trigger: "change",
      },
    ],
  },
  {
    prop: "notify",
    label: "是否通知",
    // 传入slot进行渲染，需手动控制数据的同步
    type: "slot",
    columnAttrs: {
      minWidth: "200",
    },
    rules: [
      {
        required: true,
        message: "是否通知不能为空",
        trigger: "change",
      },
    ],
  },
]);

// 提交
const handleSubmit = () => {
  // 提交表格前先进行校验
  dynamicTableRef.value.validateData((valid, fields, data) => {
    if (valid) {
      console.log("校验通过，可执行提交", data);
    } else {
      console.log("校验失败，失败项为", fields);
    }
  });
};

// 重置表格为初始状态
const reset = () => {
  dynamicTableRef.value.resetTable();
};

// 添加一行的事件
const addRow = (tableLength: number) => {
  console.log("添加了一行数据，当前表格长度为tableLength", tableLength);
};

// 删除一行的事件
const deleteRow = (data) => {
  const { $index } = data;
  console.log(`删除了第${$index}行`, data);
};
</script>

<style lang="scss" scoped>
.edit-table {
  box-sizing: border-box;
  width: 100%;
  padding: 20px;
  .submit-button {
    width: 100%;
    text-align: center;
    margin-top: var(--te-space-20);
  }
}
</style>
