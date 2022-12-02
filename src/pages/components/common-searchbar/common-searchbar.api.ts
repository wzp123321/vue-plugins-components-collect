export enum CS_ESearchBarType {
  输入框 = 'input',
  下拉框 = 'select',
  下拉树 = 'tree-select',
  日期选择器 = 'date-picker',
}

export interface CommonObject {
  [key: string]: string | number | Date | Date[] | boolean
}

export interface CS_ISearchBarVO {
  type:
    | CS_ESearchBarType.下拉树
    | CS_ESearchBarType.下拉框
    | CS_ESearchBarType.日期选择器
    | CS_ESearchBarType.输入框
  key: string
  label: string
  change?: (value: unknown) => void
  options: CS_IOptions
  placeholder: string
  dataSource?: any
}

/**
 * 输入框配置
 */
export interface CS_IOptions {
  width?: string
  height?: string

  maxlength?: number
  label?: string
  value?: string

  datepickerType?:
    | 'year'
    | 'month'
    | 'date'
    | 'dates'
    | 'week'
    | 'datetime'
    | 'datetimerange'
    | 'daterange'
    | 'monthrange'

  disabledDate?: (date: Date) => boolean
}
/**
 * 输入框配置
 */
export interface CS_IInputOptions {
  maxlength: number
}
/**
 * 下拉框配置
 */
export interface CS_ISelectOptions {
  key: string
  value: string
}
/**
 * 下拉树配置
 */
export interface CS_ITreeSelectOptions {
  maxlength: number
}
