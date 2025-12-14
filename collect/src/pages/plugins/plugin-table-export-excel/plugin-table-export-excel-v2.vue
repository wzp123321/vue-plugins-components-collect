<template>
  <div class="export-container">
    <div class="export-controls">
      <!-- <el-button type="primary" @click="exportExcelWithMultiHeader">导出Excel文件</el-button> -->
      <el-button type="success" @click="exportWithStyledHeader">导出带样式Excel</el-button>
    </div>
    <!-- 示例表格（用于展示结构） -->
    <div class="table-preview">
      <table class="preview-table" border="1">
        <thead>
          <tr>
            <th :colspan="9" style="background-color: #4f81bd; color: white">
              区域费用排名成本明细【2025-11-01~2025-11-30】
            </th>
          </tr>
          <tr>
            <th :rowspan="2" style="background-color: #b4c6e7">序号</th>
            <th :rowspan="2" style="background-color: #b4c6e7">对象</th>
            <th :rowspan="2" style="background-color: #b4c6e7">总成本</th>
            <th :colspan="6" style="background-color: #c0504d; color: white">分项成本</th>
          </tr>
          <tr>
            <th style="background-color: #f2dcdb">电用量</th>
            <th style="background-color: #f2dcdb">电成本</th>
            <th style="background-color: #f2dcdb">水用量</th>
            <th style="background-color: #f2dcdb">水成本</th>
            <th style="background-color: #f2dcdb">其他用量</th>
            <th style="background-color: #f2dcdb">其他成本</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tableData" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.object }}</td>
            <td>{{ formatCurrency(item.totalCost) }}</td>
            <td>{{ item.electricUsage }}{{ item.electricUnit }}</td>
            <td>{{ formatCurrency(item.electricCost) }}</td>
            <td>{{ item.waterUsage }}{{ item.waterUnit }}</td>
            <td>{{ formatCurrency(item.waterCost) }}</td>
            <td>{{ item.otherUsage }}{{ item.otherUnit }}</td>
            <td>{{ formatCurrency(item.otherCost) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { ElMessage, ElButton } from 'element-plus';

// 表格数据
const tableData = ref([
  {
    id: 1,
    object: '华东区域',
    totalCost: 258000,
    electricUsage: 120000,
    electricUnit: 'kWh',
    electricCost: 108000,
    waterUsage: 5000,
    waterUnit: '吨',
    waterCost: 25000,
    otherUsage: 300,
    otherUnit: '项',
    otherCost: 125000,
  },
  {
    id: 2,
    object: '华南区域',
    totalCost: 187500,
    electricUsage: 89000,
    electricUnit: 'kWh',
    electricCost: 80100,
    waterUsage: 4200,
    waterUnit: '吨',
    waterCost: 21000,
    otherUsage: 250,
    otherUnit: '项',
    otherCost: 86400,
  },
  {
    id: 3,
    object: '华北区域',
    totalCost: 224800,
    electricUsage: 105000,
    electricUnit: 'kWh',
    electricCost: 94500,
    waterUsage: 4800,
    waterUnit: '吨',
    waterCost: 24000,
    otherUsage: 280,
    otherUnit: '项',
    otherCost: 106300,
  },
  {
    id: 4,
    object: '西南区域',
    totalCost: 165200,
    electricUsage: 76000,
    electricUnit: 'kWh',
    electricCost: 68400,
    waterUsage: 3800,
    waterUnit: '吨',
    waterCost: 19000,
    otherUsage: 220,
    otherUnit: '项',
    otherCost: 77800,
  },
  {
    id: 5,
    object: '西北区域',
    totalCost: 142300,
    electricUsage: 65000,
    electricUnit: 'kWh',
    electricCost: 58500,
    waterUsage: 3200,
    waterUnit: '吨',
    waterCost: 16000,
    otherUsage: 200,
    otherUnit: '项',
    otherCost: 67800,
  },
]);

// 格式化货币显示
const formatCurrency = (value) => `¥${value.toLocaleString('zh-CN')}`;

const applyRichStyles = (ws, wsData) => {
  // 颜色方案
  const colors = {
    header1: '4F81BD', // 一级表头 - 深蓝
    header2Left: 'B4C6E7', // 二级表头左侧 - 浅蓝
    header2Right: 'C0504D', // 二级表头右侧 - 红色
    header3: 'F2DCDB', // 三级表头 - 浅红
    dataEven: 'FFFFFF', // 数据行偶数 - 白色
    dataOdd: 'F3F3F3', // 数据行奇数 - 浅灰
    total: 'E2EFDA', // 汇总行 - 浅绿
  };

  // 应用样式到所有单元格
  for (let r = 0; r < wsData.length; r++) {
    for (let c = 0; c < wsData[r].length; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellAddress]) {
        return;
      }

      let cellStyle = {};

      // 第一行
      if (r === 0) {
        cellStyle = {
          font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
          fill: { patternType: 'solid', fgColor: { rgb: colors.header1 } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
      // 第二行
      else if (r === 1) {
        const isRightSection = c >= 3;
        cellStyle = {
          font: {
            bold: true,
            sz: 12,
            color: { rgb: isRightSection ? 'FFFFFF' : '000000' },
          },
          fill: {
            patternType: 'solid',
            fgColor: {
              rgb: isRightSection ? colors.header2Right : colors.header2Left,
            },
          },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
      // 第三行
      else if (r === 2 && c >= 3) {
        cellStyle = {
          font: { bold: true, sz: 11 },
          fill: { patternType: 'solid', fgColor: { rgb: colors.header3 } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
      // 数据行
      else if (r >= 3 && r < wsData.length - 1) {
        const isEvenRow = (r - 3) % 2 === 0;
        cellStyle = {
          font: { sz: 11 },
          fill: {
            patternType: 'solid',
            fgColor: { rgb: isEvenRow ? colors.dataEven : colors.dataOdd },
          },
          alignment: {
            horizontal: c === 1 ? 'left' : 'center',
            vertical: 'center',
          },
          border: {
            top: { style: 'thin', color: { rgb: 'D0D0D0' } },
            bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
            left: { style: 'thin', color: { rgb: 'D0D0D0' } },
            right: { style: 'thin', color: { rgb: 'D0D0D0' } },
          },
        };

        // 成本列设置数字格式
        if (c === 2 || c === 4 || c === 6 || c === 8) {
          ws[cellAddress].t = 'n';
          ws[cellAddress].z = '¥#,##0';
        }
      }
      // 汇总行
      else if (r === wsData.length - 1) {
        cellStyle = {
          font: { bold: true, sz: 12 },
          fill: { patternType: 'solid', fgColor: { rgb: colors.total } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };

        // 汇总行数字格式
        if (c === 2 || c === 4 || c === 6 || c === 8) {
          ws[cellAddress].t = 'n';
          ws[cellAddress].z = '¥#,##0';
        }
      }

      // 应用样式
      if (Object.keys(cellStyle).length > 0) {
        ws[cellAddress].s = cellStyle;
      }
    }
  }
};
// 构建工作表数据的辅助函数
const buildWorksheetData = () => {
  // 第一行
  const row1 = ['区域费用排名成本明细【2025-11-01~2025-11-30]'];

  // 第二行
  const row2 = ['序号', '对象', '总成本', '分项成本', '', '', '', '', ''];

  // 第三行
  const row3 = ['', '', '', '电用量', '电成本', '水用量', '水成本', '其他用量', '其他成本'];

  // 数据行
  const dataRows = tableData.value.map((item) => [
    item.id,
    item.object,
    item.totalCost,
    `${item.electricUsage}${item.electricUnit}`,
    item.electricCost,
    `${item.waterUsage}${item.waterUnit}`,
    item.waterCost,
    `${item.otherUsage}${item.otherUnit}`,
    item.otherCost,
  ]);

  return [row1, row2, row3, ...dataRows];
};
// 导出带更丰富样式的Excel
const exportWithStyledHeader = () => {
  try {
    // 使用相同的表头结构，但应用更丰富的样式
    const wb = XLSX.utils.book_new();
    // 构建工作表数据
    const wsData = buildWorksheetData();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // 设置合并单元格
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },
      { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } },
      { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } },
      { s: { r: 1, c: 3 }, e: { r: 1, c: 8 } },
    ];
    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, // 序号
      { wch: 30 }, // 对象
      { wch: 30 }, // 总成本
      { wch: 30 }, // 电用量
      { wch: 30 }, // 电成本
      { wch: 30 }, // 水用量
      { wch: 30 }, // 水成本
      { wch: 30 }, // 其他用量
      { wch: 30 }, // 其他成本
    ];
    // 应用丰富的样式
    applyRichStyles(ws, wsData);
    console.log('ws, wsData------', ws, wsData);
    // 导出
    const fileName = `区域费用明细_${new Date().getFullYear()}年${new Date().getMonth() + 1}月.xlsx`;
    XLSX.utils.book_append_sheet(wb, ws, '费用明细');
    XLSX.writeFile(wb, fileName);

    ElMessage.success('带样式Excel导出成功！');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error(`导出失败：${error.message}`);
  }
};
</script>

<style lang="less" scoped>
.export-container {
  width: 100%;
}

.table-preview {
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  table {
    width: 100%;
  }
}

.table-preview h3 {
  margin-bottom: 16px;
  color: #333;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
}

.preview-table th,
.preview-table td {
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #ddd;
}

.preview-table th {
  font-weight: bold;
}

.preview-table tbody tr:hover {
  background-color: #f5f5f5;
}

.export-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.export-controls .el-button {
  min-width: 160px;
  height: 44px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
