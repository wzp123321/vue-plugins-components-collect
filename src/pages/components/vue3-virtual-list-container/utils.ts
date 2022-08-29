import { CD_CostDetailConvertVO } from './list.api';

export function uuid() {
  let d = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function mock(length = 1000, editing: boolean = false): CD_CostDetailConvertVO[] {
  return Array.from({ length }, index => {
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
