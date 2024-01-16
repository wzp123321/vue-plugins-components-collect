import { defineComponent, onMounted, reactive, ref, toRefs, unref, nextTick, onUnmounted, watch, computed } from 'vue';
import { useCommonController } from '@/utils/use-common-controller';
import { onBeforeRouteLeave } from 'vue-router';
// services
import commonService from '@/services/common/common';
import treeBindingService from '@/pages/tree-bind/service/tree-bind.service';
import { cloneDeep } from 'lodash';
// components
import BindingPointAddDialog from './components/tb-add-update-dialog/tb-add-update-dialog.vue';
import TbBindPoint from './components/tb-bind-point/tb-bind-point.vue';
import { ElMessageBox } from 'element-plus';
import { getTreeExpandKeys } from '@/utils/index';
// config
import { TREE_BIND } from '@/config/enum';
import { CommonObject } from '@/services/common/common-api';
import { Tb_IPointInfoListInfo } from './components/tb-bind-point/tb-bind-point.api';
import message from '@/utils/message';

interface TreeBindingState {
  reqLoading: boolean;
  bindingTreeInfo: TreeBindingModule.TreeBindingInfo;
  pointInfoList: TreeBindingModule.PointInfo[];
  originalFormula: string; // 原始公式 --- 用于比较
  formula: string;
  isAdd: boolean;
}

// tree & energycode select模块
interface treeSelectState {
  energyCodeList: EnergyCodeManageModule.EnergyInfo[];
  energyCodeExpandKeys: string[];
  energyCodeLoading: boolean;
  treeList: TreeManageModule.TreeList[];
  treeTypeList: { code: number; name: string }[];
  tableLoading: boolean;
  treeLoading: boolean;
  energyCode: string[];
  originalEnergycode: string[];
  treeId: number;
  standardPointCode: string;
  initBaseData: () => void;
  onEnergycodeChange: (value: string[]) => void;
  selectItem: (data: CommonObject) => void;
  onTreeTypeChange: (value: number | string | boolean) => void;
  onNodeClick: (value: GlobalModule.CommonObject) => void;
}

const defaultTypeProps = {
  code: {
    children: 'childEnergyCode',
    disabled: '',
    label: 'name',
  },
  tree: {
    children: 'childTree',
    disabled: '',
    label: 'treeName',
  },
};

const nodeKey = 'code';

const energyName = '电';

let time = 0;

export default defineComponent({
  name: 'TreeBind',
  components: {
    BindingPointAddDialog,
    TbBindPoint,
  },
  directives: {
    /**
     * 过滤公式输入框
     */
    formulaFilter: {
      mounted(el) {
        const ele: any = el.tagName === 'TEXTAREA' ? el : el.querySelector('textarea');
        /**
         * 输入事件
         */
        const handleInput = (e: InputEvent) => {
          if (Math.abs(time - new Date().getTime()) < 5) {
            return;
          }
          time = new Date().getTime();
          // 是否在剪切板
          if (e.isComposing) {
            return;
          }
          // 处理. + -开头的

          // const characters: string = '';
          // const defaultStr = String.raw`\`\\;\'\"<>`;
          // const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
          // 过滤掉除V+-*().以外的特殊符号
          ele.value = ele.value.replace(/[^\dV.\+\-\*()]/g, '');
          ele.value = ele.value.replace(/\s+/g, '');

          ele.dispatchEvent(new Event('input'));
        };
        ele.oninput = handleInput;
        ele.onblur = handleInput;
        // 解决输入中文的问题
        // ele.addEventListener('compositionend', (e: InputEvent) => {
        //   handleInput(e);
        // });
      },
    },
  },
  setup() {
    const { proxy, treeType, getTreeWidthoutLocationList, getEnergyTree, getListEnergyParentCodeExcludeTotal } =
      useCommonController();
    const addDialog = ref(null);
    const emsTree = ref(null);
    // 容器
    const containerWidth = ref('');
    // 树绑定信息
    const treeBindState = reactive<TreeBindingState>({
      reqLoading: false,
      bindingTreeInfo: {
        formulaInfoList: [],
        treeId: 0,
        treeName: '',
      },
      pointInfoList: [],
      originalFormula: '',
      formula: '',
      isAdd: true,
    });
    // 树节点默认展开节点
    const expandedKeys = ref<number[]>([]);
    // 初始数据
    let initialFormula: string = '';
    let initialPointList: TreeBindingModule.PointInfo[] = [];

    const checkedIdList = computed(() => cloneDeep(treeBindState.pointInfoList).map((it) => it.pointId));

    /**
     * tree energycode
     */
    const useTreeSelectController = () => {
      // 初始化接口
      const initBaseData = async () => {
        await initEnergyCodeList();
        try {
          const promiseArr = [getTreeWidthoutLocationList(), commonService.getDictionaryData('tree_type')];
          const resArr = await Promise.all(promiseArr);
          if (resArr) {
            treeSelectState.treeList = resArr[0];
            expandedKeys.value = getTreeExpandKeys(treeSelectState.treeList, 'id', 'childTree');

            treeSelectState.treeId = treeSelectState.treeList.length > 0 ? treeSelectState.treeList[0].id : 0;
            treeSelectState.treeTypeList = resArr[1].data.map((item: { code: string; name: string }) => {
              const { code, name } = item;
              return {
                code: Number(code),
                name,
              };
            });
            treeType.value = Number(treeSelectState.treeTypeList[0].code);
            await getBindingTreeListByTreeId();
            const tree = unref(emsTree);
            if (!tree) {
              return;
            }
            (tree as any).setCurrentKey(treeSelectState.treeId, false);
            treeSelectState.treeLoading = false;
          } else {
            treeSelectState.tableLoading = false;
            treeSelectState.treeLoading = false;
          }
        } catch (error) {
          treeSelectState.tableLoading = false;
          treeSelectState.treeLoading = false;
        }
      };
      /**
       * 根据树类型 查询分类分项列表
       * 如果是支路树--需要默认为01000
       */
      const initEnergyCodeList = async () => {
        if (treeType.value === 3) {
          treeSelectState.originalEnergycode = ['01000'];
          treeSelectState.energyCode = ['01000'];
          treeSelectState.energyCodeList = [];
          //treeSelectState.tableLoading = false;
          return;
        }
        treeSelectState.energyCodeLoading = true;
        try {
          const res = treeType.value === 1 ? await getEnergyTree() : await getListEnergyParentCodeExcludeTotal();
          if (res?.length) {
            treeSelectState.energyCodeList = res;
            treeSelectState.energyCode = [res[0].code];
            treeSelectState.originalEnergycode = treeSelectState.energyCode;
            treeSelectState.energyCodeExpandKeys = treeSelectState.energyCodeList?.map((item) => {
              return item.code;
            });
          } else {
            treeSelectState.energyCodeList = [];
            treeSelectState.energyCode = [];
            treeSelectState.originalEnergycode = treeSelectState.energyCode;
          }
          // treeSelectState.tableLoading = false;
        } catch (error) {
          treeSelectState.energyCodeList = [];
          treeSelectState.energyCode = [];
          treeSelectState.originalEnergycode = treeSelectState.energyCode;
          //  treeSelectState.tableLoading = false;
        } finally {
          treeSelectState.energyCodeLoading = false;
        }
      };
      /**
       * 分类分项change
       * @param value
       */
      const onEnergycodeChange = async (value: string[]) => {
        checkFormulaChange(
          () => {
            getBindingTreeListByTreeId();
            treeSelectState.originalEnergycode = value;
          },
          () => {
            treeSelectState.energyCode = treeSelectState.originalEnergycode;
          },
        );
      };

      // 分类分项切换
      const selectItem = (value: CommonObject) => {
        treeSelectState.standardPointCode = value.standardPoints;
      };

      /**
       * 区域 业态切换
       */
      const onTreeTypeChange = (value: number | string | boolean) => {
        expandedKeys.value = [];
        checkFormulaChange(
          async () => {
            try {
              treeSelectState.treeLoading = true;

              treeType.value = Number(value);
              await initEnergyCodeList();
              treeSelectState.treeList = await getTreeWidthoutLocationList();
              if (treeSelectState.treeList.length === 0) {
                initData();
              } else {
                treeSelectState.treeId = treeSelectState.treeList[0].id;
                const tree = unref(emsTree.value);
                nextTick(() => {
                  if (!tree) {
                    return;
                  }
                  (tree as any).setCurrentKey(treeSelectState.treeId, false);
                });
                expandedKeys.value = getTreeExpandKeys(treeSelectState.treeList, 'id', 'childTree');
                getBindingTreeListByTreeId();
              }
            } catch (error) {
              treeSelectState.treeLoading = false;
            } finally {
              treeSelectState.treeLoading = false;
            }
          },
          () => {},
        );
      };
      /**
       * 树节点点击
       */
      const onNodeClick = (data: GlobalModule.CommonObject) => {
        checkFormulaChange(
          () => {
            treeSelectState.treeId = data.id;
            getBindingTreeListByTreeId();
          },
          () => {
            const tree = unref(emsTree.value);
            nextTick(() => {
              if (!tree) {
                return;
              }
              (tree as any).setCurrentKey(treeSelectState.treeId, false);
            });
          },
        );
      };
      const treeSelectState = reactive<treeSelectState>({
        energyCodeList: [],
        energyCodeExpandKeys: [],
        energyCodeLoading: false,
        treeList: [],
        treeTypeList: [],
        energyCode: [],
        originalEnergycode: [],
        treeId: 0,
        tableLoading: true,
        treeLoading: true,
        standardPointCode: '',
        initBaseData,
        onTreeTypeChange,
        onEnergycodeChange,
        selectItem,
        onNodeClick,
      });
      return { treeSelectState };
    };
    /**
     * 判断公式是否被编辑
     */
    const checkFormulaChange = async (confirmCb: () => void, erroCb: () => void) => {
      if (treeBindState.formula !== treeBindState.originalFormula) {
        ElMessageBox.confirm('是否保存树设备关联信息的修改  ', '关联信息保存', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          type: 'warning',
        })
          .then(async (res) => {
            if (res === 'confirm') {
              // if (!checkFormula()) {
              //   proxy.$message.error('公式不合法！');
              //   erroCb();
              //   return;
              // }
              await getTreeBindPoint();
              confirmCb();
            }
          })
          .catch(() => {
            confirmCb();
          });
      } else {
        confirmCb();
      }
    };
    /**
     * 打开新增弹框
     */
    const onDialogShow = () => {
      const dialog = unref(addDialog);
      if (!dialog) {
        return;
      }
      (dialog as any).show();
    };

    /**
     * 初始化部分数据
     */
    const initData = () => {
      treeBindState.bindingTreeInfo = {
        formulaInfoList: [],
        treeId: 0,
        treeName: '',
      };
      treeSelectState.treeId = -1;
      treeSelectState.tableLoading = false;
      treeBindState.formula = '';
      treeBindState.originalFormula = '';
      treeBindState.isAdd = true;
      treeBindState.pointInfoList = [];
    };
    /**
     * 根据节点id获取绑定列表
     */
    const getBindingTreeListByTreeId = async () => {
      window.onbeforeunload = null;
      const { treeId, energyCode } = treeSelectState;
      treeSelectState.tableLoading = true;

      treeBindState.pointInfoList = [];
      try {
        const res = await treeBindingService.getBindingTreeListByTreeId({
          treeId,
          energyCode: energyCode[0],
        });
        if (res && res.code === 200) {
          if (res.data) {
            treeBindState.bindingTreeInfo = res.data;
            treeBindState.pointInfoList =
              res.data.formulaInfoList && res.data.formulaInfoList[0] && res.data.formulaInfoList[0].pointInfoList
                ? cloneDeep(res.data.formulaInfoList[0].pointInfoList)
                : [];
            initialPointList = cloneDeep(treeBindState.pointInfoList) ?? [];
            treeBindState.formula =
              res.data.formulaInfoList && res.data.formulaInfoList[0] && res.data.formulaInfoList[0].formula
                ? cloneDeep(res.data.formulaInfoList[0].formula)
                : '';
            initialFormula = cloneDeep(treeBindState.formula) ?? '';
            treeBindState.originalFormula = cloneDeep(treeBindState.formula);
            treeBindState.isAdd =
              !res.data.formulaInfoList ||
              !res.data.formulaInfoList[0] ||
              !res.data.formulaInfoList[0].pointInfoList ||
              res.data.formulaInfoList[0].pointInfoList.length === 0;
            setTimeout(() => {
              treeSelectState.tableLoading = false;
            }, 300);
          } else {
            initialFormula = '';
            initialPointList = [];
            treeBindState.bindingTreeInfo = res.data;
            treeSelectState.tableLoading = false;
            treeBindState.pointInfoList = [];
            treeBindState.formula = '';
            treeBindState.originalFormula = '';
            treeBindState.isAdd = true;
          }
        } else {
          treeSelectState.tableLoading = false;
          initData();
          initialFormula = '';
          initialPointList = [];
          message.error('操作失败');
        }
      } catch (error) {
        treeSelectState.tableLoading = false;
        initData();
        initialFormula = '';
        initialPointList = [];
      }
    };
    /**
     * 根据id删除公式 --- 需要处理排序
     */
    const onPointItemDelete = (index: number) => {
      proxy
        .$confirm('确认删除该数据吗？', '删除绑点', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(async () => {
          treeBindState.pointInfoList.splice(index, 1);
          //2021-01-10注释公式匹配
          // const characters: string = '';
          // const defaultStr = String.raw`V${index}(?!\d)`;
          // const reg = new RegExp(String.raw`${defaultStr}${characters}`, 'g');
          // treeBindState.formula = treeBindState.formula.replace(reg, '');
          await getTreeBindPoint();
          await getBindingTreeListByTreeId();
        })
        .catch(() => {
          console.log('取消');
        });
    };
    /**
     * 新增点位弹框回调
     */
    const onPointAdd = async (list: Tb_IPointInfoListInfo[]) => {
      list.forEach((item) => {
        const { deviceId, pointNumber, id, standardPointCode, concentratorId, concentratorName, name, deviceName } =
          item;

        treeBindState.pointInfoList.push({
          concentratorId,
          concentratorName,
          deviceName,
          pointId: id,
          deviceId,
          pointName: name,
          pointNumber,
          standardPointCode,
        });
      });
      treeBindState.formula += `${!treeBindState.formula ? '' : '+'}V${treeBindState.pointInfoList.length - 1}`;
      await getTreeBindPoint();
      await getBindingTreeListByTreeId();
    };

    /**
     * 更新数据
     */
    const getTreeBindPoint = async () => {
      const { bindingTreeInfo, pointInfoList, formula, isAdd } = treeBindState;
      const { originalEnergycode, treeId } = treeSelectState;
      const name =
        (bindingTreeInfo &&
          bindingTreeInfo.formulaInfoList &&
          bindingTreeInfo.formulaInfoList[0] &&
          bindingTreeInfo.formulaInfoList[0].name) ||
        `${originalEnergycode}_${treeId}_${pointInfoList.length > 0 ? pointInfoList[0].deviceId : 0}_bindPoint`;

      const params = {
        autoGenerated: TREE_BIND.AUTO_GENERATED,
        energyCode: originalEnergycode[0],
        //   formula,
        name,
        points: pointInfoList.map((item) => {
          const { deviceId, pointNumber, standardPointCode } = item;
          return { deviceId, pointNumber, standardPointCode };
        }),
        treeId,
      };
      const id =
        (bindingTreeInfo &&
          bindingTreeInfo.formulaInfoList &&
          bindingTreeInfo.formulaInfoList[0] &&
          bindingTreeInfo.formulaInfoList[0].id) ||
        0;
      try {
        // 判断 解绑 & 绑点
        if (isAdd && pointInfoList.length === 0) {
          proxy.$message.error('您还未选择点位！');
          return;
        }
        const key = !isAdd && pointInfoList.length === 0 ? '解绑' : '绑点';
        treeBindState.reqLoading = true;
        const res =
          !isAdd && pointInfoList.length === 0
            ? await treeBindingService.getTreeUnBind(id)
            : isAdd
            ? await treeBindingService.getTreeBind(params)
            : await treeBindingService.getTreeBindUpdate(
                Object.assign(params, {
                  id,
                }),
              );
        if (res && res.code === 200) {
          if (res.data) {
            proxy.$message.success(`${key}成功！`);
            window.onbeforeunload = null;
            await refresh();
          } else {
            treeBindState.reqLoading = false;
            getBindingTreeListByTreeId();
          }
        } else {
          treeBindState.reqLoading = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || `${key}失败！`);
          }
        }
      } catch (error) {
        treeBindState.reqLoading = false;
        proxy.$message.error('保存失败');
      }
    };
    /**
     * 一键刷新
     */
    const refresh = async () => {
      const { originalEnergycode } = treeSelectState;
      try {
        const res = await treeBindingService.getTreeBindRefresh({
          energyCode: originalEnergycode[0],
          treeType: treeType.value,
        });
        if (res && res.code === 200) {
          treeBindState.reqLoading = false;
          window.onbeforeunload = null;
          proxy.$message.success('刷新成功！');
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message ? res.message : '刷新失败！');
          }
          treeBindState.reqLoading = false;
        }
      } catch (error) {
        getBindingTreeListByTreeId();
        treeBindState.reqLoading = false;
        proxy.$message.error('刷新失败！');
      }
      isShowExport();
    };
    /**
     * 重置数据
     */
    const onFormulaReset = () => {
      console.log(initialPointList, initialFormula);
      treeBindState.pointInfoList = [...initialPointList];
      treeBindState.formula = initialFormula;
      isShowExport();
    };
    /**
     * 正则校验
     * 1.包含除法以及连续运算符
     * 2.出现新增列表外的公式号
     * 3.出现连续两个运算符
     * 4.eval运算后报错
     */
    const checkFormula = () => {
      let flag = true;
      const { formula, pointInfoList } = treeBindState;
      let newFormula = formula;
      let formulaCodes = pointInfoList.map((item, index) => {
        return `V${index}`;
      });

      // 没有连续运算符
      if (newFormula && (/!/.test(newFormula) || /[+|\-|*]{2,}/.test(newFormula))) {
        flag = false;
      }
      // 以+ - . 开头
      if (newFormula.startsWith('+') || newFormula.startsWith('-') || newFormula.startsWith('.')) {
        flag = false;
      }
      console.log('flag-1--------', flag);

      // 按运算符分割字符串 校验所有符号都在公式内 // 通过+ - * ( )分割 得到的数组 去除空字符串去除非V符号 去重后与原数组进行比较看是否多了 少了 // 这里可以判断元素是否有.开头的 这也是不合法的
      let codeResult = newFormula.split(/[-+*()]/);
      codeResult = codeResult.filter((item) => {
        // 特殊情况 数字以.开头 数字为0.000这种无效数字
        if (item.startsWith('.') || item.replaceAll('0', '') === '.') {
          flag = false;
        }
        return item && item.indexOf('V') !== -1;
      });
      codeResult = Array.from(new Set(codeResult));
      console.log(codeResult);
      if (codeResult?.length !== formulaCodes?.length) {
        flag = false;
      } else {
        codeResult = codeResult.filter((item) => {
          return !formulaCodes.includes(item);
        });
        console.log(codeResult);
        if (codeResult?.length !== 0) {
          flag = false;
        }
      }
      console.log('flag-2--------', flag); // 校验连续符号 // 连续Vx的

      if (/[V\d]\\1/.test(newFormula)) {
        flag = false;
      }
      console.log('flag-3--------', flag); // 将Vx替换成相应的x数字

      formulaCodes = formulaCodes.reverse(); // 对每个v进行替换
      formulaCodes.forEach((item) => {
        newFormula = newFormula.replaceAll(item, `${item.replace('V', '')}`);
      });

      try {
        console.log(newFormula);
        eval(newFormula);
      } catch (error) {
        flag = false;
      }
      console.log('flag-4--------', flag); // 4.

      return flag;
    };
    // 获取父容器高度
    const getContainerHeight = () => {
      containerWidth.value = document.querySelector('.el-container.flex.flex-column')
        ? `${document.querySelector('.el-container.flex.flex-column')?.scrollHeight}px`
        : '100%';
    };
    /**
     * 监听公式变化  如果公式与初始值不同 则添加监听事件， 如果相同则销毁事件
     */
    watch(
      () => treeBindState.formula,
      (newVal) => {
        if (newVal === treeBindState.originalFormula) {
          window.onbeforeunload = null;
        } else {
          window.onbeforeunload = () => {
            return '是否保存对公式的修改';
          };
        }
      },
      {
        immediate: true,
      },
    );
    /**
     * 初始化
     */
    onMounted(async () => {
      // treeSelectState.tableLoading = true;
      await treeSelectState.initBaseData();
      nextTick(async () => {
        getContainerHeight();
        window.addEventListener('resize', getContainerHeight);
      });

      isShowExport();
    });
    /**
     * 路由跳转前
     */
    onBeforeRouteLeave((to, from, next) => {
      checkFormulaChange(
        () => next(),
        () => {},
      );
    });
    /**
     * 组件销毁
     */
    onUnmounted(() => {
      window.removeEventListener('resize', getContainerHeight);
    });
    const { treeSelectState } = useTreeSelectController();
    /**
     * 导出
     */
    let exportLoading = ref<boolean>(false);
    const onDialogExport = async () => {
      if (exportLoading.value) {
        return;
      }
      exportLoading.value = true;
      // 导出
      await commonService.getFileStreamDownload(
        '树-设备关联信息',
        '/admin/tree/bind/point/download/template',
        '导出',
        () => {
          exportLoading.value = false;
        },
        () => {
          exportLoading.value = false;
        },
      );
    };
    let isShowbutton = ref<Boolean>(false);
    const isShowExport = async () => {
      try {
        const res = await treeBindingService.getIsHaveData();
        if (res && res.code === 200) {
          isShowbutton.value = res.data;
          //  proxy.$message.success('刷新成功！');
        } else {
          isShowbutton.value = false;
          //  proxy.$message.error(res.message ? res.message : '刷新失败！');
        }
      } catch (error) {
        isShowbutton.value = false;
        //  proxy.$message.error('刷新失败！');
      }
    };

    const batchDeleteItem = ref<number[]>([]);

    const batchDelete = () => {
      proxy
        .$confirm('确认批量删除数据吗？', '删除绑点', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(async () => {
          treeBindState.pointInfoList = treeBindState.pointInfoList.filter(
            (item) => !batchDeleteItem.value.includes(item.pointId!),
          );
          await getTreeBindPoint();
          await getBindingTreeListByTreeId();
        })
        .catch(() => {
          console.log('取消');
        })
        .finally(() => {
          batchDeleteItem.value = [];
        });
    };

    const handleSelectionChange = (val: TreeBindingModule.PointInfo[]) => {
      batchDeleteItem.value = val.map((it) => it.pointId!);
    };

    return {
      ...toRefs(treeBindState),
      treeSelectState,
      addDialog,
      emsTree,
      treeType,
      defaultTypeProps,
      nodeKey,
      checkedIdList,
      containerWidth,
      energyName,
      expandedKeys,
      exportLoading,
      isShowbutton,
      onDialogShow,
      onPointItemDelete,
      onPointAdd,
      getBindingTreeListByTreeId,
      onFormulaReset,
      onDialogExport,
      handleSelectionChange,
      batchDelete,
      batchDeleteItem,
    };
  },
});
