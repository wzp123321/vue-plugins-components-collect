/**
 * 职务 mock 数据
 */
export interface MockTitle {
  id: string;
  name: string;
  level: number;
  categoryId: string;
  disabled?: boolean;
}

export const mockTitles: MockTitle[] = [
  { id: 't-1', name: '前端工程师', level: 1, categoryId: 'tc-1' },
  { id: 't-2', name: '高级前端工程师', level: 2, categoryId: 'tc-1' },
  { id: 't-3', name: '前端架构师', level: 3, categoryId: 'tc-1' },
  { id: 't-4', name: '后端工程师', level: 1, categoryId: 'tc-2' },
  { id: 't-5', name: '高级后端工程师', level: 2, categoryId: 'tc-2' },
  { id: 't-6', name: '产品经理', level: 1, categoryId: 'tc-3' },
  { id: 't-7', name: '高级产品经理', level: 2, categoryId: 'tc-3', disabled: true },
];

export const mockTitleCategories = [
  { id: 'tc-1', name: '研发序列' },
  { id: 'tc-2', name: '研发序列' },
  { id: 'tc-3', name: '产品序列' },
];

export function searchTitles(keyword: string): Promise<MockTitle[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const k = keyword.trim().toLowerCase();
      if (!k) return resolve([]);
      resolve(mockTitles.filter((t) => t.name.toLowerCase().includes(k)));
    }, 200);
  });
}
