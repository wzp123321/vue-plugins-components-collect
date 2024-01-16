import { defineComponent, onMounted, reactive, ref } from 'vue';
import AddAndEditDialog from './compotents/bs-add-update-dialog.vue';
import { ElForm } from 'element-plus';
import { pageSizes } from '@/config/index';
import useCurrentInstance from '@/utils/use-current-instance';
import benchMarkingSystem from '@/pages/benchmarking-system/service/benchmarking-system.service';
import { useStore } from 'vuex';
import commonService from '@/services/common/common';
import { BENCHMARKING_SYSTEM } from '@/config/enum';
interface formInlineType {
  search: string;
}
interface rowsType {
  // general: string;
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
  name: 'benchMarkingSystem',
  components: {
    AddAndEditDialog,
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
    let Region = ref<type[]>([]); // 医院所属地区
    let HospitalLevel = ref<type[]>([]); // 医院等级
    let HospitalType = ref<type[]>([]); // 医院类型
    let HeatingMode = ref<type[]>([]); // 供暖方式
    let CoolingMode = ref<type[]>([]); // 供冷方式
    const rows = ref();
    let abnormalArr = ref();
    const tableData = ref<benchMarkingSystem.CommonObject[]>([]);
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
        console.log(pageNum.value, 'pageNum.value-----');

        let obj = {
          id: 0,
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
        const res = await benchMarkingSystem.getListUrl(obj);
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
        abnormal.value = false;
        console.log('error------------', error);
      } finally {
        loading.value = false;
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
    // 删除
    const onEnergyCodeDelete = async (item: number) => {
      let obj = {
        id: item,
      };
      await benchMarkingSystem
        .deleteUrl(obj)
        .then((res: any) => {
          if (res && res.code == 200 && res.success) {
            getList();
            return proxy.$message.success('删除成功');
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error('删除失败');
            }
          }
        })
        .catch((error: Error) => {
          console.log('error----------', error);
        });
    };

    // 查询所属地区
    const queryRegion = async () => {
      try {
        const res = await commonService.getDictionaryData(BENCHMARKING_SYSTEM.REGION);
        if (res.code == 200 && res.success) {
          Region.value = res.data || [];
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '获取医院所属地区失败');
          }
        }
      } catch (error) {
        proxy.$message.error('获取医院所属地区失败');
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

    // 查询医院类型
    const queryHospitalType = async () => {
      try {
        const res = await commonService.getDictionaryData(BENCHMARKING_SYSTEM.HOSPITALTYPE);
        if (res.code == 200 && res.success) {
          HospitalType.value = res.data || [];
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '获取医院类型失败');
          }
        }
      } catch (error) {
        proxy.$message.error('获取医院类型失败');
      }
    };

    // 查询供暖方式
    const queryHeatingMode = async () => {
      try {
        const res = await commonService.getDictionaryData(BENCHMARKING_SYSTEM.HEATINGMODE);
        if (res.code == 200 && res.success) {
          HeatingMode.value = res.data || [];
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '获取供暖方式失败');
          }
        }
      } catch (error) {
        proxy.$message.error('获取供暖方式失败');
      }
    };

    // 查询供暖方式
    const queryCoolingMode = async () => {
      try {
        const res = await commonService.getDictionaryData(BENCHMARKING_SYSTEM.COOLINGMODE);
        if (res.code == 200 && res.success) {
          CoolingMode.value = res.data || [];
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '获取供冷方式失败');
          }
        }
      } catch (error) {
        proxy.$message.error('获取供冷方式失败');
      }
    };

    onMounted(async () => {
      await onSearch();
      queryRegion();
      queryHospitalLevel();
      queryHospitalType();
      queryHeatingMode();
      queryCoolingMode();
      // getQueryList();
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
      Region,
      HospitalLevel,
      HospitalType,
      HeatingMode,
      CoolingMode,
    };
  },
});
