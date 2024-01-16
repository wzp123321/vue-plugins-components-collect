<template>
  <div v-loading="loading">
    <el-form :model="projectProduction" :rules="rules" ref="ruleForm" label-width="100px" v-show="!loading">
      <el-form-item label="项目标题" prop="componentTitle">
        <el-input
          v-model.trim="projectProduction.componentTitle"
          :maxlength="18"
          v-inputFilter:search="{ allowSpace: false }"
          placeholder="请输入项目标题"
        ></el-input>
      </el-form-item>

      <el-form-item label="选择用能节点" prop="nodeArr">
        <div class="chooseNode">
          <span @click="chooseNode">请选择用能节点</span>
        </div>
        <div v-for="item in projectProduction.nodeArr" :key="item.id" class="flex">
          <el-input
            type="text"
            disabled
            v-model="item.treeName"
            style="margin-right: 6px; margin-bottom: 4px; flex: 1 1 auto"
          />
          <el-button @click="deleteData(item)">删除</el-button>
        </div>
      </el-form-item>
      <el-form-item style="text-align: center" label-width="0">
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </el-form-item>
    </el-form>
    <!-- 弹框 -->
    <tree-select-node
      ref="treeSelectRef"
      :selectedTreeNode="nodeIdArr"
      :selectedCheck="check"
      :maxLength="30"
      @setTreeData="getTreeData"
      @setChecked="getCheck"
    ></tree-select-node>
  </div>
</template>
<script lang="ts">
/**
 * 单位面积能耗排名
 */
import { defineComponent, PropType, ref, onMounted, reactive, watch } from 'vue';
// services
import energyRatio from '../../../../services/view/page-diy/energy-ratio';
import useCurrentInstance from '../../../../utils/use-current-instance';
import { useStore } from 'vuex';
import { ElForm } from 'element-plus';
import TreeSelectNode from '../common/pd-csd-tree-single-select.vue';
interface homeOptionData {
  componentCode: string;
  h: number;
  i: number;
  id: number;
  moved: boolean;
  name: string;
  sketchMap: string;
  w: number;
  x: number;
  y: number;
}
export default defineComponent({
  name: 'EnergyRankSetting',
  props: {
    projectProductionDetail: {
      type: Object as PropType<pageDiyData.IntroduceData>,
      default: {},
    },
  },
  components: {
    TreeSelectNode,
  },
  emits: ['closeDialog'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const store = useStore();
    const ruleForm = ref(ElForm);
    const treeSelectRef = ref();
    // const nodeArr = ref<{ treeName: string; id: number }[]>([]); //用于弹框展示选中的数据
    const nodeIdArr = ref<number[]>([]); //传给子组件选择中的数据 便于树节点赋值
    const loading = ref<boolean>(true);

    let homeOptionData = reactive<homeOptionData>({
      componentCode: '',
      h: 0,
      i: 0,
      id: -1,
      moved: false,
      name: '',
      sketchMap: '',
      w: 0,
      x: 0,
      y: 0,
    });
    const projectProduction = ref<{
      componentTitle: string;
      nodeArr: { treeName: string; id: number }[];
    }>({
      componentTitle: '',
      nodeArr: [],
    });

    const validateNode = (rule: any, value: any, callback: any) => {
      console.log('%c🚀 ~ pd-csd-energy-item-ratio.vue ~ 105行', 'font-size: 18px', value);
      if (!value.length) {
        callback(new Error('请选择用能节点'));
      } else {
        callback();
      }
    };
    // 校验规则
    const rules = {
      componentTitle: [
        {
          required: true,
          message: '请输入项目标题',
          trigger: 'blur',
        },
      ],
      nodeArr: [{ required: true, validator: validateNode, trigger: 'change' }],
    };

    // 删除单项
    const deleteData = (data: { treeName: string; id: number }) => {
      const index = projectProduction.value.nodeArr.findIndex(
        (item: { treeName: string; id: number }) => item.id === data.id,
      );
      projectProduction.value.nodeArr.splice(index, 1);
      ruleForm.value.validate();
    };
    // 选择节点 展示弹框
    const chooseNode = () => {
      nodeIdArr.value = projectProduction.value.nodeArr.map((item: { treeName: string; id: number }) => {
        return item.id;
      });
      if (treeSelectRef.value) {
        treeSelectRef.value.show();
      }
    };
    // 保存
    const onSubmit = () => {
      try {
        ruleForm.value.validate(async (valid: boolean) => {
          if (valid) {
            if (!projectProduction.value.nodeArr.length) {
              return proxy.$message.error('请最少选择一个节点');
            }
            const treeId = projectProduction.value.nodeArr[0].id;
            const obj = {
              componentCode: homeOptionData.componentCode,
              id: homeOptionData.id,
              componentTitle: projectProduction.value.componentTitle,
              treeId,
              treeType: String(check.value),
            };
            const res = await energyRatio.saveData(obj);
            if (res.code === 200 && res.success) {
              context.emit('closeDialog');
              proxy.$message.success(res.message);
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                return proxy.$message.error(res.message);
              }
            }
          } else {
            return false;
          }
        });
      } catch (err) {
        if (!(err as any)?.code?.includes('4f0')) {
          proxy.$message.error('保存失败');
        }
      }
    };
    // 获取tabs当前选中
    let check = ref<number>(1);
    const getCheck = (data: number) => {
      check.value = data;
    };

    // watch(
    //   () => projectProduction.value.nodeArr,
    //   (newVal) => {
    //     ruleForm.value.validate();
    //   },
    //   {
    //     deep: true,
    //   },
    // );
    // 获取树组件选择中的数据
    const getTreeData = (data: { id: number; treeName: string }[]) => {
      projectProduction.value.nodeArr = data;
      ruleForm.value.validate();
      // console.log(projectProduction.value.nodeArr, '子组件传给父组件数据');
    };
    // 获取配置数据
    const getList = async () => {
      try {
        loading.value = true;
        const res = await energyRatio.getInitData(homeOptionData.id);
        if (res.code == 200 && res.success) {
          // console.log(res, 'res');
          projectProduction.value.componentTitle = (res.data && res.data?.componentTitle) || '';
          check.value = res?.data?.treeType ? Number(res?.data?.treeType) : 1;
          if (res.data) {
            projectProduction.value.nodeArr = [{ id: res?.data?.treeId, treeName: res?.data?.treeName ?? '' }];
          } else {
            projectProduction.value.nodeArr = [];
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (err) {
        if (!(err as any)?.code?.includes('4f0')) {
          proxy.$message.error('初始化数据失败');
        }
      } finally {
        loading.value = false;
      }
    };
    onMounted(async () => {
      homeOptionData = store.state.homeOption;
      await getList();
    });

    return {
      projectProduction,
      rules,
      loading,
      nodeIdArr,
      check,
      ruleForm,
      treeSelectRef,

      deleteData,
      chooseNode,
      onSubmit,
      getTreeData,
      getCheck,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.el-dialog__body) {
  text-align: left !important;
}
.chooseNode {
  color: blue;
  text-decoration: underline;
  text-align: left;
  cursor: pointer;
}

:deep(.el-input.is-disabled) > input.el-input__inner {
  height: 36px !important;
  line-height: 36px !important;
}

.box {
  height: 400px;
  overflow-y: scroll;
  border: 1px solid #dbdbdb;
}
</style>
