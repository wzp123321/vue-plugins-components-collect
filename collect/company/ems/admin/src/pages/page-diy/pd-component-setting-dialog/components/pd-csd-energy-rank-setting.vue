<!--
 * @Author: yut
 * @Date: 2023-11-28 15:30:11
 * @LastEditors: yut
 * @LastEditTime: 2024-01-05 11:32:15
 * @Descripttion: 
-->
<template>
  <div class="pd-csd-energy-rank-setting">
    <te-form
      :model="energyRankSetting"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      v-loading="energyRankSetting.loading"
    >
      <te-form-item label="项目标题" prop="componentTitle" class="mr2" v-show="!energyRankSetting.loading">
        <te-input
          v-model="energyRankSetting.componentTitle"
          :maxlength="18"
          v-inputFilter:search="{ allowSpace: false }"
          placeholder="请输入项目标题"
        ></te-input>
      </te-form-item>
      <te-form-item label="选择节点排名" prop="treeIds" v-show="!energyRankSetting.loading">
        <common-transfer
          v-model:modelValue="energyRankSetting.treeIds"
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
      <te-form-item label="能源分类选择" prop="energySelected" v-show="!energyRankSetting.loading">
        <te-select class="energySel" v-model="energyRankSetting.energySelected">
          <te-option
            v-for="item in energyRankSetting.energySelList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          ></te-option>
        </te-select>
      </te-form-item>
      <te-form-item style="text-align: center" v-show="!energyRankSetting.loading">
        <te-button type="primary" @click="onSubmit">保存</te-button>
      </te-form-item>
    </te-form>
  </div>
</template>
<script lang="ts" setup>
import CommonService from '@/services/common/common';
import energyRank from '@/services/view/page-diy/energy-rank-setting';
import store from '@/store';
import { getTreeExpandKeys } from '@/utils';
import message from '@/utils/message';
import { ElForm } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

interface DialogEnergyState {
  componentTitle: string;
  energySelList: any;
  energySelected: string;
  loading: boolean;
  treeIds: number[];
}

const energyRankSetting = reactive<DialogEnergyState>({
  componentTitle: '',
  energySelList: [],
  treeIds: [],
  energySelected: '',
  loading: true,
});

const switchItems = [
  { value: 1, label: '区域' },
  { value: 2, label: '业态' },
];

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
  selnodeRank: [
    {
      required: true,
      trigger: 'blur',
    },
  ],
  energySelected: [
    {
      required: true,
      trigger: 'blur',
      message: '请选择能源分类',
    },
  ],
  treeIds: [{ required: true, validator: validateNodeList, trigger: 'change' }],
};
let homeOptionData = ref<any>({});
// 获取tabs当前选中
const radioValue = ref(1);
const nodeCount = ref(0); //节点总数
const treeData = ref<any[]>([]);
const expandKeys = ref<number[]>([]);
const getAnalysisTreeDataLoading = ref(false);

const ruleForm = ref(ElForm);

//获取初始信息
const getInitSettingData = async () => {
  try {
    energyRankSetting.loading = true;
    const res = await energyRank.getInitData(homeOptionData.value.id);
    if (res.code == 200 && res.success) {
      console.log(res);
      energyRankSetting.componentTitle = (res.data && res.data.title) || '';
      radioValue.value = res?.data?.treeType ? Number(res?.data?.treeType) : 1;
      energyRankSetting.energySelected = '';
      if (res.data && res.data.energyCode) {
        const index = energyRankSetting.energySelList.findIndex((item: any) => {
          return item.code === res.data.energyCode;
        });
        if (index !== -1) {
          energyRankSetting.energySelected = res.data.energyCode;
        }
      }
      energyRankSetting.treeIds = res.data?.treeVoList?.map((item: any) => item.id) ?? [];
    } else {
      if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
        message.error(res.message);
      }
    }
  } catch (error: any) {
    if (!(error as any)?.code?.includes('4f0')) {
      message.error('操作失败');
    }
  } finally {
    energyRankSetting.loading = false;
  }
};

//获取初始下拉内容
const getListSelect = async () => {
  try {
    const res = await energyRank.getEnergyListSelect();
    if (res.code == 200 && res.success) {
      energyRankSetting.energySelList = res.data;
      console.log(energyRankSetting.energySelList);
    } else {
      energyRankSetting.loading = false;
    }
  } catch (error: any) {
    energyRankSetting.loading = false;
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

// 提交
const onSubmit = async () => {
  try {
    ruleForm.value.validate(async (valid: boolean) => {
      if (valid) {
        let obj = {
          title: energyRankSetting.componentTitle,
          id: homeOptionData.value.id,
          energyCode: energyRankSetting.energySelected,
          treeIdList: energyRankSetting.treeIds,
          treeType: String(radioValue.value),
        };
        const res = await energyRank.toSetEnergyRankData(obj);
        if (res.code === 200 && res.success) {
          emit('closeDialog');
          message.success(res.message || '保存成功');
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(res.message || '保存失败');
          }
        }
      } else {
        return false;
      }
    });
  } catch (error: any) {
    if (!(error as any)?.code?.includes('4f0')) {
      message.error('操作失败');
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

const updateTreeType = (value: number) => {
  radioValue.value = value;
  getAnalysisTreeData();
};

//单独触发校验
const changeValidate = () => {
  ruleForm.value.validateField('treeIds', () => {});
};

onMounted(async () => {
  homeOptionData.value = store.state.homeOption;
  await getListSelect();
  await getInitSettingData();
  await getAnalysisTreeData();
});
</script>
<style lang="less" scoped>
.pd-csd-energy-rank-setting {
  width: 100%;
  height: 100%;
  :deep(.te-select) {
    width: 100%;
  }
  :deep(.te-form-item__content) {
    justify-content: center;
  }
}
</style>
