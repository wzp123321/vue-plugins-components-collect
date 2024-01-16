import { defineComponent, ref, PropType, computed, inject, onMounted } from 'vue';
// service
import groupRankedService from '@/pages/group-ranked/service/group-ranked.service';
// components
import TreeCheck from '../../../relation-analysis/ra-timetable-manage/components/ra-tree-check/ra-tree-check.vue';
// utils
import useCurrentInstance from '@/utils/use-current-instance';

export default defineComponent({
  props: {
    // 是否为新增
    isAddFlag: {
      type: Boolean,
      default: true,
    },
    groupDetail: {
      type: Object as PropType<GroupRankedModule.GroupRankedInfo>,
      default: {},
    },
    dialogOpen: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    TreeCheck,
  },
  inject: ['success'],
  emits: ['success'],
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    // 提交
    const onSuccess: any = inject('success');
    // 开关
    const dialogFormVisible = ref(props.dialogOpen);
    // 表单
    const pageForm = ref<GroupRankedModule.GroupRankedInfo>({
      name: '',
      energyCode: '',
      energyName: props.groupDetail.energyName,
      id: -1,
    });
    pageForm.value.name = props.groupDetail.name;
    pageForm.value.energyCode = props.groupDetail.energyCode;
    pageForm.value.energyName = props.groupDetail.energyName;
    pageForm.value.id = props.groupDetail.id;
    // 树类型
    const treeType = ref(1);
    // 选中树节点
    const treeIdList = ref<number[]>([]);
    const loading = ref<boolean>(false);
    // 表格
    const dataSource = ref<{ treeId: number; name: string; groupTreeId: number }[]>([]);
    // 是否为新增
    const isAddFlag = computed(() => {
      return props.isAddFlag;
    });
    // 获取树选中数据和列表数据
    const getSelectTreeTableList = async () => {
      const params = {
        groupId: props.groupDetail.id,
      };
      loading.value = true;
      try {
        const res = await groupRankedService.getAbnormalGroupTreeList(params);
        if (res.code == 200 && res.success) {
          if (res.data && res.data.length) {
            dataSource.value = res.data;
            loading.value = false;
            treeIdList.value = dataSource.value.map((item) => {
              return item.treeId;
            });
          } else {
            dataSource.value = [];
            treeIdList.value = [];
            loading.value = false;
          }
        } else {
          dataSource.value = [];
          loading.value = false;
          treeIdList.value = [];
          proxy.$message.error(res.message || '查询数据失败');
        }
      } catch (error) {
        treeIdList.value = [];
        dataSource.value = [];
        loading.value = false;
        proxy.$message.error('查询数据失败');
      }
    };
    // 提交
    const onSubmit = async () => {
      const { name, energyCode, id } = pageForm.value;
      const params = {
        name,
        energyCode,
        treeIdList: treeIdList.value,
      };
      const updateParams = {
        ...params,
        id,
      };
      try {
        const res = props.isAddFlag
          ? await groupRankedService.getAbnormalGroupAdd(params)
          : await groupRankedService.getAbnormalGroupUpdate(updateParams);
        if (res.code == 200 && res.success) {
          proxy.$message.success(res.message);
          dialogFormVisible.value = false;
          treeIdList.value = [];
          dataSource.value = [];
          emit('success');
          onSuccess();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '操作失败');
          }
        }
      } catch (error) {
        proxy.$message.error('操作失败');
      }
    };
    // 删除事件
    const onEnergyCodeDelete = async (id: number, treeId: number) => {
      const res = await groupRankedService.getGroupTreeDelete({
        id,
      });
      if (res.code == 200 && res.success) {
        proxy.$message.success(res.message);
        treeIdList.value = treeIdList.value.filter((item) => {
          return item !== treeId;
        });
        getSelectTreeTableList();
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          proxy.$message.error(res.message);
        }
      }
    };
    // 关闭前
    const onBeforeClose = () => {
      dialogFormVisible.value = false;
      treeIdList.value = [];
      dataSource.value = [];
    };
    onMounted(async () => {
      await getSelectTreeTableList();
    });
    return {
      isAddFlag,
      dialogFormVisible,
      pageForm,
      treeType,
      dataSource,
      treeIdList,
      loading,
      onSubmit,
      onEnergyCodeDelete,
      onBeforeClose,
    };
  },
});
