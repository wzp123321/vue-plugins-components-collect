export const XLSX_ACCEPT_EXTENSIONS_STR =
  'application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel.sheet.macroEnabled.12';
export const DOCX_ACCEPT_EXTENSIONS_STR =
  'application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const PDF_ACCEPT_EXTENSIONS_STR = 'application/pdf';

export enum XLSX_ACCEPT_EXTENSIONS {
  '.xls' = 'application/vnd.ms-excel',
  '.xlsx' = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xlsm' = 'application/vnd.ms-excel.sheet.macroEnabled.12',
}

export enum DOCX_ACCEPT_EXTENSIONS {
  '.doc' = 'application/msword',
  '.docx' = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export enum PDF_ACCEPT_EXTENSIONS {
  '.pdf' = 'application/pdf',
}

/**
 * 文件预览类型 -> 预览组件 key 的映射
 * 通过 MIME 字符串反查，避免在模板里写重复的 v-if 列表
 */
export const PREVIEW_MIME_MAP: Record<string, 'pdf' | 'docx' | 'excel'> = {
  [PDF_ACCEPT_EXTENSIONS['.pdf']]: 'pdf',
  [DOCX_ACCEPT_EXTENSIONS['.doc']]: 'docx',
  [DOCX_ACCEPT_EXTENSIONS['.docx']]: 'docx',
  [XLSX_ACCEPT_EXTENSIONS['.xls']]: 'excel',
  [XLSX_ACCEPT_EXTENSIONS['.xlsm']]: 'excel',
  [XLSX_ACCEPT_EXTENSIONS['.xlsx']]: 'excel',
};

export type PreviewType = (typeof PREVIEW_MIME_MAP)[keyof typeof PREVIEW_MIME_MAP];
