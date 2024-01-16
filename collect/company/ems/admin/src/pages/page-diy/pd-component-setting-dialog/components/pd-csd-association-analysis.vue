<template>
  <el-form :model="associationAnalysisSetting" :rules="rules" ref="ruleForm" label-width="100px" v-loading="loading">
    <el-form-item label="项目标题" prop="componentTitle" class="mr2" v-show="!loading">
      <el-input
        v-model="componentTitle"
        :maxlength="18"
        v-inputFilter:search="{ allowSpace: false }"
        placeholder="请输入项目标题"
      ></el-input>
    </el-form-item>
    <el-form-item label="能耗类型选择" prop="energySelected" v-show="!loading">
      <el-select class="energySel" v-model="energySelected" @change="energySelectedClick">
        <el-option v-for="item in energySelList" :key="item.code" :label="item.name" :value="item.code"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="选择节点" v-show="!loading">
      <div class="chooseNode">
        <span @click="chooseNode">请选择节点</span>
      </div>
      <div v-for="item in nodeAllArr" :key="item.id" class="flex">
        <el-input
          type="text"
          disabled
          v-model="item.treeName"
          style="flex: 1 1 auto; margin-right: 6px; margin-bottom: 4px"
        /><el-button @click="deleteData(item)">删除</el-button>
      </div>
    </el-form-item>
    <el-form-item style="text-align: center" label-width="0">
      <el-button type="primary" @click="onSubmit" v-show="!loading">保存</el-button>
    </el-form-item>
  </el-form>
  <!-- 弹框 -->
  <tree-select-node
    ref="treeSelectRef"
    :selectedTreeNode="nodeIdAllArr"
    :selectedCheck="check"
    @setTreeData="getTreeData"
    @setChecked="getCheck"
  ></tree-select-node>
</template>
<script lang="ts">
/**
 * 关联分析组件
 */
import { onMounted, defineComponent, reactive, ref, toRefs, nextTick } from 'vue';
import { useStore } from 'vuex';
import { ElForm } from 'element-plus';
import useCurrentInstance from '../../../../utils/use-current-instance';
// services
import associationAnalysis from '../../../../services/view/page-diy/association-analysis/index';
import TreeSelectNode from '../common/pd-csd-treeSelectNode.vue';
interface DialogEnergyState {
  componentTitle: string;
  energySelList: any;
  energySelected: string;
  loading: boolean;
}
interface correlationTreeInfoMapType {
  [key: string]: any;
}

export default defineComponent({
  name: 'AssociationAnalysis',
  emits: ['closeDialog'],
  components: {
    TreeSelectNode,
  },
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const store = useStore();
    const treeSelectRef = ref();
    const ruleForm = ref(ElForm);
    let homeOptionData = ref<any>({});
    const associationAnalysisSetting = reactive<DialogEnergyState>({
      componentTitle: '',
      energySelList: [],
      energySelected: '',
      loading: true,
    });
    let correlationTreeInfoMap = reactive<correlationTreeInfoMapType>({});
    let energyKeyList = ref<string[]>([]);
    /**
     * 用于弹框展示选中的数据
     * @nodeAllArr 总能耗 00000
     */
    const nodeAllArr = ref<{ treeName: string; id: number }[]>([]);
    /**
     * 传给子组件选择中的数据 便于树节点赋值
     * @nodeIdAllArr 总能耗 00000
     */
    const nodeIdAllArr = ref<any>([]);
    // 校验规则
    const rules = {
      componentTitle: [
        {
          required: true,
          message: '请输入项目标题',
          trigger: 'blur',
        },
      ],
      selnodeRank: [
        {
          required: true,
          trigger: 'blur',
        },
      ],
      energySelected: [
        {
          required: true,
          message: '请选择能耗类型',
          trigger: 'blur',
        },
      ],
    };
    onMounted(async () => {
      homeOptionData.value = store.state.homeOption;
      await getListSelect();
      await getInitSettingData();
    });
    //获取初始信息
    const getInitSettingData = async () => {
      try {
        associationAnalysisSetting.loading = true;
        const res = await associationAnalysis.getInitData(homeOptionData.value.id);
        if (res.code == 200 && res.success) {
          associationAnalysisSetting.componentTitle = (res.data && res.data.title) || '';

          energyKeyList.value = Object.keys(res.data.correlationTreeInfoMap).sort();
          correlationTreeInfoMap = res.data.correlationTreeInfoMap;
          check.value =
            Object.keys(res?.data?.correlationTreeInfoMap)?.length &&
            res?.data?.correlationTreeInfoMap[Object.keys(res?.data?.correlationTreeInfoMap)[0]]?.length
              ? Number(
                  res?.data?.correlationTreeInfoMap[Object.keys(res?.data?.correlationTreeInfoMap)[0]]?.[0]?.treeType,
                )
              : 1;
          const index = associationAnalysisSetting.energySelList.findIndex((item: any) => {
            return item.code === res.data.componentCode;
          });
          if (index !== -1) {
            associationAnalysisSetting.energySelected = res.data.componentCode;
            energySelectedClick(associationAnalysisSetting.energySelected);
          } else {
            associationAnalysisSetting.energySelected = '';
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (error: any) {
        associationAnalysisSetting.loading = false;
        // return proxy.$message.error('操作失败');
      } finally {
        associationAnalysisSetting.loading = false;
      }
    };
    //获取初始下拉内容
    const getListSelect = async () => {
      try {
        const res = await associationAnalysis.getEnergyListSelect();
        if (res.code == 200 && res.success) {
          associationAnalysisSetting.energySelList = res.data;
        } else {
          associationAnalysisSetting.loading = false;
        }
      } catch (error: any) {
        associationAnalysisSetting.loading = false;
      }
    };
    // 提交
    const onSubmit = async () => {
      try {
        ruleForm.value.validate(async (valid: boolean) => {
          if (valid) {
            if (nodeIdAllArr.value.length === 0) {
              return proxy.$message.error('节点不可为空！');
            }
            if (associationAnalysisSetting.energySelected == '') {
              return proxy.$message.error('能源类型不可为空！');
            }
            if (associationAnalysisSetting.componentTitle == '') {
              return proxy.$message.error('项目标题不可为空！');
            }
            let correlationTreeInfoMapObj: correlationTreeInfoMapType = {};
            for (const key in correlationTreeInfoMap) {
              if (correlationTreeInfoMap[key].length > 0) {
                correlationTreeInfoMapObj[key] =
                  correlationTreeInfoMap[key].map((item: { treeName: string; id: number }) => {
                    return item.id;
                  }) || [];
              }
            }
            const params = {
              title: associationAnalysisSetting.componentTitle,
              id: homeOptionData.value.id,
              componentCode: associationAnalysisSetting.energySelected,
              correlationTreeInfoMap: correlationTreeInfoMapObj,
            };

            const res = await associationAnalysis.toSetEnergyRankData(params);
            if (res.code === 200 && res.success) {
              context.emit('closeDialog');
              return proxy.$message.success(res.message);
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                return proxy.$message.error(res.message);
              }
            }
          } else {
            return false;
          }
        });
      } catch (error: any) {
        if (!(error as any)?.code?.includes('4f0')) {
          return proxy.$message.error('操作失败');
        }
      }
    };
    // 选择节点 展示弹框
    const chooseNode = () => {
      if (associationAnalysisSetting.energySelected === '') {
        return proxy.$message.warning('请先选择能耗类型');
      }
      if (treeSelectRef.value) {
        treeSelectRef.value.show();
      }
    };
    // 删除单项
    const deleteData = (data: { treeName: string; id: number }) => {
      const indexAll = nodeAllArr.value.findIndex((item: { treeName: string; id: number }) => item.id === data.id);
      nodeAllArr.value.splice(indexAll, 1);
      nodeIdAllArr.value = nodeAllArr.value.map((item: { treeName: string; id: number }) => {
        return item.id;
      });
      correlationTreeInfoMap[`${associationAnalysisSetting.energySelected}`] = nodeAllArr.value;
    };
    // 获取tabs当前选中
    let check = ref<number>(1);
    const getCheck = (data: number) => {
      check.value = data;
    };
    // 获取树组件选择中的数据
    const getTreeData = (data: { id: number; treeName: string }[]) => {
      correlationTreeInfoMap[`${associationAnalysisSetting.energySelected}`] = data;
      nodeAllArr.value = data;
      nodeIdAllArr.value = nodeAllArr.value.map((item: { treeName: string; id: number }) => {
        return item.id;
      });
    };
    // 能耗类型下拉框change事件
    const energySelectedClick = (val: any) => {
      energyKeyList.value.forEach((item) => {
        if (item == val) {
          nextTick(() => {
            nodeAllArr.value = correlationTreeInfoMap[`${val}`];
            nodeIdAllArr.value =
              nodeAllArr.value.map((item: { treeName: string; id: number }) => {
                return item.id;
              }) || [];
          });
        } else {
          nodeAllArr.value = [];
          nodeIdAllArr.value = [];
        }
      });
    };
    return {
      ...toRefs(associationAnalysisSetting),
      associationAnalysisSetting,
      associationAnalysis,
      rules,
      ruleForm,
      onSubmit,
      chooseNode,
      deleteData,
      treeSelectRef,
      getCheck,
      getTreeData,
      nodeIdAllArr,
      check,
      nodeAllArr,
      energySelectedClick,
    };
  },
});
</script>
<style lang="less" scoped>
.mr2 {
  .tipInfo {
    float: right;
    color: red;
    display: inline-block;
    font-size: 12px;
    line-height: 0px;
    margin-top: 12px;
  }
}
.chooseNode {
  color: blue;
  text-decoration: underline;
  text-align: left;
  cursor: pointer;
}
:deep(.el-dialog__body) {
  text-align: left !important;
}
.energySel {
  width: 100%;
}

:deep(.el-input.is-disabled) > input.el-input__inner {
  height: 36px !important;
  line-height: 36px !important;
}
</style>
