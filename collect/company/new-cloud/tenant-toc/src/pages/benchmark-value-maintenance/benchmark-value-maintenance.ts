import { defineComponent, onMounted, reactive, ref, computed } from 'vue';
import { ElDialog } from 'element-plus';
import { useRoute } from 'vue-router';
// config
import { pageSizesArray } from '@/config/index';
// utils
import { useCommonController } from '@/utils/use-common-controller';
import { getTenant } from '@/utils/index';

// compotents
import MonthlyProportion from './compotents/bvm-monthly-proportion/bvm-monthly-proportion.vue';
import editDialog from './compotents/bvm-edit.dialog/bvm-edit.dialog.vue';
// service
import CommonService from '../../service/pkg/index';
import BenchmarkValueMaintenanceService from './services/benchmark-value-maintenance.service';

export default defineComponent({
  name: 'householdNumberManagement',
  components: { MonthlyProportion, editDialog },
  setup() {
    const { proxy } = useCommonController();
    const route = useRoute();
    const clearFile = ref(); //获取导入input框ref
    const proportionRef = ref(ElDialog);
    const total = ref<number>(0);
    let isThatYear: boolean = false; // 是否是当年，用于查询年份下拉框初始化默认选中当年
    const hostingScopeList = ref<BenchmarkValueMaintenance.EnergyType[]>([]); // 托管范围下垃list
    const energyList = ref<BenchmarkValueMaintenance.EnergyType[]>([]); // 能源类型下垃list
    const yearList = ref<BenchmarkValueMaintenance.EnergyType[]>([]); // 查询年份下垃list
    const tableData = ref<BenchmarkValueMaintenance.benchmarkValueMaintenanceListVO[]>([]); // 表格数据
    const unit = ref<string | undefined>(''); // 表格表头单位
    const loading = ref<boolean>(true); // table表格loading
    const householdNumberList = ref<GeneralModule.CommonObject | null>(); // 月度比例表数据
    const editDialogAdd = ref<boolean>(false); // 编辑弹框显示隐藏
    const editNum = ref<number>(1); // 编辑弹框唯一标识
    const editRows = ref(); // 传到编辑组件数据
    const year = ref<string | undefined>(''); // 年份，用于展示编辑弹框title
    const energyCode = ref<string | undefined>(''); // 能源类型，用于查询月度比例表
    const energyCodeName = ref<string | undefined>(''); // 能源类型，用于查询月度比例表
    const hostingScope = ref<string | undefined>(''); // 托管范围，用于查询月度比例表
    const num = ref<number>(0);
    /**
     * 头部搜索表单
     */
    const formInline = reactive<BenchmarkValueMaintenance.FormInlineType>({
      hostingScope: '' || undefined,
      energyType: '' || undefined,
      date: '' || undefined,
    });
    // 公共入参
    const objCommon = computed(() => {
      return {
        ...getTenant(),
      };
    });
    // 搜索
    const onSearch = () => {
      year.value = formInline.date;
      energyCode.value = formInline.energyType;
      hostingScope.value = formInline.hostingScope;
      energyList.value.map((item) => {
        if (item.code === formInline.energyType) {
          return (unit.value = item.unit);
        }
      });
      energyList.value.map((item) => {
        if (item.code === formInline.energyType) {
          return (energyCodeName.value = item.name);
        }
      });
      getList();
    };
    // 重置
    const onReset = () => {
      formInline.hostingScope = hostingScopeList.value.length > 0 ? hostingScopeList.value[0].code : undefined;
      formInline.energyType = energyList.value.length > 0 ? energyList.value[0].code : undefined;
      energyCode.value = energyList.value.length > 0 ? energyList.value[0].code : undefined;
      hostingScope.value = hostingScopeList.value.length > 0 ? hostingScopeList.value[0].code : undefined;
      if (yearList.value.length > 0) {
        isThatYear = yearList.value.some((item: BenchmarkValueMaintenance.EnergyType) => {
          return item.code === String(new Date().getFullYear());
        });
        formInline.date = isThatYear ? String(new Date().getFullYear()) : yearList.value[0].code;
        year.value = isThatYear ? String(new Date().getFullYear()) : yearList.value[0].code;
      } else {
        formInline.date = undefined;
        year.value = undefined;
      }
      onSearch();
    };
    // 获取能源类型下垃list
    const queryEnergyList = async () => {
      try {
        const url = '/baseHead/queryEnergyType';
        const res = await CommonService.queryBaseHead(objCommon.value, url);
        if (res.code == 200 && res.success) {
          energyList.value = res.data || [];
          formInline.energyType = energyList.value.length > 0 ? energyList.value[0].code : undefined;
          unit.value = energyList.value.length > 0 ? energyList.value[0].unit : '';
          energyCodeName.value = energyList.value.length > 0 ? energyList.value[0].name : '';
          energyCode.value = energyList.value.length > 0 ? energyList.value[0].code : undefined;
        } else {
        }
      } catch (error) {}
    };
    // 获取年份下垃list
    const queryYearList = async () => {
      try {
        const url = '/baseHead/queryHostingYears';
        const res = await CommonService.queryBaseHead(objCommon.value, url);
        if (res.code == 200 && res.success) {
          yearList.value = res.data || [];
          if (yearList.value.length > 0) {
            isThatYear = yearList.value.some((item: BenchmarkValueMaintenance.EnergyType) => {
              return item.code === String(new Date().getFullYear());
            });
            formInline.date = isThatYear ? String(new Date().getFullYear()) : yearList.value[0].code;
            year.value = isThatYear ? String(new Date().getFullYear()) : yearList.value[0].code;
          } else {
            formInline.date = undefined;
            year.value = undefined;
          }
        } else {
        }
      } catch (error) {}
    };
    // 获取托管范围下垃list
    const queryHostingScopeListList = async () => {
      try {
        const url = '/baseHead/queryHostingScope';
        const res = await CommonService.queryBaseHead(objCommon.value, url);
        if (res.code == 200 && res.success) {
          hostingScopeList.value = res.data || [];
          formInline.hostingScope = hostingScopeList.value.length > 0 ? hostingScopeList.value[0].code : undefined;
          hostingScope.value = hostingScopeList.value.length > 0 ? hostingScopeList.value[0].code : undefined;
        } else {
        }
      } catch (error) {}
    };
    // 获取table数据
    const getList = async () => {
      try {
        loading.value = true;
        const obj = {
          ...getTenant(),
          energyCode: energyCode.value,
          hostingId: Number(hostingScope.value),
          year: Number(year.value),
        };
        const res = await BenchmarkValueMaintenanceService.queryBenchmarkValueMaintenanceList(obj);
        if (res.code == 200 && res.success) {
          loading.value = false;
          tableData.value = res.data || [];
        } else if (res.code === 19000 && res.success === false) {
          loading.value = false;
          householdNumberList.value = res.data || null;
          //proxy.$message.error(res.message);
          num.value++;
          proportionRef.value.show();
        } else {
          loading.value = false;
        }
      } catch (error) {
        loading.value = false;
        // console.log('error------------', error);
      }
    };
    // 月度比例表按钮事件
    const addHouseholdNumber = () => {
      queryHouseholdNumber();
      proportionRef.value.show();
    };
    // 查询月度比例表
    const queryHouseholdNumber = async () => {
      const obj = {
        energyCode: energyCode.value,
        hostingId: Number(hostingScope.value),
        ...getTenant(),
        year: Number(year.value),
      };
      const res = await BenchmarkValueMaintenanceService.queryHouseholdNumberList(obj);
      if (res.code == 200 && res.success) {
        householdNumberList.value = res.data;
        num.value++;
      } else {
      }
    };
    // 编辑按钮事件
    const edit = (val: BenchmarkValueMaintenance.benchmarkValueMaintenanceListVO) => {
      editNum.value++;
      editRows.value = val;
      editDialogAdd.value = true;
    };
    // 修改月度比例成功回调
    const addOK = () => {
      getList();
    };
    // 修改基准值数据成功回调
    const editOK = () => {
      getList();
    };
    onMounted(async () => {
      await queryEnergyList();
      await queryHostingScopeListList();
      await queryYearList();
      await getList();
    });
    return {
      clearFile,
      formInline,
      yearList,
      energyList,
      total,
      tableData,
      loading,
      pageSizesArray,
      householdNumberList,
      hostingScopeList,
      editDialogAdd,
      editNum,
      editRows,
      unit,
      proportionRef,
      year,
      energyCode,
      hostingScope,
      num,
      energyCodeName,
      onSearch,
      onReset,
      addHouseholdNumber,
      getList,
      edit,
      addOK,
      editOK,
    };
  },
});
