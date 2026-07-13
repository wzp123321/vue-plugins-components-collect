<template>
  <div class="te-print-template-view-demo">
    <header class="tptv-demo-header">
      <h3>te-print-template-view — 打印模板渲染</h3>
      <p>支持 mm 单位等比缩放、文字撑满、二维码/条形码、表格、分页。</p>
    </header>
    <div class="tptv-demo-stage">
      <te-print-template-view :template="template" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TePrintTemplateView, type PtTemplate } from '../../../components/te-print-template-view';

const template: PtTemplate = {
  width: 100, // mm
  height: 60, // mm
  items: [
    { id: 't1', type: 'text', x: 5, y: 5, width: 50, height: 6, content: '资产名称：中央空调', fontSize: 4, color: '#000' } as any,
    { id: 't2', type: 'text', x: 5, y: 12, width: 50, height: 6, content: '资产编号：A-2026-001', fontSize: 4 } as any,
    { id: 'st1', type: 'styled-text', x: 5, y: 22, width: 50, height: 8, content: '天溯集团资产', fontSize: 5, color: '#333', bold: true } as any,
    { id: 'q1', type: 'qrcode', x: 60, y: 5, width: 30, height: 30, content: 'https://example.com/A-001' } as any,
    { id: 'b1', type: 'barcode', x: 60, y: 38, width: 30, height: 12, content: 'TS-2026-A-001' } as any,
    { id: 'tab1', type: 'table', x: 5, y: 32, width: 50, height: 22, header: ['项目', '值'], rows: [['位置', 'A栋101'], ['状态', '在用']] } as any,
  ],
};

defineOptions({ name: 'TePrintTemplateViewDemo' });
</script>

<style lang="less" scoped>
.te-print-template-view-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;

  .tptv-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;

    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tptv-demo-stage {
    flex: 1;
    min-height: 0;
  }
}
</style>
