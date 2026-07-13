<template>
  <div class="te-print-qr-demo">
    <header class="tpq-demo-header">
      <h3>te-print-qr — 多打印机分发器</h3>
      <p>根据 templateStyle 动态加载 lbp / brother / postek 组件，模拟不同打印 SDK</p>
    </header>
    <div class="tpq-demo-stage">
      <el-space wrap>
        <el-button type="primary" @click="open('lbp')">lbp（浏览器打印）</el-button>
        <el-button @click="open('brother')">brother（兄弟打印机）</el-button>
        <el-button @click="open('postek')">postek（RFID 打印机）</el-button>
      </el-space>

      <el-card>
        <template #header><span>当前模式控制（v-model:templateStyle）</span></template>
        <el-radio-group v-model="style">
          <el-radio-button label="lbp" />
          <el-radio-button label="brother" />
          <el-radio-button label="postek" />
        </el-radio-group>
        <p class="tpq-tip">在弹层里切换 radio 时, 上方分发器会动态替换组件</p>
        <p>当前: <el-tag>{{ style }}</el-tag></p>
      </el-card>

      <te-print-qr
        v-model="visible"
        v-model:templateStyle="style"
        :content="content"
        :device="device"
      />

      <el-card>
        <template #header><span>打印参数</span></template>
        <el-form label-width="100px" size="small">
          <el-form-item label="打印内容">
            <el-input v-model="content" />
          </el-form-item>
          <el-form-item label="设备名">
            <el-input v-model="device" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElButton, ElSpace, ElCard, ElRadioGroup, ElRadioButton, ElTag, ElForm, ElFormItem, ElInput } from 'element-plus';
import { TePrintQr, type PrintStyle } from '../../../components/te-print-qr';

const visible = ref(false);
const style = ref<PrintStyle>('lbp');
const content = ref('TS-2026-A-001');
const device = ref('Brother QL-820NWB');

const open = (s: PrintStyle) => {
  style.value = s;
  visible.value = true;
};

defineOptions({ name: 'TePrintQrDemo' });
</script>

<style lang="less" scoped>
.te-print-qr-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tpq-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;
    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tpq-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tpq-tip { color: #909399; font-size: 12px; margin: 8px 0 0; }
}
</style>
