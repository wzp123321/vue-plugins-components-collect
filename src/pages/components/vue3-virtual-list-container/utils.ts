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

export function mock(length = 1000): CD_CostDetailConvertVO[] {
  return Array.from({ length }, index => {
    return {
      id: randomId(),
      projectNumber: `${randomId()}-index`,
      projectTaskName: `${randomId()}-index`,
      ledgerCode: `${randomId()}-index`,
      ledgerName: `${randomId()}-index`,
      costNode: `${randomId()}-index`,
      employeeCode: `${randomId()}-index`,
      employeeName: `${randomId()}-index`,
      employeeDepartment: `${randomId()}-index`,
      employeeType: `${randomId()}-index`,
      productCode: `${randomId()}-index`,
      productName: `${randomId()}-index`,
      productType: `${randomId()}-index`,
      productTypeName: `${randomId()}-index`,
      billDate: `${randomId()}-index`,
      billYear: `${randomId()}-index`,
      billMonth: `${randomId()}-index`,
      billCode: `${randomId()}-index`,
      billTypeName: `${randomId()}-index`,
      billTitleContent: `${randomId()}-index`,
      billProjectContent: `${randomId()}-index`,
      recordTime: `${randomId()}-index`,
      balance: randomId(),
      amount: `${randomId()}-index`,
      costType: `${randomId()}-index`,
      listOrder: randomId(),
      addUpFlag: false,
      editing: false,
    };
  });
}

function randomId() {
  return Math.random() * 100000000;
}
