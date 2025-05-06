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
