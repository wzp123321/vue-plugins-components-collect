/*
 * @Author: yut
 * @Date: 2023-09-13 15:25:01
 * @LastEditors: yut
 * @LastEditTime: 2023-09-27 16:12:25
 * @Descripttion:
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
