import { defineComponent, ref, onMounted, nextTick } from 'vue';
import { flatten, formatEmptyValue, getTreeExpandKeys, getTreeExpandKeysLevel } from '@/utils/index';
import { FUploadHandler, verifyUpload } from '../../utils/token';
import { cloneDeep } from 'lodash';
import message from '@/utils/message';

import commonService from '@/services/common/common';
import TreeManageService from '@/pages/tree-manage/service/tree-manage.service';
import {
  TM_ITreeManageVO,
  TM_ICodeName,
  TM_ISearchTreeParams,
  TM_TREE_TYPE,
  TM_NODE_TYPES,
  TM_ELEAFTYPES,
} from './tree-manage.api';
import { EXCEL_ACCEPT_EXTENSIONS, MAXIMUN_SIZE, MAXIMUN_TOTAL_SIZE } from '../../services/common/common-api';

import TreeManageAdd from './tm-tree-add-dialog/tm-tree-add-dialog.vue';
import TreeManageEdit from './tm-tree-edit-dialog/tm-tree-edit-dialog.vue';
import { ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'TreeManageList',
  components: {
    TreeManageAdd,
    TreeManageEdit,
  },
  setup() {
    const treeTypeData = ref<TM_ICodeName[]>([]); // 树类型列表
    const editTreeRef = ref(TreeManageEdit);
    const addTreeRef = ref(TreeManageEdit);
    const isAddChildrenFlag = ref<boolean>(false); // 是否是新增下级
    const emptyFlag = ref(); // 是否显示新增按钮
    const tableTreeNameWidth = ref(180); // 表格节点名称最小宽度
    const tableMaxWidth = ref(180);
    // 顶部查询参数
    const formSearch = ref<TM_ISearchTreeParams>({
      keyword: '',
      treeType: '',
      nodeType: '',
    }); // 查询搜索关键字
    const nodeTypeData = ref<TM_ICodeName[]>([]); // 节点类型
    const tableData = ref<TM_ITreeManageVO[]>([]); // 数据源
    const searchedTreeType = ref<string>('1'); // 已进行查询的树类型，用于传给新增弹框

    const loading = ref(true); // 列表加载loading
    const isUploading = ref<boolean>(false); // 上传loading
    const isDownloading = ref(false); // 下载loading

    const expandedKeys = ref<string[]>([]);
    // 默认全部展开--带关键字搜索或者节点类型不为全部
    const expandAll = ref(false);
    const tableRef = ref();
    const loadMap = new Map();

    /**
     * 初始化
     */
    onMounted(async () => {
      await initDictionaryData();
      await getTreeListData();
      if (formSearch.value.keyword === '' && formSearch.value.nodeType === TM_NODE_TYPES.全部) {
        expandAll.value = false;
        expandedKeys.value = getTreeExpandKeysLevel(tableData.value, 'id', 'childTree', 3)?.map((item) => {
          return String(item);
        });
      } else {
        expandAll.value = true;
      }
      await checkEmpty();
    });

    /**
     * 初始化查询字典数据
     */
    const initDictionaryData = async () => {
      try {
        const promiseArr = [
          commonService.getEmsDictionaryData('tree_type'),
          commonService.getDictionaryData('node_type'),
        ];
        const resArr = await Promise.all(promiseArr);
        // 树类型
        if (resArr?.length) {
          if (resArr?.[0].code == 200 && resArr?.[0].success) {
            treeTypeData.value = resArr?.[0].data?.map((item: any) => {
              return {
                name: item.name,
                code: String(item.code),
              };
            });
            formSearch.value.treeType = treeTypeData.value?.[0].code ?? '';
            searchedTreeType.value = treeTypeData.value?.[0].code ?? '';
          } else {
            treeTypeData.value = [];
            formSearch.value.treeType = '';
            searchedTreeType.value = '';
          }

          // 节点类型
          if (resArr?.[1].code == 200 && resArr?.[1].success) {
            nodeTypeData.value = resArr?.[1].data ?? [];
            if (resArr?.[1].data && resArr?.[1]?.data) {
              formSearch.value.nodeType = resArr?.[1]?.data?.[0]?.code ?? '';
            }
          } else {
            nodeTypeData.value = [];
            formSearch.value.nodeType = '';
          }
        }
      } catch (error) {
        treeTypeData.value = [];
        formSearch.value.treeType = '';
        searchedTreeType.value = '';

        nodeTypeData.value = [];
        formSearch.value.nodeType = '';
        console.warn('treemanage---初始dictionary-error', error);
      }
    };
    /**
     * 切换树类型
     * @param value
     */
    const handleTreeTypeChange = (value: string) => {
      if (value === TM_TREE_TYPE.科室树) {
        formSearch.value.nodeType = nodeTypeData.value?.[0].code;
      }
    };
    // 提交
    const onSubmit = async () => {
      checkEmpty();
      await getTreeListData();
      if (formSearch.value.keyword === '' && formSearch.value.nodeType === TM_NODE_TYPES.全部) {
        expandAll.value = false;
        expandedKeys.value = getTreeExpandKeysLevel(tableData.value, 'id', 'childTree', 3)?.map((item) => {
          return String(item);
        });
      } else {
        expandAll.value = true;
      }
    };
    /**
     * 重置
     */
    const onReset = async () => {
      formSearch.value.keyword = '';
      formSearch.value.treeType = treeTypeData.value[0].code;
      searchedTreeType.value = treeTypeData.value[0].code;
      formSearch.value.nodeType = (nodeTypeData.value[0] && nodeTypeData.value[0].code) || '';
      checkEmpty();
      expandAll.value = false;
      expandedKeys.value = [];

      await getTreeListData();

      if (formSearch.value.keyword === '' && formSearch.value.nodeType === TM_NODE_TYPES.全部) {
        expandAll.value = false;
        expandedKeys.value = getTreeExpandKeysLevel(tableData.value, 'id', 'childTree', 3)?.map((item) => {
          return String(item);
        });
      } else {
        expandAll.value = true;
      }
    };
    /**
     * 查询是否存在树来控制按钮显示隐藏
     */
    const checkEmpty = async () => {
      try {
        const res = await TreeManageService.checkTreeIsEmpty(formSearch.value.treeType);
        if (res.code == 200 && res.success) {
          emptyFlag.value = !res.data;
        } else {
          emptyFlag.value = false;
        }
      } catch (error) {
        emptyFlag.value = false;
      }
    };
    /**
     * 获取列表数据
     */
    const getTreeListData = async () => {
      tableTreeNameWidth.value = 180;
      tableMaxWidth.value = 180;
      loading.value = true;
      const params = {
        keyword: formSearch.value.keyword,
        treeType: formSearch.value.treeType,
        nodeType: String(formSearch.value.nodeType),
        parentId: null,
      };
      try {
        const lastScrollTop = document.querySelector('#table-container')?.scrollTop ?? 0;
        let treeList: Promise<HttpRequestModule.ResTemplate<TM_ITreeManageVO[]>>;
        treeList = TreeManageService.getTreeList(params);
        const res = await treeList;
        if (res && res.code == 200 && res.success) {
          searchedTreeType.value = cloneDeep(formSearch.value.treeType);
          if (res.data && res.data.length > 0) {
            tableData.value = res.data || [];
            getTreeNameWidth(tableData.value);
          } else {
            tableData.value = [];
          }
        } else {
          tableData.value = [];
        }
        nextTick(() => {
          document.querySelector('#table-container')!.scrollTop = lastScrollTop;
        });
      } catch (error) {
        tableData.value = [];
      } finally {
        loading.value = false;
      }
    };
    /**
     * 格式化返回值
     */
    const formatter = (row: any, column: any) => {
      return formatEmptyValue(row[column.property]);
    };
    // 渲染空格
    const formatTreeName = (value: string) => {
      return value.replaceAll(' ', '&nbsp;');
    };
    /**
     * 自适应节点名称宽度
     */
    const getTreeNameWidth: any = (data: TM_ITreeManageVO[]) => {
      let res = null;
      if (!data) {
        return null;
      }
      for (let item of data) {
        const rowWidth = (item.treeLevel + 1) * 20 + 20 + getTextWidth(item.treeName);
        if (rowWidth > tableMaxWidth.value) {
          tableMaxWidth.value = cloneDeep(rowWidth);
        }
        tableTreeNameWidth.value = cloneDeep(tableMaxWidth.value);
        if (!res && item.childTree && item.childTree.length > 0) {
          res = getTreeNameWidth(item.childTree);
        }
      }
      return res;
    };
    /**
     * 获取文本宽度
     */
    const getTextWidth = (text: string) => {
      const canvas = document.createElement('canvas');
      const context: any = canvas.getContext('2d');
      context.font = 'bold 14px Microsoft YaHei';
      const metrics = context.measureText(text);
      return metrics.width;
    };
    /**
     * 删除树
     */
    const deleteTreeNode = (row: TM_ITreeManageVO, treeType: string, treeLeaf: string) => {
      const messageStr =
        treeType === TM_TREE_TYPE.科室树
          ? '是否确认删除该条数据(及其子节点)，删除后科室与区域的历史绑定关系将同步删除，请确定。'
          : '确认删除该条数据？';
      ElMessageBox.confirm(messageStr, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          await TreeManageService.deleteTree(Number(row.id))
            .then((res: any) => {
              if (res && res.success) {
                if (row.treeLevel > 3) {
                  console.log(loadMap.get(row.parentId));
                  // 层级超过四级， 如果当前节点子节点只有一个并且删除成功， 则重新拿数据
                  if (row.treeLevel > 5 && loadMap.get(row.parentId)?.row?.childTree?.length === 1) {
                    console.log(tableRef.value, tableRef.value.store.states.lazyTreeNodeMap.value);

                    const parentArr = row?.parentIds?.split(',');
                    console.log(' row?.parentIds0-----------------', row?.parentIds);
                    const id = parentArr?.[parentArr?.length - 2];
                    console.log('id-----------', id, tableRef.value.store.states.lazyTreeNodeMap.value[id]);
                    // 取懒加载中当前节点的父节点所在的数组，修改父节点的状态
                    tableRef.value.store.states.lazyTreeNodeMap.value[id] =
                      tableRef.value.store.states.lazyTreeNodeMap.value[id]?.map((item: any) => {
                        console.log(item, id, item?.id === id);
                        return item?.id === row.parentId
                          ? {
                              ...item,
                              treeLeaf: TM_ELEAFTYPES.是叶子节点,
                            }
                          : item;
                      });
                    //
                    tableRef.value.store.states.lazyTreeNodeMap.value[row.parentId] = [];
                  } else {
                    // 清空当前map
                    tableRef.value.store.states.lazyTreeNodeMap.value[row.parentId] = [];

                    // 如果刚好四级 则直接重查数据
                    if (row.treeLevel === 4) {
                      getTreeListData();
                    } else {
                      reloadTree(row.parentId);
                    }
                  }
                } else {
                  getTreeListData();
                }
                message.success((res && res.message) || '操作成功');
                checkEmpty();
              } else {
                if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                  message.error((res && res.message) || '操作失败');
                }
              }
            })
            .catch((error: Error) => {
              message.error('操作失败');
            });
        })
        .catch(() => {});
    };

    let addNode: TM_ITreeManageVO;
    /**
     * 新增按钮
     * @param {*} addChildrenFlag 是否是新增下级
     * @param {*} item 父节点数据
     */
    const dialogAddOperate = (addChildrenFlag: boolean, item: TM_ITreeManageVO) => {
      isAddChildrenFlag.value = addChildrenFlag;
      addNode = item;
      addTreeRef.value?.handleShow(item);
    };
    const addNodeSuccess = async () => {
      if (addNode && addNode.treeLevel >= 4) {
        if (addNode.lazyNode) {
          // 给当前节点新增时，需刷新当前节点的子节点，以及当前节点的父节点的子节点。
          reloadTree(addNode.id);
        } else {
          if (addNode.treeLevel > 4) {
            reloadTree(addNode.parentId);
          } else {
            await getTreeListData();
            if (formSearch.value.keyword === '' && formSearch.value.nodeType === TM_NODE_TYPES.全部) {
              expandAll.value = false;
              expandedKeys.value.push(String(addNode.id));
            } else {
              expandAll.value = true;
            }
          }
        }
      } else {
        await getTreeListData();
        if (formSearch.value.keyword === '' && formSearch.value.nodeType === TM_NODE_TYPES.全部) {
          expandAll.value = false;
          expandedKeys.value.push(String(addNode.id));
        } else {
          expandAll.value = true;
        }
      }
    };

    /**
     * 打开编辑弹框
     * @param data
     */
    const dialogEditOperate = (data: TM_ITreeManageVO) => {
      editTreeRef.value?.handleShow(data);
    };

    // 下载模板
    const downLoad = async () => {
      if (isDownloading.value) {
        return;
      }
      isDownloading.value = true;
      // 导出
      await commonService.getFileStreamDownload(
        '',
        '/admin/tree/download/template',
        '下载',
        () => {
          isDownloading.value = false;
        },
        () => {
          isDownloading.value = false;
        },
      );
    };

    const isLeadingOut = ref(false);
    // 导出
    const leadingOut = async () => {
      if (isLeadingOut.value) {
        return;
      }
      isLeadingOut.value = true;
      // 导出
      await commonService.getFileStreamDownload(
        '',
        '/admin/tree/exportTreeExcel',
        '导出',
        () => {
          isLeadingOut.value = false;
        },
        () => {
          isLeadingOut.value = false;
        },
      );
    };

    /**
     * 导入模板
     */
    const handleTemplateUpload = async () => {
      const file = await FUploadHandler(Object.keys(EXCEL_ACCEPT_EXTENSIONS).join());
      if (!verifyUpload([], file, MAXIMUN_SIZE, EXCEL_ACCEPT_EXTENSIONS, MAXIMUN_TOTAL_SIZE)) {
        return false;
      }
      isUploading.value = true;
      const messageInstance = message.loading('正在导入');
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await TreeManageService.uploadTree(formData);
        if (
          (res && res.data && res.data.code === 200 && res.data.success) ||
          (res && res.code === 200 && res.success)
        ) {
          isUploading.value = false;
          message.success(res.data ?? '导入成功');
          checkEmpty();
          await getTreeListData();
          if (formSearch.value.keyword === '' && formSearch.value.nodeType === TM_NODE_TYPES.全部) {
            expandAll.value = false;
            expandedKeys.value = getTreeExpandKeysLevel(tableData.value, 'id', 'childTree', 3)?.map((item) => {
              return String(item);
            });
          } else {
            expandAll.value = true;
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(!!res.message ? res.message : '导入失败');
          }
        }
      } catch (err: any) {
        message.error('上传失败');
      } finally {
        messageInstance.close();
        isUploading.value = false;
      }
    };

    const loadChildren = async (row: any, treeNode: unknown, resolve: (date: any[]) => void) => {
      const params = {
        keyword: '',
        treeType: formSearch.value.treeType,
        parentId: row.id,
        nodeType: String(formSearch.value.nodeType),
      };
      loadMap.set(row.id, { row, treeNode, resolve });
      TreeManageService.getTreeList(params).then((res: any) => {
        if (res?.code === 200 && res.data) {
          resolve(res.data);
        } else {
          resolve([]);
        }

        loadMap.set(row.id, {
          row: {
            ...row,
            treeLeaf: res.data?.length ? TM_ELEAFTYPES.不是叶子节点 : TM_ELEAFTYPES.是叶子节点,
            childTree: res?.data ?? [],
          },
          treeNode,
          resolve,
        });
      });
    };

    const reloadTree = (parentId: any) => {
      if (loadMap.get(parentId)) {
        const { row, treeNode, resolve } = loadMap.get(parentId);
        tableRef.value.store.states.lazyTreeNodeMap.value[parentId] = [];
        loadChildren(row, treeNode, resolve);
      }
    };
    // 树节点展开事件
    const handleTableExpand = (row: TM_ITreeManageVO, expanded: boolean) => {
      if (expandAll.value) {
        return;
      }
      if (expanded) {
        expandedKeys.value.push(String(row.id));
      } else {
        let list: TM_ITreeManageVO[] = [];
        flatten<TM_ITreeManageVO>(row.childTree, list, 'childTree');
        const ids = list?.map((item) => {
          return String(item?.id);
        });
        expandedKeys.value = expandedKeys.value.filter((item) => {
          return String(item) !== String(row.id) && !ids?.includes(item);
        });
      }
    };

    return {
      formSearch,
      loading,
      tableData,
      treeTypeData,
      isDownloading,
      isLeadingOut,
      isAddChildrenFlag,
      emptyFlag,
      editTreeRef,
      addTreeRef,
      tableTreeNameWidth,
      tableMaxWidth,
      getTreeNameWidth,
      nodeTypeData,
      searchedTreeType,
      isUploading,
      TM_TREE_TYPE,
      expandedKeys,
      tableRef,
      expandAll,

      formatTreeName,
      onSubmit,
      onReset,
      getTreeListData,
      formatter,
      dialogEditOperate,
      deleteTreeNode,
      handleTreeTypeChange,
      dialogAddOperate,
      checkEmpty,
      downLoad,
      leadingOut,
      handleTemplateUpload,
      getTextWidth,
      loadChildren,
      addNodeSuccess,
      handleTableExpand,
    };
  },
});
