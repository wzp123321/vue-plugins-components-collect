import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElForm } from 'element-plus';

import AddAndEditDialog from './compotents/kb-bl-add-update-dialog.vue';
import { pageSizesArray } from '@/config/index';
import useCurrentInstance from '@/utils/use-current-instance';
import benchMarkingLibrary from '@/pages/knowledge-base/kb-benchmaerking-library/service/kb-benchmaerking-library.service';
import commonService from '@/service/pkg/index';
import { BENCHMARKING_SYSTEM } from '@/pages/knowledge-base/kb-benchmaerking-library/constant/index';
interface formInlineType {
  search: string;
}

export default defineComponent({
  name: 'benchMarkingLibrary',
  components: {
    AddAndEditDialog,
  },
  setup() {
    const router = useRouter();
    const multipleTable = ref(ElForm);
    const { proxy } = useCurrentInstance();
    const formInline = reactive<formInlineType>({
      search: '',
    });
    const loading = ref<boolean>(true);
    const pageNum = ref<number>(1);
    const pageSize = ref<number>(pageSizesArray[0]);
    const total = ref<number>(0);
    const nums = ref<number>(1);
    const dialogAdd = ref<boolean>(false); // 新增编辑弹框显示与隐藏
    const Region = ref<GeneralModule.DictionaryInfo[]>([]); // 医院所属地区
    const HospitalLevel = ref<GeneralModule.DictionaryInfo[]>([]); // 医院等级
    const HospitalType = ref<GeneralModule.DictionaryInfo[]>([]); // 医院类型
    const HeatingMode = ref<GeneralModule.DictionaryInfo[]>([]); // 供暖方式
    const CoolingMode = ref<GeneralModule.DictionaryInfo[]>([]); // 供冷方式
    const rows = ref(); // 编辑回显数据
    const tableData = ref<BenchmarkingLibrary.CommonObject[]>([]); // 表格数据
    // 搜索
    const onSearch = () => {
      pageNum.value = 1;
      pageSize.value = pageSizesArray[0];
      getList();
    };
    // 重置
    const onReset = () => {
      formInline.search = '';
      onSearch();
    };
    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      pageNum.value = 1;

      getList();
    };
    const onCurrentChange = (value: number) => {
      pageNum.value = value;
      getList();
    };
    // 获取列表
    const getList = async () => {
      try {
        loading.value = true;
        const obj = {
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
        const res = await benchMarkingLibrary.getListUrl(obj);
        if (res.code == 200 && res.success) {
          loading.value = false;
          tableData.value = res.data.list || [];
          total.value = res.data.total;
        } else {
          return proxy.$message.error(res.message);
        }
      } catch (error) {
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
    // 编辑
    const onBlUpdate = (item: BenchmarkingLibrary.tableDataSourceVO) => {
      nums.value++;
      rows.value = item;
      dialogAdd.value = true;
    };
    // 删除
    const onBlDelete = async (item: number) => {
      const obj = {
        id: item,
      };
      await benchMarkingLibrary
        .deleteUrl(obj)
        .then((res: any) => {
          if (res && res.code == 200 && res.success) {
            getList();
            return proxy.$message.success('删除成功');
          } else {
            return proxy.$message.error('删除失败');
          }
        })
        .catch((error: Error) => {
          console.log('error----------', error);
        });
    };
    // 维护数据 按钮事件
    const onDataMaintenance = (item: BenchmarkingLibrary.tableDataSourceVO) => {
      const url = router.resolve({
        path: '/home/benchmarkingDataMaintenance',
        query: {
          systemId: item.id,
        },
      });
      window.open(url.href, '_blank');
    };

    // 查询所属地区
    const queryRegion = async () => {
      try {
        const res = await commonService.queryDictionaryListByType(BENCHMARKING_SYSTEM.REGION);
        if (res.code == 200 && res.success) {
          Region.value = res.data || [];
        } else {
          // proxy.$message.error(res.message || '获取医院所属地区失败');
        }
      } catch (error) {
        // proxy.$message.error('获取医院所属地区失败');
      }
    };

    // 查询医院等级
    const queryHospitalLevel = async () => {
      try {
        const res = await commonService.queryDictionaryListByType(BENCHMARKING_SYSTEM.HOSPITALLEVEL);
        if (res.code == 200 && res.success) {
          HospitalLevel.value = res.data || [];
        } else {
          // proxy.$message.error(res.message || '获取医院等级失败');
        }
      } catch (error) {
        // proxy.$message.error('获取医院等级失败');
      }
    };

    // 查询医院类型
    const queryHospitalType = async () => {
      try {
        const res = await commonService.queryDictionaryListByType(BENCHMARKING_SYSTEM.HOSPITALTYPE);
        if (res.code == 200 && res.success) {
          HospitalType.value = res.data || [];
        } else {
          // proxy.$message.error(res.message || '获取医院类型失败');
        }
      } catch (error) {
        // proxy.$message.error('获取医院类型失败');
      }
    };

    // 查询供暖方式
    const queryHeatingMode = async () => {
      try {
        const res = await commonService.queryDictionaryListByType(BENCHMARKING_SYSTEM.HEATINGMODE);
        if (res.code == 200 && res.success) {
          HeatingMode.value = res.data || [];
        } else {
          // proxy.$message.error(res.message || '获取供暖方式失败');
        }
      } catch (error) {
        // proxy.$message.error('获取供暖方式失败');
      }
    };

    // 查询供暖方式
    const queryCoolingMode = async () => {
      try {
        const res = await commonService.queryDictionaryListByType(BENCHMARKING_SYSTEM.COOLINGMODE);
        if (res.code == 200 && res.success) {
          CoolingMode.value = res.data || [];
        } else {
          // proxy.$message.error(res.message || '获取供冷方式失败');
        }
      } catch (error) {
        // proxy.$message.error('获取供冷方式失败');
      }
    };

    onMounted(async () => {
      await onSearch();
      await queryRegion();
      await queryHospitalLevel();
      await queryHospitalType();
      await queryHeatingMode();
      await queryCoolingMode();
    });
    return {
      formInline,
      tableData,
      loading,
      pageNum,
      pageSize,
      total,
      pageSizesArray,
      multipleTable,
      nums,
      rows,
      dialogAdd,
      Region,
      HospitalLevel,
      HospitalType,
      HeatingMode,
      CoolingMode,
      onSearch,
      onReset,
      onAddDialogShow,
      getList,
      onPageSizeChange,
      onCurrentChange,
      onDataMaintenance,
      onBlUpdate,
      onBlDelete,
    };
  },
});
