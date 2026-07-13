<template>
  <div class="te-qrcode-view-demo">
    <header class="tqv-demo-header">
      <h3>te-qrcode-view — 资产码/条形码预览</h3>
      <p>鼠标悬停图标即可弹出图形码面板，支持二维码、条形码轮播。</p>
    </header>
    <div class="tqv-demo-stage">
      <el-card class="tqv-card">
        <template #header>
          <span>资产 A-001 编码方案</span>
        </template>
        <div class="tqv-row">
          <te-qrcode-view :data="data" />
          <span class="tqv-tip">悬停查看</span>
        </div>
      </el-card>

      <el-card class="tqv-card">
        <template #header>
          <span>不同方案对比</span>
        </template>
        <div class="tqv-grid">
          <div v-for="d in variants" :key="d.code" class="tqv-cell">
            <div class="tqv-cell-name">{{ d.schemeName }}</div>
            <te-qrcode-view :data="[d]" />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElCard } from 'element-plus';
import { TeQrcodeView, type QrcodeScheme } from '../../../components/te-qrcode-view';

const data: QrcodeScheme[] = [
  { code: '1', schemeName: '主二维码', scanType: 'QRCODE', scanContent: 'https://example.com/asset/A-001' },
  { code: '2', schemeName: '备用条形码', scanType: 'BARCODE', scanContent: 'TS-2026-A-001' },
  { code: '3', schemeName: '巡检二维码', scanType: 'QRCODE', scanContent: 'INSP-2026-A-001' },
];

const variants: QrcodeScheme[] = [
  { code: 'a', schemeName: '单条形码', scanType: 'BARCODE', scanContent: 'TS-001' },
  { code: 'b', schemeName: '单二维码', scanType: 'QRCODE', scanContent: 'https://example.com/asset/A-002' },
];

defineOptions({ name: 'TeQrcodeViewDemo' });
</script>

<style lang="less" scoped>
.te-qrcode-view-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tqv-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;

    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tqv-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tqv-card { width: 100%; }

  .tqv-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tqv-tip { color: #909399; font-size: 12px; }

  .tqv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .tqv-cell {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 12px;
    text-align: center;
  }
  .tqv-cell-name { font-size: 12px; color: #606266; margin-bottom: 8px; }
}
</style>
