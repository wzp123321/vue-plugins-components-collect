<template>
  <div>
    <te-button @click="handleShowDialog">打印二维码</el-button>
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
          <te-button @click="handleShowDialog">Cancel</el-button>
          <te-button type="primary" @click="handlePrint"> 打印 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { TePrintQr } from '@ts-web-package/components/lib/te-print-qr';
import { ElDialog, ElButton } from 'element-plus';
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
  fieldValue1: 'qrCode',
  fieldValue2: 'name',
  fieldValue3: 'code',
  fieldValue4: 'code',
  fieldValue5: 'code',
  fieldValue6: 'code',
  deviceModelUrl: 'http://xxxxx.com/asset/plugins/device.lbx',
};

//打印模版编码
const modelCode = ref('');

onMounted(() => {
  modelCode.value = 'BROTHERPTP900_MEMSDEVICEQR_BASIC';
  list.value = [
    {
      code: '字段name',
      name: '字段code',
      qrCode: 'https://pic.baike.soso.com/p/20130307/20130307133541-2131676630.jpg',
      dept: '字段4',
      campusName: '字段5',
    },
    {
      code: '字段name2',
      name: '字段code2',
      qrCode: 'https://pic.baike.soso.com/p/20130307/20130307133541-2131676630.jpg',
      dept: '字段4',
      campusName: '字段5',
    },
    {
      code: '字段name2',
      name: '字段code2',
      qrCode: 'https://pic.baike.soso.com/p/20130307/20130307133541-2131676630.jpg',
      dept: '字段4',
      campusName: '字段5',
    },
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

//#############业务测使用post请求文件流方法示例
</script>
<script lang="ts">
export default {
  name: 'te-print-qr-brother',
};
</script>
<style scoped lang="scss"></style>
