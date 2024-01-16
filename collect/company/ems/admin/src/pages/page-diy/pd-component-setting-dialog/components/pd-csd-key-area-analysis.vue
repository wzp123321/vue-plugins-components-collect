<template>
  <div class="keyAreaAnalysis" v-loading="loading">
    <el-form :model="projectProduction" :rules="rules" ref="ruleForm" label-position="right">
      <el-form-item label="项目标题" prop="componentTitle">
        <el-input
          v-inputFilter:search="{ allowSpace: false }"
          v-model.trim="projectProduction.componentTitle"
          :maxlength="18"
          placeholder="请输入项目标题"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="keyAreaAnalysis-area" v-show="!loading">
      <div class="keyAreaAnalysis-area-header">区域列表</div>
      <Demo
        v-loading="getAnalysisTreeDataLoading"
        :placeholder="'请选择分析对象'"
        v-model="formInline.analysisObject"
        :treeData="analysisObjectData"
        :showSearch="false"
        :defaultProps="{ children: 'childTree', label: 'treeName' }"
        :expanedKeys="analysisObjectExpanedKeys"
        :maxLength="10"
        :multiple="true"
        :defaultExpandAll="false"
        @selectedTreeParentData="getTreeParentData"
      ></Demo>
    </div>
    <div style="text-align: center" v-show="!loading">
      <el-button type="primary" @click="onSubmit" class="keyAreaAnalysis-sumbit">保存</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, reactive } from 'vue';
import { ElForm } from 'element-plus';
import keyAreaAnalysis from '@/services/view/page-diy/key-area-analysis/index';
import Demo from '../common/pd-csd-key-area-analysis-tree.vue';
import CommonService from '@/services/common/common';
import { useStore } from 'vuex';
import { cloneDeep } from 'lodash';
import useCurrentInstance from '@/utils/use-current-instance';
import { getTreeExpandKeys } from '@/utils';
export default defineComponent({
  components: {
    Demo,
  },
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const store = useStore();
    const ruleForm = ref(ElForm);
    const projectProduction = ref({
      componentTitle: '',
    });
    let homeOptionData = reactive<any>({});
    const rules = {
      componentTitle: [
        {
          required: true,
          message: '请输入项目标题',
          trigger: 'blur',
        },
      ],
    };
    let getAnalysisTreeDataLoading = ref<boolean>(true);
    let formInline = reactive<any>({
      analysisObject: [], //选择中的树节点
    });
    const analysisObjectExpanedKeys = ref<number[]>([]);
    const analysisObjectData = ref<any[]>([]); //存放treeData数据
    const loading = ref<boolean>(true);

    // 提交表单事件
    const onSubmit = async () => {
      try {
        ruleForm.value.validate(async (valid: boolean) => {
          if (valid) {
            console.log(formInline.analysisObject);
            if (!formInline.analysisObject.length) {
              return proxy.$message.error('请最少选择一个节点');
            }
            const obj = {
              componentCode: homeOptionData.componentCode,
              id: homeOptionData.id,
              componentTitle: projectProduction.value.componentTitle,
              treeList: [...formInline.analysisObject],
            };
            const res = await keyAreaAnalysis.saveData(obj);
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
    // 获取区域列表数据
    const getAnalysisTreeData = async (param: { treeType: number }) => {
      try {
        const res = await CommonService.getEmsTreeListWidthoutLocation(param);
        console.log(res);
        if (res && res.code === 200 && res.success) {
          analysisObjectData.value = res.data || [];
          analysisObjectExpanedKeys.value = getTreeExpandKeys(analysisObjectData.value, 'id', 'childTree');
        } else {
          loading.value = false;
        }
      } catch (err) {
        loading.value = false;
      } finally {
        getAnalysisTreeDataLoading.value = false;
      }
    };
    // 获取总体数据
    const getTotalList = async () => {
      try {
        loading.value = true;
        const res = await keyAreaAnalysis.getInitData(homeOptionData.id);
        console.log(res, '获取总体数据');
        if (res.code === 200 && res.success) {
          // 创建组件 尚未配置 res.data为null 有值则赋值
          if (!res.data) {
            return;
          } else {
            projectProduction.value.componentTitle = res.data.componentTitle;
            formInline.analysisObject = res.data.treeList;
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (err) {
        if (!(err as any)?.code?.includes('4f0')) {
          return proxy.$message.error('操作失败');
        }
      } finally {
        loading.value = false;
      }
    };
    // 获取树组件父节点数据
    const getTreeParentData = (data: number[]) => {
      formInline.analysisObject = cloneDeep(data);
    };

    onMounted(async () => {
      homeOptionData = store.state.homeOption;
      await getAnalysisTreeData({ treeType: 1 });
      await getTotalList();
    });

    return {
      getAnalysisTreeDataLoading,
      projectProduction,
      rules,
      ruleForm,
      loading,
      onSubmit,
      getAnalysisTreeData,
      formInline,
      analysisObjectData,
      analysisObjectExpanedKeys,
      getTreeParentData,
    };
  },
});
</script>
<style lang="less" scoped>
.keyAreaAnalysis {
  .keyAreaAnalysis-area {
    border: 1px solid var(--iot-border-color);
    margin-top: 20px;
    min-height: 280px;
    overflow-y: auto;
    .keyAreaAnalysis-area-header {
      background-color: #1890ff;
      color: #ffffff;
      height: 30px;
      line-height: 30px;
      text-align: center;
    }
  }
  .keyAreaAnalysis-sumbit {
    margin-top: 20px;
  }
}
</style>
