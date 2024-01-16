import { defineComponent, ref, computed, PropType } from 'vue';
import { ElForm, ElMessageBox } from 'element-plus';
import { cloneDeep } from 'lodash';
import message from '../../../utils/message';
import treeManageService from '@/pages/tree-manage/service/tree-manage.service';
import {
  TM_ITreeManageForm,
  TM_ITreeManageVO,
  TM_ICodeName,
  TM_NODE_TYPES,
  TM_TREE_TYPE,
  TM_DefaultProps,
  TM_NodeKey,
  TM_ELEAFTYPES,
  TM_FormItem,
  TM_AddNode,
} from '../tree-manage.api';
import { customPrefix, customClose } from '../../../config/index';

export default defineComponent({
  name: 'TreeManageAdd',
  props: {
    dialogAddParentData: {
      type: Object as PropType<TM_ITreeManageForm>,
      default: null,
    },
    treeTypeData: {
      type: Array as PropType<TM_ICodeName[]>,
      default: [],
    },
    // 是否是新增下级
    isAddChildrenFlag: {
      type: Boolean,
      default: false,
    },
    // 节点类型
    nodeTypeDataList: {
      type: Array as PropType<TM_ICodeName[]>,
      default: [],
    },
    // 是否展示buttonbar新增按钮 false-无数据时新增  true-新增子节点
    emptyFlag: {
      type: Boolean,
      default: false,
    },
    // 当前树类型
    searchedTreeType: {
      type: String,
      default: '',
    },
  },
  emits: ['addSuccess', 'refreshState'],
  setup(props, { emit }) {
    const formAdd = ref(ElForm);
    const visible = ref<boolean>(false);
    const parentData: any = ref(props.dialogAddParentData);
    const parentNodeType = ref('');
    let formRefList: any[] = [];
    const dialogWidth = ref('960px');
    // 是否是新增顶级节点
    const emptyFlag = computed(() => {
      return props.emptyFlag;
    });
    // loading
    const loading = ref<boolean>(false);
    // 树类型
    const treeTypeData = computed(() => {
      return props.treeTypeData;
    });
    // 是否是新增下级节点
    const isAddChildrenFlag = computed(() => {
      return props.isAddChildrenFlag;
    });
    const submitting = ref<boolean>(false);
    /**
     * 顶级节点时才展示医院类型
     */
    const nodeTypeList = ref<TM_ICodeName[]>([]);
    // 表单
    const addForm = ref<TM_AddNode>({
      parentId: '',
      treeLeaf: '0',
      treeType: '1',
      nodeList: [
        {
          treeName: '',
          nodeType: '',
          treeSort: '',
        },
      ],
    });
    const rules = {
      treeName: [
        { required: true, message: '请输入节点名称', trigger: 'blur' },
        { max: 20, message: '最多20个字', trigger: 'blur' },
      ],
      treeSort: [{ required: true, message: '请输入本级排序号', trigger: 'blur' }],
      treeType: [
        {
          required: true,
          message: '请选择树类型',
          trigger: ['blur', 'change'],
        },
      ],
    };
    const mapNodeType = () => {
      return String(addForm.value.treeType) !== TM_TREE_TYPE.科室树 && visible.value;
    };
    /**
     * 打开弹框
     * @param item
     */
    const handleShow = (item: TM_ITreeManageVO) => {
      treeManageService
        .getParentType({ parentId: item?.id, treeType: item?.treeType, nodeList: [] })
        .then((res) => {
          parentNodeType.value = res.data?.nodeType;
          addForm.value.nodeList[0].treeSort = String(res.data?.initSort ?? 1);
          addForm.value.nodeList[0].treeName = '';
          addForm.value.nodeList[0].nodeType = '';

          visible.value = true;
          // parentNodeType.value = item?.nodeType;
          addForm.value.parentId = item?.id;
          addForm.value.treeType = !props.isAddChildrenFlag ? props.searchedTreeType : item?.treeType;
          addForm.value.treeLeaf = item?.treeLeaf;
          if (String(addForm.value.treeType) === TM_TREE_TYPE.科室树) {
            dialogWidth.value = '625px';
          } else if (!props.isAddChildrenFlag) {
            dialogWidth.value = '735px';
          } else {
            dialogWidth.value = '960px';
          }
          initNodeType();
        })
        .catch((error) => {
          console.log(error);
        });
    };
    /**
     * 生成节点类型
     * 如果是新增顶级节点，则默认选择节点类型选择医院且禁用 如果不是则将医院过滤掉
     */
    const initNodeType = () => {
      const dataList = cloneDeep(props.nodeTypeDataList);
      dataList.shift();
      if (!emptyFlag.value) {
        nodeTypeList.value = dataList?.filter((item: any) => {
          return item?.code !== TM_NODE_TYPES.医院 || item?.name !== '医院';
        });
      } else {
        addForm.value.nodeList = [
          {
            treeName: '',
            nodeType: TM_NODE_TYPES.医院,
            treeSort: '',
          },
        ];
        nodeTypeList.value = dataList;
      }
    };
    /**
     * 关闭
     */
    const handleClose = () => {
      visible.value = false;

      addForm.value.parentId = '';
      addForm.value.treeType = '';
      addForm.value.nodeList = [
        {
          treeName: '',
          nodeType: '',
          treeSort: '',
        },
      ];
    };

    const formRef = (el: any) => {
      formRefList.push(el);
    };
    /**
     * 弹窗新增
     */
    const handleSubmit = () => {
      let validateTag = true;
      formRefList.forEach((item) => {
        item?.validate((valid: boolean) => {
          if (!valid) {
            validateTag = false;
          }
        });
      });

      if (validateTag) {
        if (addForm.value.treeType === TM_TREE_TYPE.科室树 && addForm.value.treeLeaf === TM_ELEAFTYPES.是叶子节点) {
          checkNodeRelation().then((res) => {
            if (res) {
              ElMessageBox.confirm(
                '该节点已绑定对应空间节点，新增下级科室会导致绑定关系自动解除、对应的指标数据被清除，请确认是否新增？',
                '新增确认',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  showClose: false,
                  closeOnClickModal: false,
                  type: 'warning',
                },
              )
                .then((confirmRes) => {
                  if (confirmRes === 'confirm') {
                    addTreeData(res);
                  }
                })
                .catch(() => {});
            } else {
              addTreeData();
            }
          });
        } else {
          addTreeData();
        }
      }
    };
    /**
     * 校验科室末级节点是否有关联关系
     * @returns
     */
    const checkNodeRelation = (): Promise<boolean> => {
      return new Promise(async (resolve) => {
        try {
          const res = await treeManageService.checkDepartmentRelExist(addForm.value.parentId);
          if (res?.success) {
            resolve(res?.data);
          } else {
            resolve(false);
          }
        } catch (error) {
          resolve(false);
        }
      });
    };
    /**
     * 新增树
     */
    const addTreeData = (relDelete: boolean = false) => {
      if (submitting.value) {
        return;
      }
      submitting.value = true;
      try {
        let params: TM_AddNode = {
          parentId: !props.isAddChildrenFlag ? '0' : addForm.value.parentId + '',
          treeType: addForm.value.treeType,
          nodeList: addForm.value.nodeList,
          relDelete,
        };
        treeManageService
          .addMultiTree(params)
          .then((res: any) => {
            if (res && res.success && res.code == 200) {
              message.success((res && res.message) || '操作成功');
              emit('addSuccess');
              visible.value = false;
              // formAdd.value.resetFields();
              if (!props.isAddChildrenFlag) {
                emit('refreshState');
              }
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                message.error((res && res.message) || '操作失败');
              }
            }
          })
          .catch((error: Error) => {
            message.error('操作失败');
          })
          .finally(() => {
            submitting.value = false;
          });
      } catch (error) {
        console.warn(error);
      }
    };

    function selectNodeType(selectType: string, formItem: TM_FormItem, isDisabled: boolean) {
      if (isDisabled) {
        return;
      }
      if (selectType === formItem.nodeType) {
        formItem.nodeType = '';
      } else {
        formItem.nodeType = selectType;
      }
    }
    function addNewNode() {
      formRefList = [];
      const lastItem = addForm.value.nodeList.at(-1);
      const newItem = {
        treeName: '',
        nodeType: '',
        treeSort: String(Number(lastItem?.treeSort ?? 0) + 1),
      };
      addForm.value.nodeList.push(newItem);
    }

    function deleteForm(index: number) {
      formRefList = [];
      addForm.value.nodeList.splice(index, 1);
    }
    return {
      visible,
      dialogWidth,
      parentData,
      formAdd,
      treeTypeData,
      addForm,
      rules,
      nodeTypeList,
      loading,
      emptyFlag,
      isAddChildrenFlag,
      TM_NODE_TYPES,
      TM_TREE_TYPE,
      TM_DefaultProps,
      TM_NodeKey,
      customPrefix,
      customClose,
      parentNodeType,

      handleShow,
      handleClose,
      handleSubmit,
      mapNodeType,
      selectNodeType,
      addNewNode,
      deleteForm,
      formRef,
    };
  },
});
