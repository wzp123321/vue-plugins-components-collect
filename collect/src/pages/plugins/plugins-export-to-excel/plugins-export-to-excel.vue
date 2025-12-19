<template>
  <div class="export-container">
    <div class="export-controls">
      <el-button type="success" @click="exportExcel">导出带样式Excel</el-button>
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
            <th v-for="item in " style="background-color: #f2dcdb">电用量</th>
            <th style="background-color: #f2dcdb">电成本</th>
            <th style="background-color: #f2dcdb">水用量</th>
            <th style="background-color: #f2dcdb">水成本</th>
            <th style="background-color: #f2dcdb">其他用量</th>
            <th style="background-color: #f2dcdb">其他成本</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in exportData" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.object }}</td>
            <td>{{ item.totalCost }}</td>
            <td>{{ item.electricUsage }}{{ item.electricUnit }}</td>
            <td>{{ item.electricCost }}</td>
            <td>{{ item.waterUsage }}{{ item.waterUnit }}</td>
            <td>{{ item.waterCost }}</td>
            <td>{{ item.otherUsage }}{{ item.otherUnit }}</td>
            <td>{{ item.otherCost }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElButton } from 'element-plus';
import { testTableData } from './model';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// 表格数据
const exportData = ref([
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

const getSecondLevelHeaders = () => {
  return [
    { name: '序号', colSpan: 1, rowSpan: 2 },
    { name: '对象', colSpan: 1, rowSpan: 2 },
    { name: '总成本', colSpan: 1, rowSpan: 2 },
    { name: '分项成本', colSpan: testTableData.title?.length, rowSpan: 1 }, // 合并4列
  ];
};

const exportExcel = async () => {
  // 创建工作簿
  const workbook = new ExcelJS.Workbook();
  // 添加sheet页
  const worksheet = workbook.addWorksheet('成本明细');

  // 第一级表头：区域费用排名成本明细【2025-11-01~2025-11-30】（合并所有列）
  worksheet.mergeCells(1, 1, 1, testTableData.title.length + 3); // 合并第一行所有列
  const firstLevelHeader = worksheet.getCell('A1');
  firstLevelHeader.value = '区域费用排名成本明细【2025-11-01~2025-11-30】';
  firstLevelHeader.font = { bold: true, size: 14 };
  firstLevelHeader.alignment = { horizontal: 'center', vertical: 'middle' };

  // 第二级表头行（第二行）
  const secondLevelHeaders = getSecondLevelHeaders();

  // 第三级表头行（第三行）
  const thirdLevelHeaders = testTableData.title;

  // 设置第二级表头
  let colIndex = 1;
  secondLevelHeaders.forEach((header) => {
    const cell = worksheet.getCell(2, colIndex);
    cell.value = header.name;
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 设置合并单元格
    if (header.rowSpan > 1 || header.colSpan > 1) {
      worksheet.mergeCells(2, colIndex, 2 + (header.rowSpan - 1 || 0), colIndex + (header.colSpan - 1 || 0));
    }

    // 如果是分项成本，需要为下面的第三级表头预留位置
    if (header.name === '分项成本') {
      // 这里不增加 colIndex，因为分项成本已经合并了4列
      // 下面的第三级表头会处理这4列
    } else {
      colIndex += header.colSpan || 1;
    }
  });

  // 设置第三级表头（分项成本下面的表头）
  thirdLevelHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(3, 4 + index); // 从第4列开始
    cell.value = header;
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  // 设置数据行
  testTableData.body.forEach((row, rowIndex) => {
    const dataRow = rowIndex + 4; // 从第4行开始（因为表头占用了1-3行）
    testTableData.title.forEach((_i, index) => {
      // 设置每列数据
      worksheet.getCell(dataRow, index + 1).value = row[index];
    });
  });

  // 设置列宽
  worksheet.columns = [
    { width: 20 }, // 序号
    { width: 40 }, // 对象
    { width: 30 }, // 总成本
    ...testTableData.title?.map((item) => ({ width: 30 })),
  ];

  // 设置边框
  const startRow = 1;
  const endRow = 3 + testTableData.body.length;
  const startCol = 1;
  const endCol = testTableData.title.length + 3;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cell = worksheet.getCell(row, col);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  }

  // 导出文件
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, '区域费用排名成本明细.xlsx');
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
