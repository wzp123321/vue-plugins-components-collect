<template>
  <div>
    <div v-for="item in props.list"></div>
  </div>
</template>
<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import { print_usb } from './plugins/postek-rfid';
import { cloneDeep } from 'lodash';

interface PropsConfigLbp {
  fieldValue1: string;
  fieldValue2: string;
  fieldValue3: string;
  fieldValue4: string;
  fieldValue5: string;
  fieldValue6: string;
}

const props = withDefaults(
  defineProps<{
    list: [];
    propsConfig: PropsConfigLbp;
  }>(),
  {
    list: () => [],
  }
);

watch(
  () => props.list,
  (val) => {
    if (val) {
      setPrintList();
    }
  },
  { deep: true }
);

onMounted(() => {
  setPrintList();
});

interface PrintItem {
  name: string;
  deptName: string;
  warehouseName: string;
  activeDate: string;
  thirdCode: string;
  qrcodeContent: string;
}
const printList = ref<PrintItem[]>([]);
/**
 * 将数据转为打印列表列表标准格式
 */
const setPrintList = () => {
  let arr = props.list.map((item) => {
    return {
      name: props.propsConfig.fieldValue1 ? item[props.propsConfig.fieldValue1] : '',
      deptName: props.propsConfig.fieldValue2 ? item[props.propsConfig.fieldValue2] : '',
      warehouseName: props.propsConfig.fieldValue3 ? item[props.propsConfig.fieldValue3] : '',
      activeDate: props.propsConfig.fieldValue4 ? item[props.propsConfig.fieldValue4] : '',
      thirdCode: props.propsConfig.fieldValue5 ? item[props.propsConfig.fieldValue5] : '',
      qrcodeContent: props.propsConfig.fieldValue6 ? item[props.propsConfig.fieldValue6] : '',
    };
  });
  printList.value = cloneDeep(arr);
};

const handlePrint = async () => {
  if (printList.value.length > 0) {
    await print_usb(printList.value);
  }
};

defineExpose({
  print: handlePrint,
});
</script>
<style scoped>
/* @import '@zpackage/web-package/dist/styles/index.css'; */
</style>
