import { defineComponent, ref, onMounted, nextTick, computed, onUnmounted } from 'vue';
// utils
import { useCommonController } from '@/utils/use-common-controller';
// components
import WeekTimeTable from './ra-week-timetable/ra-week-timetable.vue';
import SpecialTimeTable from './ra-special-timetable/ra-special-timetable.vue';
import { ElDivider, ElTree } from 'element-plus';
import { getTreeExpandKeys } from '@/utils/index';

const defaultProps = {
  label: 'treeName',
  disabled: '',
  children: 'childTree',
};

export default defineComponent({
  name: 'TimeTableManage',
  components: {
    WeekTimeTable,
    SpecialTimeTable,
    'el-divider': ElDivider,
  },
  setup() {
    const { getTreeWidthoutLocationList } = useCommonController();
    // 页面容器宽度
    const containerWidth = ref('');
    // tree
    const treeRef = ref(ElTree);
    // 树列表
    const treeList = ref<TreeManageModule.TreeDetail[]>([]);
    // 树loading
    const treeLoading = ref(true);
    // 节点id
    const treeId = ref<number[]>([]);
    // 树节点展开
    const expandedKeys = ref<number[]>([]);
    // 查询节点id
    const queryTreeId = ref<number[]>([]);
    // 配置树节点列表
    const settingTreeList = ref<number[]>([]);
    // 是否处于保存状态
    const isSettingFlag = ref(false);
    // 当前模块  week  special
    const activeTab = ref('week');
    // 周作息
    const weekRef = ref(null);
    // 特殊作息
    const specialRef = ref(null);
    // 模块切换
    const onTabChange = () => {
      isSettingFlag.value = false;
    };
    // 是否配置
    const onSettingFlagChange = () => {
      isSettingFlag.value = !isSettingFlag.value;
      settingTreeList.value = queryTreeId.value;
      treeId.value = queryTreeId.value;
      if (isSettingFlag.value) {
        treeRef.value.setCheckedKeys(settingTreeList.value);
      } else {
        treeRef.value.setCurrentKey(queryTreeId.value[0], false);
        if (activeTab.value === 'week') {
          (weekRef.value as any).cancel();
        } else {
          (specialRef.value as any).cancel();
        }
      }
    };
    // 选中
    const onTreeCheck = (data: any, tree: any) => {
      if (!isSettingFlag.value) {
        return;
      }
      const { checkedKeys } = tree;
      treeId.value = checkedKeys;
      settingTreeList.value = checkedKeys;
    };
    // 节点点击
    const onNodeClick = (data: TreeManageModule.TreeDetail) => {
      if (isSettingFlag.value) {
        nextTick(() => {
          treeRef.value.setCurrentKey(treeId.value[0], false);
        });
        return;
      }
      settingTreeList.value = [Number(data.id)];
      treeId.value = [Number(data.id)];
      queryTreeId.value = treeId.value;
    };
    // 子组件保存成功 或 新增成功
    const onSaveSuccess = () => {
      isSettingFlag.value = false;
      treeId.value = [settingTreeList.value[0]];
      queryTreeId.value = [settingTreeList.value[0]];
      nextTick(() => {
        treeRef.value.setCurrentKey(treeId.value[0], false);
      });
    };
    // 获取父容器高度
    const getContainerHeight = () => {
      containerWidth.value = document.querySelector('.el-container.flex.flex-column')
        ? `${document.querySelector('.el-container.flex.flex-column')?.scrollHeight}px`
        : '100%';
    };
    // 初始化
    onMounted(async () => {
      try {
        treeLoading.value = true;
        treeList.value = await getTreeWidthoutLocationList();
        expandedKeys.value = getTreeExpandKeys(treeList.value, 'id', 'childTree');

        treeLoading.value = false;
        if (treeList.value && treeList.value.length) {
          treeId.value = [Number(treeList.value[0].id)];
          queryTreeId.value = [Number(treeList.value[0].id)];
          settingTreeList.value = [Number(treeList.value[0].id)];
          nextTick(() => {
            getContainerHeight();
            treeRef.value.setCurrentKey(treeId.value[0], false);
          });
        }
        window.addEventListener('resize', getContainerHeight);
      } catch (error) {
        treeLoading.value = false;
      } finally {
        treeLoading.value = false;
      }
    });
    /**
     * 组件销毁
     */
    onUnmounted(() => {
      window.removeEventListener('resize', getContainerHeight);
    });
    return {
      treeRef,
      isSettingFlag,
      treeId,
      queryTreeId,
      settingTreeList,
      treeList,
      defaultProps,
      activeTab,
      weekRef,
      specialRef,
      containerWidth,
      treeLoading,
      expandedKeys,

      onTreeCheck,
      onNodeClick,
      onSettingFlagChange,
      onTabChange,
      onSaveSuccess,
    };
  },
});
