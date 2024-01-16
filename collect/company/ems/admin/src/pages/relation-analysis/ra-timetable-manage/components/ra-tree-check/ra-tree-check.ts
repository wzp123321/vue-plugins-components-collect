import { getTreeExpandKeys } from '@/utils/index';
import { defineComponent, PropType, nextTick, computed, watch, ref, unref } from 'vue';
import { cloneDeep, dropRight } from 'lodash';
import { treeTypeList } from '@/config/index';
import { useCommonController } from '@/utils/use-common-controller';

import useCurrentInstance from '@/utils/use-current-instance';

const defaultProps = {
  label: 'treeName',
  disabled: '',
  children: 'childTree',
};

export default defineComponent({
  name: 'TreeCheck',
  props: {
    checkedKeys: {
      type: Array as PropType<Number[]>,
      default: [],
    },
    treeType: {
      type: Number,
      default: -1,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
      default: 10,
    },
    hasTypeFlag: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:treeType', 'update:checkedKeys'],
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    const { getTreeWidthoutLocationList, treeType } = useCommonController();
    // 树列表
    const treeList = ref<TreeManageModule.TreeDetail[]>([]);
    // loading
    const loading = ref(false);
    // tree
    const treeRef = ref(null);
    // 是否多选
    const multiple = computed(() => {
      return props.multiple;
    });
    // 是否有类型
    const hasTypeFlag = computed(() => {
      return props.hasTypeFlag;
    });
    // 选中节点
    const checkedIds = ref<number[]>([]);
    const expandedKeys = ref<number[]>([]);
    // 切换类型
    const onTreeTypeChange = async (value: number) => {
      treeType.value = value;
      emit('update:treeType', value);
    };
    // 选中
    const onTreeCheck = (data: any, tree: any) => {
      if (!props.multiple) {
        return;
      }
      const { checkedKeys } = tree;
      if (props.limit !== 0 && checkedKeys.length > props.limit) {
        proxy.$message.warning(`不能选择超过${props.limit}个节点`);
        let selectNow = cloneDeep(checkedKeys);
        selectNow = dropRight(selectNow, 1);
        emit('update:checkedKeys', selectNow);
        return;
      }
      checkedIds.value = checkedKeys;
      emit('update:checkedKeys', checkedKeys);
    };
    // 节点点击
    const onNodeClick = (data: TreeManageModule.TreeDetail) => {
      if (props.multiple) {
        return;
      }
      checkedIds.value = [Number(data.id)];
      emit('update:checkedKeys', [data.id]);
    };
    // 监听
    watch(
      () => props.treeType,
      async () => {
        loading.value = true;
        treeList.value = await getTreeWidthoutLocationList();
        expandedKeys.value = getTreeExpandKeys(treeList.value, 'id', 'childTree');

        loading.value = false;
        nextTick(() => {
          const tree = unref(treeRef.value);
          if (!tree) {
            return;
          }
          if (props.multiple) {
            (tree as any).setCheckedKeys(props.checkedKeys && props.checkedKeys.length ? props.checkedKeys : []);
          } else {
            (tree as any).setCurrentKey(props.checkedKeys.length ? props.checkedKeys[0] || null : null, false);
          }
        });
      },
      {
        immediate: true,
      },
    );
    watch(
      () => props.checkedKeys,
      async (newVal) => {
        nextTick(() => {
          const tree = unref(treeRef.value);
          if (!tree) {
            return;
          }
          if (props.multiple) {
            (tree as any).setCheckedKeys(newVal || []);
          } else {
            (tree as any).setCurrentKey(newVal.length ? newVal[0] : null, false);
          }
        });
      },
    );

    return {
      treeList,
      expandedKeys,
      treeTypeList,
      treeType,
      defaultProps,
      loading,
      treeRef,
      multiple,
      hasTypeFlag,
      onTreeCheck,
      onNodeClick,
      onTreeTypeChange,
    };
  },
});
