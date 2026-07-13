import { CD_CostDetailConvertVO } from './list.api';

export function mock(length = 1000, editing: boolean = false): CD_CostDetailConvertVO[] {
  return Array.from({ length }, (_index) => {
    return {
      id: randomId(),
      projectNumber: `${randomId()}`,
      projectTaskName: `${randomId()}`,
      ledgerCode: `${randomId()}`,
      ledgerName: `${randomId()}`,
      costNode: `${randomId()}`,
      employeeCode: `${randomId()}`,
      employeeName: `${randomId()}`,
      employeeDepartment: `${randomId()}`,
      employeeType: `${randomId()}`,
      productCode: `${randomId()}`,
      productName: `${randomId()}`,
      productType: `${randomId()}`,
      productTypeName: `${randomId()}`,
      billDate: `${randomId()}`,
      billYear: `${randomId()}`,
      billMonth: `${randomId()}`,
      billCode: `${randomId()}`,
      billTypeName: `${randomId()}`,
      billTitleContent: `${randomId()}`,
      billProjectContent: `${randomId()}`,
      recordTime: `${randomId()}`,
      balance: randomId(),
      amount: `${randomId()}`,
      costType: `${randomId()}`,
      listOrder: randomId(),
      addUpFlag: false,
      editing,
    };
  });
}

function randomId() {
  return Math.random() * 100000000;
}
