<template>
  <div class="tpq-print-lbp">
    <div id="printContent" class="tpl-wrap tpl-wrap-contain">
      <div v-for="item in printList" class="tpl-wrap-item" style="page-break-after: always">
        <tpq-preview-lbp :print-item="item"></tpq-preview-lbp>
      </div>
    </div>

    <div ref="printDivBtn" v-print="printConfig" class="tpl-print-btn">打印</div>
  </div>
</template>
<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import TpqPreviewLbp from './tpq-preview-lbp.vue';
import { cloneDeep } from 'lodash';
import print from 'vue3-print-nb';
import QrCodeTemplateVO from '../../models/QrCodeTemplateVO';

interface PropsConfigLbp {
  fieldValue1: string; //字段1
  fieldValue2: string; //字段2
  fieldValue3: string; //字段3
}

const props = withDefaults(
  defineProps<{
    list: [];
    propsConfig: PropsConfigLbp;
    modelSetting: QrCodeTemplateVO;
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
  code: string;
  qrCode: string;
}

const printList = ref<PrintItem[]>([]);

/**
 * 将数据转为打印列表列表标准格式
 */
const setPrintList = () => {
  let arr = props.list.map((item) => {
    return {
      name: props.propsConfig.fieldValue1 ? item[props.propsConfig.fieldValue1] : props.modelSetting?.title || '',
      code: props.propsConfig.fieldValue2 ? item[props.propsConfig.fieldValue2] : '',
      qrCode: props.propsConfig.fieldValue3 ? item[props.propsConfig.fieldValue3] : '',
    };
  });
  printList.value = cloneDeep(arr);
};

//####调用打印机###
const vPrint = print;
const printConfig = ref({
  id: 'printContent',
  // preview: true, // 预览工具是否启用
  // previewTitle: '', // 预览页面的标题
  popTitle: '', // 打印页面的页眉
});
const printDivBtn = ref();
const startPrint = () => {
  printDivBtn.value.dispatchEvent(new MouseEvent('click'));
};

defineExpose({
  print: startPrint,
});
</script>
<style scoped lang="less">
// 子元素和父元素要用同一层，不能包含在里面，否则打印样式不生效

// 打印媒体查询
@media print {
  //去掉打印纸边距，页眉页脚
  @page {
    size: auto;
    margin: 0mm;
  }
  body {
    height: auto; //在实际页面中高度不够部分内容隐藏了
  }
  html {
    height: auto; //在实际页面中高度不够部分内容隐藏了
  }
  #printContent {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
.tpq-print-lbp {
  display: flex;
  flex-direction: column;
  align-items: center;
  .tpl-print-btn {
    visibility: hidden;
  }
  .tpl-wrap {
    width: 5.5cm;
    .tpl-wrap-item {
      background: rgba(240, 240, 240, 1);
      margin-top: 20px;
      height: 8cm;
    }
  }
}
</style>
