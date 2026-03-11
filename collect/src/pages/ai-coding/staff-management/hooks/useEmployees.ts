import { ref, computed } from 'vue';
import type { Employee, EmployeeType } from '../types';
import { ElMessage, ElMessageBox } from 'element-plus';

export function useEmployees() {
  const types: EmployeeType[] = ['全职', '兼职', '实习', '外包'];
  const keyword = ref('');
  const selectedType = ref<EmployeeType | ''>('');
  const pageSize = ref(10);
  const currentPage = ref(1);
  const data = ref<Employee[]>(
    Array.from({ length: 23 }).map((_, i) => ({
      id: i + 1,
      name: `员工${i + 1}`,
      type: types[i % types.length],
      gender: i % 2 === 0 ? '男' : '女',
      departed: i % 5 === 0,
    })),
  );
  const filtered = computed(() => {
    const kw = keyword.value.trim();
    return data.value.filter((d) => {
      const byKw = kw ? d.name.includes(kw) : true;
      const byType = selectedType.value ? d.type === selectedType.value : true;
      return byKw && byType;
    });
  });
  const total = computed(() => filtered.value.length);
  const start = computed(() => (currentPage.value - 1) * pageSize.value);
  const end = computed(() => start.value + pageSize.value);
  const pageData = computed(() => filtered.value.slice(start.value, end.value));

  function resetQuery() {
    keyword.value = '';
    selectedType.value = '';
    currentPage.value = 1;
  }
  const detailVisible = ref(false);
  const editVisible = ref(false);
  const detailRow = ref<Employee | null>(null);
  const editRow = ref<Employee | null>(null);
  const isCreate = ref(false);
  function openDetail(row: Employee) {
    detailRow.value = { ...row };
    detailVisible.value = true;
  }
  function openCreate() {
    isCreate.value = true;
    editRow.value = { id: 0, name: '', type: '全职', gender: '男', departed: false };
    editVisible.value = true;
  }
  function openEdit(row: Employee) {
    isCreate.value = false;
    editRow.value = { ...row };
    editVisible.value = true;
  }
  function saveEdit() {
    if (!editRow.value) return;
    if (isCreate.value) {
      const maxId = data.value.reduce((m, c) => Math.max(m, c.id), 0);
      data.value.unshift({ ...editRow.value, id: maxId + 1 });
    } else {
      const idx = data.value.findIndex((d) => d.id === editRow.value?.id);
      if (idx !== -1) data.value[idx] = { ...(editRow.value as Employee) };
    }
    editVisible.value = false;
  }
  function confirmDelete(row: Employee) {
    ElMessageBox.confirm('确认删除该员工吗？', '提示', { type: 'warning' })
      .then(() => {
        data.value = data.value.filter((d) => d.id !== row.id);
        ElMessage.success('已删除');
      })
      .catch(() => {});
  }
  function handleSearch() {
    currentPage.value = 1;
  }
  function handlePageChange(p: number) {
    currentPage.value = p;
  }

  return {
    types,
    keyword,
    selectedType,
    pageSize,
    currentPage,
    total,
    start,
    pageData,
    detailVisible,
    editVisible,
    detailRow,
    editRow,
    isCreate,
    resetQuery,
    openDetail,
    openCreate,
    openEdit,
    saveEdit,
    confirmDelete,
    handleSearch,
    handlePageChange,
  };
}

