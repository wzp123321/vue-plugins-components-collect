import { CD_CostDetailVO } from './list.api';

export function mock(length = 1000, _editing: boolean = false): CD_CostDetailVO[] {
  return Array.from({ length }, (_item, index: number) => {
    return {
      index,
      abnormalDay: (Math.random() * 100).toFixed(0),
      abnormalNumber: (Math.random() * 100).toFixed(0),
      treeId: (Math.random() * 10000000).toFixed(0),
      treeName: `treeName/${(Math.random() * 100).toFixed(0)}`,
      treePath: `Path/${(Math.random() * 100).toFixed(0)}`,
    };
  });
}
