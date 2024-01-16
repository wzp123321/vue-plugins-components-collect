import { defineComponent, onMounted, reactive, ref } from 'vue';
import AddAndEditBenchmarkingIndexDialog from './components/bi-add-update-dialog.vue';
import { ElForm } from 'element-plus';
import { pageSizes } from '@/config/index';
import { ElMessageBox } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import benchMarkingIndex from '@/pages/benchmarking-index/service/benchmarking-index.service';
import { useStore } from 'vuex';
import commonService from '@/services/common/common';
import { BENCHMARKING_SYSTEM } from '@/config/enum';
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
interface CorrelationType {
  unit: string;
  name: string;
  fixed: string;
  id: number;
}
export default defineComponent({
  name: 'benchMarkingIndex',
  components: {
    AddAndEditBenchmarkingIndexDialog,
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
    let Correlation = ref<CorrelationType[]>([]); // 关联指标
    let HospitalLevel = ref<type[]>([]); // 能耗指标
    const rows = ref();
    let abnormalArr = ref();
    const tableData = ref<benchMarkingIndex.CommonObject[]>([]);
    let isDisabled = ref<boolean>(false);
    let isData = ref<benchMarkingIndex.CommonObject[]>([]);
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
      pageNum.value = 1;
      pageSize.value = pageSizes[0];
      getList();
    };
    // 重置
    const onReset = () => {
      formInline.search = '';
      onSearch();
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
        const res = await benchMarkingIndex.getListUrl(obj);
        if (res.code == 200 && res.success) {
          loading.value = false;
          tableData.value = res.data.list || [];
          total.value = res.data.total;
        } else {
          abnormal.value = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (error) {
        loading.value = false;
        abnormal.value = false;
        proxy.$message.error('获取列表数据失败');
        console.log('error------------', error);
      }
    };
    // 新增
    const onAddDialogShow = () => {
      rows.value = null;
      nums.value++;
      dialogAdd.value = true;
    };
    // 修改
    const onEnergyCodeUpdate = async (item: rowsType) => {
      const res = await benchMarkingIndex.queryBenchmarkingIsDataUrl(item.id);
      if (res.code == 200 && res.success) {
        // isDisabled.value = true;
        isData.value = res.data || [];
      } else {
      }
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
    const queryBenchmarkingIsDataById = async (item: number) => {
      const res = await benchMarkingIndex.queryBenchmarkingIsDataUrl(item);
      if (res.code == 200 && res.success) {
        // 有数据提示消息，是否要删除
        if (res.data.length > 0) {
          ElMessageBox.confirm('该对标指标下有数据信息，确认删除吗?', '提示', {
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
        .deleteUrl(obj)
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

    // 查询关联指标
    const queryCorrelationIndex = async () => {
      try {
        const res = await benchMarkingIndex.queryCorrelationIndexListUrl();
        if (res.code == 200 && res.success) {
          Correlation.value = res.data || [];
          // console.log('Correlation11', Correlation);
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '获取关联指标失败');
          }
        }
      } catch (error) {
        proxy.$message.error('获取关联指标失败');
      }
    };

    // 查询医院等级
    const queryHospitalLevel = async () => {
      try {
        const res = await commonService.getDictionaryData(BENCHMARKING_SYSTEM.HOSPITALLEVEL);
        if (res.code == 200 && res.success) {
          HospitalLevel.value = res.data || [];
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '获取医院等级失败');
          }
        }
      } catch (error) {
        proxy.$message.error('获取医院等级失败');
      }
    };

    onMounted(async () => {
      await onSearch();
      queryCorrelationIndex();
      queryHospitalLevel();
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
      Correlation,
      HospitalLevel,
      queryBenchmarkingIsDataById,
      queryCorrelationIndex,
      // abnormalArr,
      isDisabled,
      isData,
    };
  },
});
