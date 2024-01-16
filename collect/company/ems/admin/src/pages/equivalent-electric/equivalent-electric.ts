import { cloneDeep } from 'lodash';
import { ElForm } from 'element-plus';
import { defineComponent, computed, ref, toRefs, onMounted, reactive } from 'vue';
import EquivalentElectricService from './service/equivalent-electric.service';
import { useCommonController } from '../../utils/use-common-controller';
import { pageSizes } from '../../config/index';

interface equivalentElectricState {
  queryParams: GlobalModule.CommonSearchParams;
  total: number;
  loading: boolean;
  isAddFlag: boolean;
  submitLoading: boolean;
  equivalentElectricForm: EquivalentElectricModule.equivalentElectricForm;
  equivalentElectricFormClone: EquivalentElectricModule.equivalentElectricForm;
  statusValue: string;
  statusOptions: any;
  energyCodeValue: string;
  energyCodeOptions: any;
  dialogVisible: boolean;
  dataSource: EquivalentElectricModule.EquivalentElectricInfo[];
}
export default defineComponent({
  name: 'equivalentElectricEnergyManagement',
  setup() {
    let { proxy } = useCommonController();
    const equivalentElectricState = reactive<equivalentElectricState>({
      queryParams: {
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        searchCount: true,
        pageSize: pageSizes[0],
        pageNum: 1,
      },
      total: 0,
      loading: false,
      isAddFlag: false,
      submitLoading: false,
      equivalentElectricForm: {
        id: 0,
        energyName: '',
        energyCode: '',
        coefficient: null,
        unit: '',
        status: '',
      },
      equivalentElectricFormClone: {
        id: 0,
        energyName: '',
        energyCode: '',
        coefficient: null,
        unit: '',
        status: '',
      },
      energyCodeValue: '',
      energyCodeOptions: [],
      statusValue: '',
      statusOptions: [
        { id: '1', value: '1', label: '是' },
        { id: '0', value: '0', label: '否' },
      ],
      dialogVisible: false,
      dataSource: [],
    });
    let nums = ref<number>(1);
    const equivalentElectricRef = ref(ElForm);
    const rules = {
      energyName: [
        {
          required: true,
          message: '请填写能源类型',
          trigger: ['change', 'blur'],
        },
      ],
      coefficient: [
        {
          required: true,
          message: '请填写折算系数',
          trigger: ['change', 'blur'],
        },
      ],
    };
    /**
     * 查询能耗编码
     */
    const queryEnergyCode = async () => {
      try {
        const res = await EquivalentElectricService.queryEnergyCode();
        if (res && res.code === 200 && res.success) {
          if (res.data) {
            equivalentElectricState.energyCodeOptions = res.data;
            equivalentElectricState.energyCodeOptions.forEach((item: any) => {
              item['CName'] = `${item.name}, ${item.code}`;
            });
          } else {
            equivalentElectricState.dataSource = [];
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询能耗编码数据失败');
          }
        }
      } catch (error) {
        proxy.$message.error('查询能耗编码数据失败');
      }
    };
    /**
     * 查询等效电能源管理表格数据
     */
    const queryInitTabData = async () => {
      equivalentElectricState.loading = true;
      try {
        const res = await EquivalentElectricService.getInitElectricTab(equivalentElectricState.queryParams);
        if (res && res.code === 200 && res.success) {
          equivalentElectricState.dataSource = [];
          if (res.data && res.data.list) {
            equivalentElectricState.dataSource = res?.data?.list ?? [];
            equivalentElectricState.total = res?.data?.total;
          } else {
            equivalentElectricState.dataSource = [];
            equivalentElectricState.total = res?.data?.total ?? 0;
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询数据失败');
          }
          equivalentElectricState.dataSource = [];
          equivalentElectricState.total = 0;
        }
      } catch (error) {
        proxy.$message.error('查询数据失败');
        equivalentElectricState.dataSource = [];
        equivalentElectricState.total = 0;
      } finally {
        equivalentElectricState.loading = false;
      }
    };
    /**
     * 页面pageSize改变
     */
    const onPageSizeChange = (value: number) => {
      equivalentElectricState.queryParams.pageSize = value;
      equivalentElectricState.queryParams.pageNum = 1;
      queryInitTabData();
    };
    /**
     * 分页
     */
    const onCurrentChange = (value: number) => {
      equivalentElectricState.queryParams.pageNum = Math.floor(value);
      queryInitTabData();
    };
    /**
     * 新增--按钮事件
     */
    const onAddDialogShow = async () => {
      equivalentElectricState.isAddFlag = true;
      nums.value++;
      //清空弹窗内容
      equivalentElectricState.equivalentElectricForm.energyName = '';
      equivalentElectricState.equivalentElectricForm.energyCode = '';
      equivalentElectricState.equivalentElectricForm.coefficient = null;
      equivalentElectricState.equivalentElectricForm.unit = '';
      equivalentElectricState.equivalentElectricForm.status = '';
      //参与计算默认选中是
      equivalentElectricState.energyCodeValue =
        equivalentElectricState.energyCodeOptions.length == 0
          ? null
          : equivalentElectricState.energyCodeOptions[0].code;
      equivalentElectricState.statusValue = equivalentElectricState.statusOptions[0].value;
      equivalentElectricState.dialogVisible = true;
    };
    //删除
    const deleteElectric = async (id: number) => {
      proxy
        .$confirm('确认删除该条数据吗?', '删除数据', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(async () => {
          try {
            let formData = new FormData(); // FormData 对象
            formData.append('id', id.toString());
            const res = await EquivalentElectricService.deleteElectric(formData);
            if (res && res.code === 200 && res.success) {
              proxy.$message.success('删除成功');
              queryInitTabData();
            } else {
              console.log(res);
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message || '删除失败');
              }
            }
          } catch (error) {
            console.log(error);
            proxy.$message.error('删除失败');
          }
        });
    };
    //编辑--按钮事件
    const editElectric = (item: EquivalentElectricModule.EquivalentElectricInfo) => {
      equivalentElectricState.equivalentElectricFormClone = cloneDeep(item);
      equivalentElectricState.equivalentElectricForm.id = item.id;
      equivalentElectricState.equivalentElectricForm.energyName = item.energyName;
      equivalentElectricState.energyCodeValue = item.energyCode;
      equivalentElectricState.equivalentElectricForm.coefficient = item.coefficient;
      equivalentElectricState.equivalentElectricForm.unit = item.unit;
      equivalentElectricState.statusValue = item.status;

      equivalentElectricState.isAddFlag = false;
      equivalentElectricState.dialogVisible = true;
    };
    /**
     * 新增、编辑弹窗关闭事件
     */
    const onBeforeClose = () => {
      equivalentElectricState.dialogVisible = false;
      equivalentElectricRef.value.resetFields();
    };
    //重置
    const onReset = () => {
      equivalentElectricState.dialogVisible = false;
    };
    // 表单提交
    const onSubmit = () => {
      equivalentElectricRef.value.validate((valid: boolean) => {
        if (valid) {
          if (equivalentElectricState.isAddFlag) {
            getEquivalentElectricCreate();
          } else {
            getEquivalentElectricUpdate();
          }
        }
      });
    };
    //新增
    const getEquivalentElectricCreate = async () => {
      equivalentElectricState.submitLoading = true;
      try {
        const newData = equivalentElectricState.energyCodeOptions.find((e: any) => {
          return e.code === equivalentElectricState.energyCodeValue;
        });
        const energyCodeName: string = newData.name;
        const obj = {
          energyName: equivalentElectricState.equivalentElectricForm.energyName,
          energyCode: equivalentElectricState.energyCodeValue,
          energyCodeName: energyCodeName,
          coefficient: equivalentElectricState.equivalentElectricForm.coefficient,
          unit: equivalentElectricState.equivalentElectricForm.unit,
          status: equivalentElectricState.statusValue,
        };
        const res = await EquivalentElectricService.addElectric(obj);
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('新增成功');
          equivalentElectricState.submitLoading = false;
          equivalentElectricRef.value.resetFields();
          equivalentElectricState.dialogVisible = false;
          queryInitTabData();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '新增失败');
          }
          equivalentElectricState.submitLoading = false;
        }
      } catch (error) {
        proxy.$message.error('新增失败');
        equivalentElectricState.submitLoading = false;
      }
    };
    // 编辑
    const getEquivalentElectricUpdate = async () => {
      const { id } = equivalentElectricState.equivalentElectricForm;
      equivalentElectricState.submitLoading = true;
      const newData = equivalentElectricState.energyCodeOptions.find((e: any) => {
        return e.code === equivalentElectricState.energyCodeValue;
      });
      const energyCodeName: string = newData.name;
      try {
        const obj = {
          id,
          energyName: equivalentElectricState.equivalentElectricForm.energyName,
          energyCode: equivalentElectricState.energyCodeValue,
          energyCodeName: energyCodeName,
          coefficient: equivalentElectricState.equivalentElectricForm.coefficient,
          unit: equivalentElectricState.equivalentElectricForm.unit,
          status: equivalentElectricState.statusValue,
        };
        const res = await EquivalentElectricService.editElectric(obj);
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('修改成功');
          equivalentElectricState.submitLoading = false;
          equivalentElectricRef.value.resetFields();
          equivalentElectricState.dialogVisible = false;
          queryInitTabData();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '修改失败');
          }
          equivalentElectricState.submitLoading = false;
        }
      } catch (error) {
        proxy.$message.error('修改失败');
        equivalentElectricState.submitLoading = false;
      }
    };

    onMounted(async () => {
      queryInitTabData();
      queryEnergyCode();
    });

    return {
      ...toRefs(equivalentElectricState),
      pageSizes,
      equivalentElectricRef,
      rules,
      nums,

      onAddDialogShow,
      editElectric,
      deleteElectric,

      onBeforeClose,
      onPageSizeChange,
      onCurrentChange,
      onReset,
      onSubmit,
    };
  },
});
