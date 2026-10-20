<template>
  <component ref="printComponent" :is="componentName" :model-setting="modelSetting"></component>
</template>
<script setup lang="ts">
import { reactive, shallowRef, watch, onMounted, ref } from 'vue';
import { TpqPrintLbp, TpqPrintBrother, TpqPrintPostek } from './components';
import PrintTemplateV2ApiApi from './apis/PrintTemplateV2ApiApi';
import QrCodeTemplateVO from './models/QrCodeTemplateVO';
import { ModelStyleTypeEnum } from './models/ModelStyleTypeEnum';
import { type AxiosInstance } from 'axios';

//要打印的模版组件名称
const componentName = shallowRef();
//打印模版的默认配置项
const modelSetting = reactive<QrCodeTemplateVO>(new QrCodeTemplateVO());

const props = withDefaults(
  defineProps<{
    modelCode: string; //模版编号
    axios: AxiosInstance; //axios实例
    tenantId: string; //租户id
  }>(),
  {}
);

watch(
  () => props.modelCode,
  (val) => {
    if (val) {
      getModelSetting();
    }
  }
);

onMounted(() => {
  getModelSetting();
});

/**
 * 获取模版配置
 */
const getModelSetting = async () => {
  if (!props.modelCode) {
    return;
  }
  let data = {
    templateKey: props.modelCode,
  };
  let res = await PrintTemplateV2ApiApi.getQrCodeTemplateDetailByKey(props.axios, props.tenantId, data);
  let result = res as unknown as QrCodeTemplateVO;
  if (res.errcode) {
    result = res.data;
    if (res.errcode !== '0') {
      return;
    }
  }
  Object.assign(modelSetting, result);
  if (result.templateStyle === ModelStyleTypeEnum.LBP) {
    componentName.value = TpqPrintLbp;
  } else if (result.templateStyle === ModelStyleTypeEnum.POSTEK) {
    componentName.value = TpqPrintPostek;
  } else if (result.templateStyle === ModelStyleTypeEnum.BROTHER) {
    componentName.value = TpqPrintBrother;
  }
};

const printComponent = ref();
const handlePrint = () => {
  if (printComponent.value) {
    printComponent.value.print();
  }
};

defineExpose({
  print: handlePrint,
});
</script>
<style scoped></style>
