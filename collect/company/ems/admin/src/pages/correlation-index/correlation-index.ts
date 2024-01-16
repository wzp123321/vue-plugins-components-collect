import { defineComponent, onMounted, reactive, ref } from 'vue';
import AddAndEditCorrelationIndexDialog from './components/ci-add-update-dialog.vue';
import { ElForm } from 'element-plus';
import { pageSizes } from '@/config/index';
import { ElMessageBox } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import benchMarkingIndex from '@/pages/benchmarking-index/service/benchmarking-index.service';
import { useStore } from 'vuex';
import { INPUT_TYPES } from '@/config/enum';

interface formInlineType {
  search: string;
}
interface rowsType {
  general: string;
  systemTypeText: string;
  systemName: string;
  heatingModeText: string;
  regionType: string;
  systemLevel: string;
  systemType: string;
  heatingMode: string;
  id: number;
  coolingMode: string;
  systemLevelText: string;
  regionTypeText: string;
  coolingModeText: string;
}
interface type {
  code: string;
  name: string;
}
export default defineComponent({
  name: 'correlationIndex',
  components: {
    AddAndEditCorrelationIndexDialog,
  },
  setup() {
    const store = useStore();
    const multipleTable = ref(ElForm);
    const { proxy } = useCurrentInstance();
    let formInline = reactive<formInlineType>({
      search: '',
    });
    let abnormal = ref<boolean>(true);
    let loading = ref<boolean>(true);
    let nums = ref<number>(1);
    let pageNum = ref<number>(1);
    let pageSize = ref<number>(pageSizes[0]);
    let total = ref<number>(0);
    let dialogAdd = ref<boolean>(false);
    const rows = ref();
    // let abnormalArr = ref();
    const tableData = ref<benchMarkingIndex.CommonObject[]>([]);
    let handleSelectArr;
    // 列表中多选
    const handleSelectionChange = (value: rowsType[]) => {
      handleSelectArr = [];
      if (value.length) {
        handleSelectArr = value.map((item: any) => {
          return item.id;
        });
      }
    };
    // 搜索
    const onSearch = () => {
      // console.log('onSearch');

      pageNum.value = 1;
      pageSize.value = pageSizes[0];
      getList();
    };
    // 重置
    const onReset = () => {
      formInline.search = '';
      onSearch();
    };
    // 回车查询事件
    const searchEnterFun = (e: any) => {
      let keyCode = window.event ? e.keyCode : e.which;
      let val = e.target.value;
      if (keyCode == 13) {
        console.log('敲击了回车');
      }
    };
    // 获取列表
    const getList = async () => {
      try {
        loading.value = true;
        let obj = {
          name: formInline.search,
          orders: [
            {
              asc: true,
              column: '',
            },
          ],
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          searchCount: true,
        };
        const res = await benchMarkingIndex.getCorrelationIndexListUrl(obj);
        // console.log(res, '报告报表');

        if (res.code == 200 && res.success) {
          loading.value = false;
          tableData.value = res.data.list || [];
          total.value = res.data.total;
          // console.log('list2');
        } else {
          abnormal.value = false;
          loading.value = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (error) {
        loading.value = false;
        abnormal.value = false;
        console.log('error------------', error);
        return proxy.$message.error('获取列表数据失败');
      }
    };
    // 新增
    const onAddDialogShow = () => {
      rows.value = null;
      nums.value++;
      dialogAdd.value = true;
    };
    // 修改
    const onEnergyCodeUpdate = (item: rowsType) => {
      nums.value++;
      rows.value = item;
      dialogAdd.value = true;
    };
    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      pageNum.value = 1;
      getList();
    };
    const onCurrentChange = (value: number) => {
      pageNum.value = Math.floor(value);
      getList();
    };

    // 根据指标id查询有无数据
    const queryCorrelationIsDataById = async (item: number) => {
      const res = await benchMarkingIndex.queryCorrelationIsDataUrl(item);
      if (res.code == 200 && res.success) {
        // 有数据提示消息，是否要删除
        if (res.data.length > 0) {
          ElMessageBox.confirm('该关联指标下有数据信息，确认删除吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(() => {
              onEnergyCodeDelete(item);
            })
            .catch(() => {});
        } else {
          // 没有数据直接删除
          onEnergyCodeDelete(item);
        }
      } else {
        return proxy.$message.error(res.message);
      }
    };

    // 删除
    const onEnergyCodeDelete = async (item: number) => {
      let obj = {
        id: item,
      };
      await benchMarkingIndex
        .deleteCorrelationIndexUrl(obj)
        .then((res: any) => {
          if (res.code == 200 && res.success) {
            getList();
            return proxy.$message.success(res.message);
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        })
        .catch((error: Error) => {
          console.log('error----------', error);
          return proxy.$message.error('操作失败');
        });
    };

    onMounted(async () => {
      await onSearch();
    });
    return {
      onSearch,
      onReset,
      onAddDialogShow,
      formInline,
      abnormal,
      tableData,
      loading,
      pageNum,
      pageSize,
      total,
      pageSizes,
      onEnergyCodeUpdate,
      onEnergyCodeDelete,
      multipleTable,
      handleSelectArr,
      handleSelectionChange,
      getList,
      onPageSizeChange,
      onCurrentChange,
      nums,
      rows,
      dialogAdd,
      INPUT_TYPES,
      queryCorrelationIsDataById,
      searchEnterFun,
      // abnormalArr,
    };
  },
});
