import { cloneDeep } from 'lodash';
import { defineComponent, reactive, ref, toRefs, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
// config
import { pageSizes } from '@/config/config';
// components
import { ElPopconfirm, ElPagination, ElForm, ElFormItem, ElInput } from 'element-plus';
// utils
import { thousandSeparation } from '@/utils/index';
import { useCommonController } from '@/utils/use-common-controller';
//services
import BenchmarkingManageService from './services/benchmarking-manage';

interface BenchmarkingManageState {
  queryParams: BenchMarkingManage.QueryParams;
  dataSource: BenchMarkingManage.BenchMarkingDetail[];
  loading: boolean;
  total: number;
  isEditFlag: number;
  fatherDialogVisible: boolean;
  parentForm: BenchMarkingManage.ParentForm;
  sonDialogVisible: boolean;
  sonForm: BenchMarkingManage.SonForm;
}
interface archType {
  unit: string;
  name: string;
  id: string;
}

export default defineComponent({
  name: 'BenchmarkingManage',
  components: {
    ElPopconfirm,
    ElPagination,
    ElForm,
    ElFormItem,
    ElInput,
  },
  setup() {
    const { proxy } = useCommonController();
    // 路由
    const router = useRouter();
    const timeTypeList = [{ value: '2', label: '年' }];
    const abnormal = ref<boolean>(true);
    const archTypeList = ref<archType[]>([]);
    const unit = ref<string>('kWh/㎡');
    const manageState = reactive<BenchmarkingManageState>({
      queryParams: {
        pageNum: 1,
        pageSize: pageSizes[0],
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        searchCount: true,
        name: '',
        type: 1,
        parentId: 0,
      },
      dataSource: [],
      loading: true,
      total: 0,
      isEditFlag: 0,
      fatherDialogVisible: false,
      parentForm: {
        parentName: '',
        parentOptions: [],
      },
      sonForm: {
        sonName: '',
        timeType: '2',
        archTypeId: 1 || undefined,
        benchmarkValue: '',
      },
      sonDialogVisible: false,
    });
    const manageRef = ref(ElForm);
    const manageSonRef = ref(ElForm);
    const rules = {
      sonName: [
        {
          required: true,
          message: '名称长度最多为20字,且不能为空',
          trigger: ['change', 'blur'],
        },
      ],
      timeType: [
        {
          required: true,
          message: '标杆值类型不能为空',
          trigger: ['change', 'blur'],
        },
      ],
      archTypeId: [
        {
          required: true,
          message: '指标类型不能为空',
          trigger: ['change', 'blur'],
        },
      ],
      benchmarkValue: [
        {
          required: true,
          message: '标杆值不能为空',
          trigger: ['change', 'blur'],
        },
      ],
    };
    // 父体系
    const supplierOptionsShow = ref<boolean>(false); //是否展示下拉框
    const supplierOptionsShowTips = ref<boolean>(false); //是否展示必填提示信息
    let allParentOptions: BenchMarkingManage.parentOptions[] = [];

    const supplierId = ref<number>(0);
    let parentId = 0;
    let showFlag: boolean = false; // 用来控制父体系弹框下拉框是否显示
    // 查询
    const onSearch = () => {
      getBenchManageList();
    };
    // 重置
    const onReset = async () => {
      manageState.queryParams.name = '';
      manageState.queryParams.pageNum = 1;
      manageState.queryParams.pageSize = pageSizes[0];
      await getBenchManageList();
    };
    //新增
    const onAdddialog = async () => {
      manageState.fatherDialogVisible = true;
      // buildingInfoRef.value.validateField('treeId');
      queryAllFatherSystem();
    };
    /**
     * 父体系 start
     */
    // 新增查询所有父体系
    const queryAllFatherSystem = async () => {
      try {
        const obj = {
          parentId: 0,
          type: 1,
        };
        const res = await BenchmarkingManageService.queryAllFatherSystem(obj);
        if (res && res.code === 200 && res.success) {
          manageState.parentForm.parentOptions = res.data ?? [];
          allParentOptions = res.data;
        } else {
          manageState.parentForm.parentOptions = [];
          allParentOptions = [];
        }
      } catch (error) {
        manageState.parentForm.parentOptions = [];
        allParentOptions = [];
      }
    };

    // input框内容改变事件, 下拉框隐藏
    const supplierInput = (val: string) => {
      manageState.parentForm.parentName = val;
      // 校验input框颜色
      const inputFather = <HTMLImageElement>document.querySelector('.inputFather .el-input__inner');
      inputFather.className = 'el-input__inner';
      const list = cloneDeep(allParentOptions);
      if (val) {
        console.log(allParentOptions, val);
        manageState.parentForm.parentOptions = list.filter(item => {
          return item.name?.indexOf(val) !== -1;
        });
      } else {
        manageState.parentForm.parentOptions = list;
      }
    };
    // input框获取焦点 展示下拉框
    const focus = () => {
      supplierOptionsShow.value = true;
      // 当输入框值与下拉框里的值相同时，高光
      nextTick(() => {
        if (manageState.parentForm.parentName !== '') {
          manageState.parentForm.parentOptions.forEach((item: any, i: number) => {
            if (manageState.parentForm.parentName === item.name) {
              const selectItem = <HTMLImageElement>document.querySelector(`.el-form-content-item${i}`);
              selectItem.className = `select-item el-form-content-item${i}  el-form-selectItem`;
            }
          });
        }
      });
      onJiantou();
    };
    // input框获取焦点 隐藏下拉框
    const blur = () => {
      if (showFlag === false) {
        supplierOptionsShow.value = false;
        const inputJianTou = <HTMLImageElement>document.querySelector('.jiantou');
        inputJianTou.className = 'jiantou rotateXia';
      }
    };

    // 下拉框点击事件
    const selectItem = (item: any) => {
      manageState.parentForm.parentName = item.name;
      supplierId.value = item.id;
      supplierOptionsShow.value = false;
      if (manageState.parentForm.parentName === '') {
        supplierOptionsShowTips.value = true;
      }
      showFlag = false;
      const inputJianTou = <HTMLImageElement>document.querySelector('.jiantou');
      inputJianTou.className = 'jiantou rotateXia';
      // 校验input框颜色
      const inputFather = <HTMLImageElement>document.querySelector('.inputFather .el-input__inner');
      inputFather.className = 'el-input__inner';
      supplierOptionsShowTips.value = false;
    };
    // 鼠标经过下拉框事件
    const onMouseoverAsync = (index: number) => {
      const selectMouseover = <HTMLImageElement>document.querySelector(`.el-form-content-item${index}`);
      selectMouseover.style.backgroundColor = 'rgba(230,247,255)';
      showFlag = true;
    };

    // 鼠标移出下拉框事件
    const onMouseoutAsync = (index: number) => {
      const selecttemMouseout = <HTMLImageElement>document.querySelector(`.el-form-content-item${index}`);
      selecttemMouseout.style.backgroundColor = 'rgba(255, 255, 255)';
      showFlag = false;
    };
    // input框箭头点击事件
    const onJiantou = () => {
      supplierOptionsShow.value = true;
      const inputJianTou = <HTMLImageElement>document.querySelector('.jiantou');
      inputJianTou.className = 'jiantou rotateShang';
    };
    /**
     * 父子新增弹窗关闭事件
     */
    const onBeforeClose = () => {
      manageState.fatherDialogVisible = false;
      manageState.sonDialogVisible = false;
      manageState.parentForm.parentName = '';
      supplierOptionsShowTips.value = false;
      manageState.sonForm.archTypeId = 1 || undefined;
      manageState.sonForm.timeType = '2';
      manageState.sonForm.sonName = '';
      manageState.sonForm.benchmarkValue = '';
    };
    //父体系重置
    const onFatherReset = () => {
      manageState.parentForm.parentName = '';
      supplierOptionsShowTips.value = false;
      // 校验input框颜色
      const inputFather = <HTMLImageElement>document.querySelector('.inputFather .el-input__inner');
      inputFather.className = 'el-input__inner';
    };
    //父体系跳转子体系弹窗 下一步
    const onNext = () => {
      if (manageState.parentForm.parentName === '') {
        // 校验input框颜色
        const inputFather = <HTMLImageElement>document.querySelector('.inputFather .el-input__inner');
        inputFather.className = 'el-input__inner redBorder';
        supplierOptionsShowTips.value = true;
      } else {
        let isAdd = true;
        // 判断是新增父体系，还是在已有的父体系下新增子体系
        manageState.parentForm.parentOptions.forEach(item => {
          if (item.name === manageState.parentForm.parentName) {
            return (isAdd = false);
          }
        });
        if (isAdd) {
          // 新增父体系
          addSonSystem();
        } else {
          // 在已有的父体系下新增子体系，直接跳转至子体系弹框,并查询父体系id
          manageState.fatherDialogVisible = false;
          manageState.sonDialogVisible = true;
          queryFatherId();
          queryArchType();
        }
      }
    };
    // 新增父体系
    const addSonSystem = async () => {
      try {
        const obj = {
          name: manageState.parentForm.parentName,
          parentId: 0,
        };
        const res = await BenchmarkingManageService.addFatherSystem(obj);
        if (res && res.code === 200 && res.success) {
          // proxy.$message.success('新增父体系成功');
          manageState.fatherDialogVisible = false;
          // setTimeout(() => {
          manageState.sonDialogVisible = true;
          // }, 300);
          // 查询父体系id
          queryFatherId();
          // 查询指标类型
          queryArchType();
        } else {
          proxy.$message.error(res.message || '新增父体系失败');
        }
      } catch (error) {
        proxy.$message.error('新增父体系失败');
      }
    };
    /**
     * 父体系 end
     */
    /**
     * 子体系 start
     */
    // 查询新增的父体系id
    const queryFatherId = async () => {
      try {
        const res = await BenchmarkingManageService.queryFatherIdByName({
          name: manageState.parentForm.parentName,
        });
        if (res && res.code === 200 && res.success) {
          parentId = res.data.id;
        } else {
          // proxy.$message.error(res.message || '获取父体系失败');
        }
      } catch (error) {
        // proxy.$message.error(error.message || '获取父体系失败');
      }
    };
    // 查询指标类型
    const queryArchType = async () => {
      try {
        const res = await BenchmarkingManageService.queryArchType();
        if (res && res.code === 200 && res.success) {
          archTypeList.value = res.data || [];
        } else {
          // proxy.$message.error(res.message || '获取指标类型失败');
        }
      } catch (error) {
        // proxy.$message.error(error.message || '获取指标类型失败');
      }
    };
    // 指标体系change事件
    const archTypeChange = (val: any) => {
      archTypeList.value.map(item => {
        if (item.id === val) {
          return (unit.value = item.unit);
        }
      });
    };
    //子体系--重置
    const onSonReset = () => {
      manageState.sonForm.sonName = '';
      manageState.sonForm.timeType = '2';
      manageState.sonForm.archTypeId = 1;
      manageState.sonForm.benchmarkValue = '';
      manageSonRef.value.resetFields();
    };
    //子体系--上一步
    const onPrevious = () => {
      manageState.fatherDialogVisible = true;
      manageState.sonDialogVisible = false;
      queryAllFatherSystem();
    };
    //子体系--提交 新增子体系
    const onAddSubmit = () => {
      // if(manageState.sonForm.benchmarkValue === '') {
      //   return
      // }
      // if(Number(manageState.sonForm.benchmarkValue) === 0 ) {
      //   return proxy.$message.error('标杆值需大于0');
      // }
      manageSonRef.value.validate(async (valid: boolean) => {
        if (valid) {
          if (Number(manageState.sonForm.benchmarkValue) === 0) {
            return proxy.$message.error('标杆值需大于0');
          }
          try {
            const obj = {
              archTypeId: manageState.sonForm.archTypeId,
              benchmarkValue: manageState.sonForm.benchmarkValue,
              name: manageState.sonForm.sonName,
              parentId: parentId,
              parentName: manageState.parentForm.parentName,
              timeType: manageState.sonForm.timeType,
            };
            const res = await BenchmarkingManageService.addSonSystem(obj);
            if (res && res.code === 200 && res.success) {
              proxy.$message.success(res.message || '新增子体系成功');
              // 弹框关闭并且初始化弹框，表格刷新
              manageState.sonDialogVisible = false;
              onBeforeClose();
              getBenchManageList();
            } else {
              proxy.$message.error(res.message || '新增子体系失败');
              manageState.sonDialogVisible = true;
            }
          } catch (error) {
            // proxy.$message.error(error.message || '新增子体系失败');
            manageState.sonDialogVisible = true;
          }
        }
      });
    };
    /**
     * 子体系 end
     */
    //编辑
    const onEdit = (item: any) => {
      if (manageState.isEditFlag !== 0) {
        return;
      }
      manageState.isEditFlag = item.id;
      nextTick(() => {
        const input_dom = <HTMLImageElement>document.querySelector(`.edit_input_${item.id} .el-input__inner`);
        if (input_dom !== null) {
          input_dom.focus();
        }
      });
    };

    //编辑保存
    const toSave = async (item: any) => {
      try {
        // 判断输入框的值
        if (item.benchmarkValue === '') {
          manageState.isEditFlag = item.id;
          return proxy.$message.error('请输入标杆值');
        }
        // 判断输入框的值
        if (Number(item.benchmarkValue) === 0) {
          manageState.isEditFlag = item.id;
          return proxy.$message.error('标杆值需大于0');
        }
        manageState.isEditFlag = 0;
        const obj = {
          benchmarkValue: item.benchmarkValue,
          id: item.id,
          name: null,
        };
        const res = await BenchmarkingManageService.updateBenchmarkValue(obj);
        if (res && res.code === 200 && res.success) {
          proxy.$message.success('修改成功');
          getBenchManageList();
        } else {
          proxy.$message.error(res.message || '编辑失败');
        }
      } catch (error) {
        console.log(error);
        // proxy.$message.error(error.message);
      }
    };

    // 删除
    const onDelete = async (id: number) => {
      try {
        const formData = new FormData(); // FormData 对象
        formData.append('id', id.toString());
        const res = await BenchmarkingManageService.deleteStandardSys(formData);
        if (res && res.code === 200 && res.success) {
          proxy.$message.success('删除成功');
          getBenchManageList();
        } else {
          proxy.$message.error(res.message || '删除失败');
        }
      } catch (error) {
        proxy.$message.error('删除失败');
      }
    };
    // 分页
    const onPageChange = (value: number) => {
      manageState.queryParams.pageNum = Math.floor(value);
      getBenchManageList();
    };
    // 分页
    const onPageSizeChange = (value: number) => {
      manageState.queryParams.pageSize = value;
      manageState.queryParams.pageNum = 1;
      getBenchManageList();
    };
    // 查询列表
    const getBenchManageList = async () => {
      try {
        manageState.loading = true;
        const res = await BenchmarkingManageService.getBenchmarkingTabData({
          name: manageState.queryParams.name,
          orders: [
            {
              asc: true,
              column: '',
            },
          ],
          pageNum: manageState.queryParams.pageNum,
          pageSize: manageState.queryParams.pageSize,
          searchCount: true,
        });
        if (res && res.code === 200 && res.success) {
          manageState.dataSource = res.data.list || [];
          manageState.total = res.data.total;
          manageState.loading = false;
        } else {
          manageState.dataSource = [];
          manageState.total = 0;
          manageState.loading = false;
          abnormal.value = false;
        }
      } catch (error) {
        manageState.dataSource = [];
        manageState.total = 0;
        manageState.loading = false;
        abnormal.value = false;
      }
    };
    watch(
      () => manageState.dataSource,
      newVal => {
        if (newVal.length === 0) {
          abnormal.value = false;
        } else {
          abnormal.value = true;
        }
      },
      {
        immediate: true,
      },
    );
    //跳转配置快捷入口配置
    const backBenchmarkingAnalysis = () => {
      router.push('/benchmarkingAnalysis');
    };

    onMounted(async () => {
      await getBenchManageList();
    });

    return {
      ...toRefs(manageState),
      pageSizes,
      rules,
      manageRef,
      manageSonRef,
      timeTypeList,
      archTypeList,
      supplierOptionsShow,
      supplierOptionsShowTips,
      supplierId,
      unit,
      abnormal,
      onSearch,
      onReset,
      onAdddialog,
      onEdit,
      toSave,
      onDelete,
      onPageChange,
      onPageSizeChange,
      thousandSeparation,
      backBenchmarkingAnalysis,
      onFatherReset,
      onNext,
      onSonReset,
      onPrevious,
      onAddSubmit,
      onBeforeClose,
      supplierInput,
      focus,
      blur,
      selectItem,
      onMouseoverAsync,
      onMouseoutAsync,
      archTypeChange,
      onJiantou,
    };
  },
});
