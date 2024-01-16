/*
 * @Description: 变量
 * @Autor: zpwan
 * @Date: 2022-04-18 09:31:57
 * @LastEditors: zpwan
 * @LastEditTime: 2022-05-07 09:34:00
 */
export enum FORM_STATUS {
  ADD = 1, // 新增
  EDITOR = 2, // 编辑
}

// 表单校验规则
export const rules = {
  energyCode: [
    {
      required: true,
      message: '请选择能源类型',
      trigger: 'blur',
    },
  ],
  accountNumber: [
    {
      required: true,
      message: '请选择户号',
      trigger: 'blur',
    },
  ],
  date: [
    {
      required: true,
      message: '请选择日期',
      trigger: 'change',
    },
  ],
  amount: [
    {
      required: true,
      message: '请输入用量',
      trigger: 'blur',
    },
  ],
  actualPayment: [
    {
      required: true,
      message: '请输入实际缴费',
      trigger: 'blur',
    },
  ],
  billDate: [
    {
      required: true,
      message: '请选择账期',
      trigger: 'change',
    },
  ],
  fileList: [
    {
      required: true,
      message: '请选择附件',
      trigger: 'blur',
    },
  ],
};
