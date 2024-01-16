<!--
 * @Author: yut
 * @Date: 2024-01-04 20:34:15
 * @LastEditors: yut
 * @LastEditTime: 2024-01-05 11:28:21
 * @Descripttion: 
-->
<template>
  <div class="pd-csd-unit-area" v-loading="loading">
    <te-form :model="unitAreaForm" :rules="rules" ref="ruleForm" label-width="100px">
      <te-form-item label="项目标题" prop="componentTitle">
        <te-input
          v-model.trim="unitAreaForm.componentTitle"
          :maxlength="18"
          v-inputFilter:search="{ allowSpace: false }"
          placeholder="请输入项目标题"
        ></te-input>
      </te-form-item>

      <te-form-item label="选择节点排名" prop="treeIds">
        <common-transfer
          v-model:modelValue="unitAreaForm.treeIds"
          type="tree"
          ref="rgSelectRef"
          :tabDataList="switchItems"
          :clearable="false"
          :radioValue="radioValue"
          :loading="getAnalysisTreeDataLoading"
          :dataList="treeData"
          :nodeNum="nodeCount"
          :maxTags="10"
          :maxLength="200"
          :defaultProps="{ children: 'childTree', label: 'treeName' }"
          :expanedKeys="expandKeys"
          @updateTreeType="updateTreeType"
          @changeValidate="changeValidate"
        ></common-transfer>
      </te-form-item>
      <te-form-item style="text-align: center" labte-width="0">
        <te-button type="primary" @click="onSubmit">保存</te-button>
      </te-form-item>
    </te-form>
  </div>
</template>
<script lang="ts" setup>
import CommonService from '@/services/common/common';
import unitArea from '@/services/view/page-diy/unit-area';
import store from '@/store';
import { getTreeExpandKeys } from '@/utils';
import message from '@/utils/message';
import { ElForm } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
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
const switchItems = [
  { value: 1, label: '区域' },
  { value: 2, label: '业态' },
];
const ruleForm = ref(ElForm);
const loading = ref<boolean>(true);
const getAnalysisTreeDataLoading = ref<boolean>(true);
const radioValue = ref(1);
const nodeCount = ref(0); //节点总数
const treeData = ref<any[]>([]);
const expandKeys = ref<number[]>([]);
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
const unitAreaForm = ref<{
  componentTitle: string;
  treeIds: number[];
}>({
  componentTitle: '',
  treeIds: [],
});

const validateNodeList = (rule: any, value: any, callback: any) => {
  console.log('%c🚀 ~ pd-csd-energy-rank-setting.vue ~ 98行', 'font-size: 18px', value);
  if (!value?.length) {
    callback(new Error('请选择节点排名'));
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
  treeIds: [{ required: true, validator: validateNodeList, trigger: 'change' }],
};
// 获取配置数据
const getList = async () => {
  try {
    loading.value = true;
    const res = await unitArea.getInitData(homeOptionData.id);
    if (res.code == 200 && res.success) {
      // console.log(res, 'res');
      unitAreaForm.value.componentTitle = (res.data && res.data?.title) || '';
      radioValue.value = res?.data?.treeType ? Number(res?.data?.treeType) : 1;
      unitAreaForm.value.treeIds = res.data?.treeVOList?.map((item: any) => item.id) ?? [];
    } else {
      if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
        message.error(res.message);
      }
    }
  } catch (err) {
    if (!(err as any)?.code?.includes('4f0')) {
      message.error('初始化数据失败');
    }
  } finally {
    loading.value = false;
  }
};
// 获取分析对象
const getAnalysisTreeData = async () => {
  try {
    getAnalysisTreeDataLoading.value = true;
    const res = await CommonService.getEmsTreeListWidthoutLocation({ treeType: radioValue.value });
    if (res && res.code === 200 && res.success) {
      treeData.value = res.data || [];
      expandKeys.value = getTreeExpandKeys(treeData.value, 'id', 'childTree')?.map((item) => {
        return Number(item);
      });
    } else {
      treeData.value = [];
      expandKeys.value = [];
    }
  } catch (error) {
    expandKeys.value = [];
    treeData.value = [];
  } finally {
    getAnalysisTreeDataLoading.value = false;
    nodeCount.value = getNumber(treeData.value);
  }
};

const counter = (data: any) => {
  if (!data.childTree?.length) {
    return 1;
  }
  return (
    1 +
    data.childTree.reduce(function (prev: any, item: any) {
      return prev + counter(item);
    }, 0)
  );
};

const emit = defineEmits(['closeDialog']);

// 保存
const onSubmit = () => {
  try {
    ruleForm.value.validate(async (valid: boolean) => {
      if (valid) {
        const obj = {
          componentCode: homeOptionData.componentCode,
          energyCode: '00000',
          id: homeOptionData.id,
          title: unitAreaForm.value.componentTitle,
          treeIds: unitAreaForm.value.treeIds,
          treeType: String(radioValue.value),
        };
        const res = await unitArea.saveData(obj);
        if (res.code === 200 && res.success) {
          emit('closeDialog');
          message.success(res.message);
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(res.message);
          }
        }
      } else {
        return false;
      }
    });
  } catch (err) {
    if (!(err as any)?.code?.includes('4f0')) {
      message.error('保存失败');
    }
  }
};

const getNumber = (val: any) => {
  let count = 0;
  val.forEach((element: any) => {
    count += counter(element);
  });
  return count;
};

//单独触发校验
const changeValidate = () => {
  ruleForm.value.validateField('treeIds', () => {});
};

const updateTreeType = (value: number) => {
  radioValue.value = value;
  getAnalysisTreeData();
};

onMounted(async () => {
  homeOptionData = store.state.homeOption;
  await getList();
  await getAnalysisTreeData();
});
</script>
<style lang="less" scoped>
.pd-csd-unit-area {
  width: 100%;
  height: 100%;
  :deep(.te-form-item__content) {
    justify-content: center;
  }
}
</style>
