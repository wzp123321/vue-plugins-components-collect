import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export interface CellMergeConfig {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

export interface HeaderCellConfig {
  row: number
  col: number
  value: string
  font?: Partial<ExcelJS.Font>
  alignment?: Partial<ExcelJS.Alignment>
  merge?: CellMergeConfig
}

export interface ColumnWidthConfig {
  width: number
}

export interface BorderRange {
  startRow: number
  endRow: number
  startCol: number
  endCol: number
}

export function createWorkbook(sheetName: string) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)
  return { workbook, worksheet }
}

export function setHeaderCell(
  worksheet: ExcelJS.Worksheet,
  config: HeaderCellConfig,
) {
  const cell = worksheet.getCell(config.row, config.col)
  cell.value = config.value
  cell.font = { bold: true, ...config.font }
  cell.alignment = { horizontal: 'center', vertical: 'middle', ...config.alignment }

  if (config.merge) {
    worksheet.mergeCells(
      config.merge.startRow,
      config.merge.startCol,
      config.merge.endRow,
      config.merge.endCol,
    )
  }
}

export function mergeCells(
  worksheet: ExcelJS.Worksheet,
  config: CellMergeConfig,
) {
  worksheet.mergeCells(
    config.startRow,
    config.startCol,
    config.endRow,
    config.endCol,
  )
}

export function applyBorders(
  worksheet: ExcelJS.Worksheet,
  range: BorderRange,
) {
  for (let row = range.startRow; row <= range.endRow; row++) {
    for (let col = range.startCol; col <= range.endCol; col++) {
      const cell = worksheet.getCell(row, col)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    }
  }
}

export function setColumnWidths(
  worksheet: ExcelJS.Worksheet,
  widths: ColumnWidthConfig[],
) {
  worksheet.columns = widths
}

export async function exportWorkbook(
  workbook: ExcelJS.Workbook,
  fileName: string,
) {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, fileName)
}