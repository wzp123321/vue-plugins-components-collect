import { cloneDeep } from 'lodash';
import { defineComponent, onMounted, reactive, ref, PropType, watch, toRefs, computed } from 'vue';
// services
import timeTableService from '../service/ra-timetable-manage.service';
// components
import { ElDialog, ElMessageBox } from 'element-plus';
import AddUpdateDialog from './ra-st-add-update-dialog/ra-st-add-update-dialog.vue';
// config
import { pageSizes } from '@/config/index';
// utils
import { formatDate } from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';

interface SpecialState {
  loading: boolean;
  queryForm: TimeTableModule.SpecialQueryForm;
  total: number;
  dataSource: TimeTableModule.SpecialTimeTableInfo[];
  specialDataDetail: TimeTableModule.SpecialTimeTableInfo;
  isAddFlag: boolean;
  storeDataSource: TimeTableModule.SpecialTimeTableInfo[];
  storeTotal: number;
}

export default defineComponent({
  components: {
    AddUpdateDialog,
  },
  props: {
    // 树节点
    treeId: {
      type: Array as PropType<number[]>,
      default: [],
    },
    // 编辑状态
    isSettingFlag: {
      type: Boolean,
      default: false,
    },
    settingTreeList: {
      type: Array as PropType<number[]>,
      default: [],
    },
  },
  emits: ['onSaveSuccess'],
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    const specialState = reactive<SpecialState>({
      loading: false,
      queryForm: {
        pageNum: 1,
        pageSize: pageSizes[0],
        searchCount: true,
        treeId: props.treeId[0],
        startDate: '',
        endDate: '',
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
      },
      total: 0,
      dataSource: [],
      specialDataDetail: {
        afternoonEnd: new Date(),
        afternoonStart: new Date(),
        date: '',
        id: 0,
        morningEnd: new Date(),
        morningStart: new Date(),
        nightEnd: new Date(),
        nightStart: new Date(),
        remark: '',
        treeId: 0,
      },
      isAddFlag: true,
      storeDataSource: [],
      storeTotal: 0,
    });
    // 编辑状态
    const isSettingFlag = computed(() => {
      return props.isSettingFlag;
    });
    // 选中的节点
    const settingTreeList = computed(() => {
      return props.settingTreeList;
    });
    // 日期
    const date = ref<Date[]>([]);
    // ref
    const operateDialogRef = ref(ElDialog);
    // 获取数据
    const querySpecialTimeTableList = async () => {
      try {
        const { treeId } = props;
        if (treeId.length === 0) {
          return;
        }
        const { pageNum, pageSize, orders, searchCount } = specialState.queryForm;
        const startDate = date.value && date.value.length === 2 ? formatDate(date.value[0], 'yyyy-MM-dd') : '';
        const endDate = date.value && date.value.length === 2 ? formatDate(date.value[1], 'yyyy-MM-dd') : '';
        const params = {
          pageNum,
          pageSize,
          orders,
          searchCount,
          startDate,
          endDate,
          treeId: treeId[0],
        };
        specialState.loading = true;
        const res = await timeTableService.getSpecialTimeTableList(params);
        if (res.code == 200 && res.success) {
          specialState.dataSource = res?.data?.list ?? [];
          specialState.total = res?.data?.total ?? 0;
          specialState.loading = false;
        } else {
          specialState.dataSource = [];
          specialState.total = 0;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询数据失败');
          }
        }
      } catch (error) {
        specialState.dataSource = [];
        specialState.total = 0;
        proxy.$message.error('查询数据失败');
      } finally {
        specialState.loading = false;
      }
    };
    //头部查询
    const onSearch = () => {
      querySpecialTimeTableList();
    };
    // 新增 编辑成功
    const saveSuccess = () => {
      specialState.queryForm.pageNum = 1;
      specialState.queryForm.pageSize = pageSizes[0];
      emit('onSaveSuccess');
    };
    // 重置
    const onReset = () => {
      specialState.queryForm.pageNum = 1;
      specialState.queryForm.pageSize = pageSizes[0];
      date.value = [];
      querySpecialTimeTableList();
    };
    // 新增按钮事件
    const onAddDialogShow = () => {
      specialState.isAddFlag = true;
      operateDialogRef.value.show(specialState.specialDataDetail, specialState.isAddFlag);
    };
    // 修改按钮事件
    const onEnergyCodeUpdate = (value: TimeTableModule.SpecialTimeTableInfo) => {
      specialState.specialDataDetail = value;
      specialState.isAddFlag = false;
      operateDialogRef.value.show(specialState.specialDataDetail, specialState.isAddFlag);
    };
    // 删除按钮事件
    const onEnergyCodeDelete = async (id: number) => {
      ElMessageBox.confirm('确认删除该条作息时间?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            const res = await timeTableService.getSpecialTimeTableDelete(id);
            if (res.code == 200 && res.success) {
              proxy.$message.success(res.message);
              querySpecialTimeTableList();
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message || '删除失败');
              }
            }
          } catch (error) {
            proxy.$message.error('删除失败');
          }
        })
        .catch(() => {});
    };
    const onPageSizeChange = (value: number) => {
      specialState.queryForm.pageSize = value;
      specialState.queryForm.pageNum = 1;
      querySpecialTimeTableList();
    };
    const onCurrentChange = (value: number) => {
      specialState.queryForm.pageNum = value;
      querySpecialTimeTableList();
    };
    // 取消编辑
    const cancel = () => {
      specialState.dataSource = cloneDeep(specialState.storeDataSource);
      specialState.total = cloneDeep(specialState.storeTotal);
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      querySpecialTimeTableList();
    });
    /**
     * 监听节点变化
     */
    watch(
      () => props.treeId,
      (newVal) => {
        if (newVal && newVal.length) {
          specialState.specialDataDetail.treeId = props.treeId[0];
          querySpecialTimeTableList();
        }
      },
    );
    /**
     * 监听是否编辑
     */
    watch(
      () => props.isSettingFlag,
      (newVal) => {
        if (newVal) {
          specialState.storeDataSource = cloneDeep(specialState.dataSource);
          specialState.storeTotal = cloneDeep(specialState.total);
          specialState.dataSource = [];
          specialState.total = 0;
        }
      },
    );

    return {
      ...toRefs(specialState),
      date,
      pageSizes,
      operateDialogRef,
      isSettingFlag,
      settingTreeList,
      onEnergyCodeUpdate,
      onSearch,
      saveSuccess,
      onAddDialogShow,
      onPageSizeChange,
      onCurrentChange,
      onEnergyCodeDelete,
      cancel,
      onReset,
    };
  },
});
