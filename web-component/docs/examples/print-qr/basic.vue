<template>
  <div>
    <te-button @click="handleShowDialog">打印二维码</te-button>
    <te-dialog v-model="dialogVisible">
      <te-print-qr
        ref="qrPrintRef"
        :list="list"
        :props-config="propsConfig"
        :model-code="modelCode"
        axios=""
        tenant-id="700"
      >
      </te-print-qr>
      <template #footer>
        <div class="dialog-footer">
          <te-button @click="handleShowDialog">Cancel</te-button>
          <te-button type="primary" @click="handlePrint"> 打印 </te-button>
        </div>
      </template>
    </te-dialog>
  </div>
</template>

<script lang="ts" setup>
import { TePrintQr } from '@ts-web-package/components/lib/te-print-qr';
import { TeDialog, TeButton } from '@tiansu/element-plus';
import { ref, reactive, onMounted } from 'vue';

const dialogVisible = ref(false);
const handleShowDialog = () => {
  dialogVisible.value = !dialogVisible.value;
};
const qrPrintRef = ref();

const handlePrint = () => {
  qrPrintRef.value.print();
  handleShowDialog();
};

//需要打印的列表数据
const list = ref([]);

//标注字段值是哪一个字段
const propsConfig = {
  fieldValue1: 'code',
  fieldValue2: 'name',
  fieldValue3: 'qrCode',
};

//打印模版编码
const modelCode = ref('');

onMounted(() => {
  modelCode.value = 'BFV4TGS14CNR_HLMSLOCATIONQR_BASIC';
  list.value = [
    {
      code: '字段name最多三行，超过则省略号代替，中英文强制截断换行,试试换行的效果黄河户外额问问',
      name: '中英文强制截断换行wererwwwwwwwwwwwwr5erwwww,字段code最多三行，超过则省略号代替，',
      qrCode: 'https://pic.baike.soso.com/p/20130307/20130307133541-2131676630.jpg',
      dept: '字段4',
      campusName: '字段5',
    },
    // {
    //   code: '字段name2',
    //   name: '字段code2',
    //   qrCode: 'https://pic.baike.soso.com/p/20130307/20130307133541-2131676630.jpg',
    //   dept: '字段4',
    //   campusName: '字段5',
    // },
    // {
    //   code: '字段name2',
    //   name: '字段code2',
    //   qrCode: 'https://pic.baike.soso.com/p/20130307/20130307133541-2131676630.jpg',
    //   dept: '字段4',
    //   campusName: '字段5',
    // },
    // {
    //   code: '字段1',
    //   name: '字段2',
    //   qrCode: '字段3',
    //   dept: '字段4',
    //   campusName: '字段5',
    // },
    // {
    //   code: '字段1',
    //   name: '字段2',
    //   qrCode: '字段3',
    //   dept: '字段4',
    //   campusName: '字段5',
    // },
  ];
});
</script>
<script lang="ts">
export default {
  name: 'te-print-qr-basic',
};
</script>
<style scoped lang="scss"></style>
