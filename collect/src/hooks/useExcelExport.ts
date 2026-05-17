import { ref } from 'vue'
import ExcelJS from 'exceljs'
import {
  createWorkbook,
  setHeaderCell,
  applyBorders,
  exportWorkbook,
  type HeaderCellConfig,
  type ColumnWidthConfig,
} from '@/utils/excel'

export interface ExcelExportConfig {
  sheetName: string
  fileName: string
  headerRows: HeaderCellConfig[][]
  columnWidths: ColumnWidthConfig[]
}

export interface UseExcelExportOptions<T = Record<string, unknown>> {
  getRowValue: (item: T) => (string | number)[]
}

export function useExcelExport<T = Record<string, unknown>>(
  options: UseExcelExportOptions<T>,
) {
  const { getRowValue } = options
  const exporting = ref(false)

  async function doExport(
    data: T[],
    config: ExcelExportConfig,
  ) {
    exporting.value = true
    try {
      const { workbook, worksheet } = createWorkbook(config.sheetName)

      config.headerRows.forEach((row) => {
        row.forEach((headerConfig) => {
          setHeaderCell(worksheet, headerConfig)
        })
      })

      const headerRowCount = config.headerRows.length
      data.forEach((item, rowIndex) => {
        const dataRow = rowIndex + headerRowCount + 1
        const values = getRowValue(item)
        values.forEach((value, colIndex) => {
          worksheet.getCell(dataRow, colIndex + 1).value = value
        })
      })

      setColumnWidths(worksheet, config.columnWidths)

      const totalCols = config.columnWidths.length
      applyBorders(worksheet, {
        startRow: 1,
        endRow: headerRowCount + data.length,
        startCol: 1,
        endCol: totalCols,
      })

      await exportWorkbook(workbook, config.fileName)
    } finally {
      exporting.value = false
    }
  }

  return {
    exporting,
    doExport,
  }
}