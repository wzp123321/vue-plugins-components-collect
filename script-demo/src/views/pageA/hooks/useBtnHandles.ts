import { isFunction } from 'lodash-es';
import CreateForm from '../components/createForm.vue';
import Detail from '../modules/detail.vue';
import { Ref, ref } from 'vue';
import { TeModuleTable } from '@tiansu/ts-web-package';
import { useRouter } from 'vue-router';
import { SUCCESS_CODE } from '@/constant';
import { TeMessage } from '@tiansu/element-plus';
import { deleteData } from '@/apis/pageA';
import { RowType } from '@/apis/pageA/index.api';

export default (tableRef: Ref<InstanceType<typeof TeModuleTable>>) => {
  const router = useRouter();
  const createFromRef = ref<InstanceType<typeof CreateForm>>();
  const detailRef = ref<InstanceType<typeof Detail>>();
  const selectList = ref([]);
  const exportShow = ref(false);
  // 清除全选选中
  const clearSelection = () => {
    if (selectList.value.length === 0) {
      tableRef.value.clearSelection();
    }
  };
  // 操作按钮
  const operateBtns = [
    {
      buttonName: '查看',
      value: 'view',
      handler: (row: RowType) => {
        console.log(row);
        router.push({
          path: '/healthRecord/detail',
          query: {
            id: row.id,
          },
        });
      },
    },
    {
      buttonName: '编辑',
      value: 'edit',
      handler: (row: RowType) => {
        console.log(row);

        router.push({
          path: '/healthRecord/edit',
          query: {
            id: row.id,
          },
        });
      },
    },
    {
      buttonName: '删除',
      value: 'delete',
      showBtnPop: true,
      buttonColor: '#f5222d',
      pop: {
        cancel: '取消',
        confirm: '确认',
        tip: '删除后将无法恢复，确定要删除吗？',
      },
      handler: async (row: RowType) => {
        console.log(row);
        try {
          const res = await deleteData(row.id);
          if (res.errcode === SUCCESS_CODE) {
            TeMessage.success('操作成功');
            tableRef.value.query();
            selectList.value = selectList.value.filter(
              (item: RowType) => item.id !== row.id,
            );
            clearSelection();
          }
        } catch (error) {
          console.log('删除失败', error);
        }
      },
    },
  ];
  // 导出
  const exportFile = async () => {
    exportShow.value = true;
  };

  /**
   * 操作按钮handle
   */
  const operateRow = (data: { row: RowType; value: string }) => {
    const currentHander = operateBtns.find(
      (item) => item.value === data.value,
    )?.handler;
    if (isFunction(currentHander)) {
      currentHander(data.row);
    }
  };
  /**
   * 新增
   */
  const create = () => {
    router.push({
      path: '/healthRecord/create',
    });
  };
  return {
    operateRow,
    operateBtns,
    createFromRef,
    detailRef,
    exportFile,
    exportShow,
    selectList,
    clearSelection,
    create,
  };
};
