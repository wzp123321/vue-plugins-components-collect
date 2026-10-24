import type { FormInstance, TableInstance } from 'element-plus';
import { cloneDeep, isFunction, reduce, some } from 'lodash';
import { computed, onMounted, reactive, ref, toRaw, watch } from 'vue';
import { DynamicTableProps } from '../type';
import { useMutationObserver } from '@vueuse/core';
import { ValidateFieldsError } from 'async-validator';
interface UseDynamicTableProps {
  props: DynamicTableProps;
  emits: any;
}
// 记录初始值
let initialValue = [];

export const useDynamicTable = ({ props, emits }: UseDynamicTableProps) => {
  // 列表刷新的key，用来清除表单校验状态
  const refreshKey = ref<number>(1);

  // 内部响应式表单
  const formData = reactive({
    tableData: props.modelValue,
  });

  // 表单ref
  const editFormRef = ref<FormInstance>();

  // 表格ref
  const tableRef = ref<TableInstance>();

  // 表格动态高度
  const tableHeight = ref<number>();

  // 检查当前列是否有必填校验
  const isColumnRequired = (columnRules?: Array<{ required?: boolean }>) =>
    some(columnRules, (rule) => rule?.required);

  // 计算表格高度
  const calculateTableHeight = () => {
    try {
      // 当数据超过10条时，需要计算前十条数据的高度+表头+12px作为表格的高度
      const rows: any[] = Array.from(
        tableRef?.value?.$el.querySelectorAll(`.te-table__row`),
      ).slice(0, 10);

      // 计算列表高度
      const rowsHeight = reduce(
        rows,
        (prev, curr: any) => prev + curr.getBoundingClientRect().height,
        0,
      );

      // 取表头高度
      const headerHeight = tableRef?.value?.$el
        .querySelector('.te-table__header')
        .getBoundingClientRect().height;

      tableHeight.value = Math.floor(rowsHeight + headerHeight + 12);
    } catch (err) {
      console.error(err);
    }
  };

  // 添加一行
  const handleAdd = () => {
    // // 父组件传入了新增方法则执行父组件传入的方法
    if (props.handleAdd && isFunction(props.handleAdd)) {
      props.handleAdd();
      return;
    }

    formData.tableData.push({});
    emits('addRow', formData.tableData.length);
    // 滚动到最后一行
    setTimeout(() => {
      tableRef?.value.setScrollTop(tableHeight.value);
    }, 0);
  };

  // 删除当前行
  const handleDelete = (scope: any) => {
    try {
      // 当限制表格必填且只剩一行时不允许删除
      if (formData.tableData.length === 1 && props.required) {
        return;
      }
      // 父组件传入了新增方法则执行父组件传入的方法
      if (props.handleDelete && isFunction(props.handleDelete)) {
        props.handleDelete(scope);
        return;
      }
      const { $index: index } = scope;

      const originData = cloneDeep(formData.tableData[index]);
      formData.tableData.splice(index, 1);
      refreshKey.value++;
      emits('deleteRow', { $index: index, ...originData });
    } catch (err) {
      console.error(err);
    }
  };

  // 校验表格数据，可传入callback
  const validateData = (
    validateCallback: (
      valid: boolean,
      fields: ValidateFieldsError,
      tableData: Array<any>,
    ) => void,
  ) => {
    editFormRef.value.validate((valid, fields) => {
      validateCallback?.(valid, fields, toRaw(formData.tableData));
    });
  };

  // 重置动态表格为初始状态
  const resetTable = () => {
    editFormRef.value.resetFields();
    if (initialValue.length) {
      formData.tableData = cloneDeep(initialValue);
    } else {
      formData.tableData = props.required ? [{}] : [];
    }
    emits('update:modelValue', formData.tableData);
  };

  // 没有数据时表格高度只保留表头高度
  const dynamicStyle = computed(() =>
    formData.tableData.length === 0
      ? {
          height: '48px',
        }
      : {},
  );

  onMounted(() => {
    // 记录初始值
    const { modelValue } = props;
    initialValue = cloneDeep(modelValue);

    // 用mutationObserver监听子节点变更
    useMutationObserver(
      tableRef,
      (mutations) => {
        if (mutations[0]) {
          calculateTableHeight();
        }
      },
      {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['width', 'height'],
      },
    );

    // 如果表格是必填项，但传入的tableData又没有数据的话，默认填充一条空数据进去。
    if (props.required && !formData.tableData.length) {
      editFormRef.value?.resetFields();
      formData.tableData = [{}];
    }
  });

  return {
    formData,
    tableRef,
    editFormRef,
    tableHeight,
    dynamicStyle,
    refreshKey,
    handleAdd,
    handleDelete,
    resetTable,
    validateData,
    isColumnRequired,
  };
};
