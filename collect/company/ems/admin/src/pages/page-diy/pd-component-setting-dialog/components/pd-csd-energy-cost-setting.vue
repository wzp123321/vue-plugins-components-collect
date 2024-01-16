<!-- @format -->

<template>
  <el-form :model="energyCost" :rules="rules" ref="ruleForm" v-loading="loading">
    <el-form-item label="项目标题" prop="componentTitle" v-show="!loading">
      <el-input
        v-model.trim="energyCost.componentTitle"
        :maxlength="18"
        v-inputFilter:search="{ allowSpace: false }"
        placeholder="请输入项目标题"
      ></el-input>
    </el-form-item>

    <el-form-item label="能源类型" prop="selectedArr" v-show="!loading">
      <el-checkbox-group v-model="energyCost.selectedArr" style="text-align: left">
        <el-checkbox v-for="item in energyCost.energyTypeList" :key="item.code" :label="item.name"></el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item style="text-align: center; padding-top: 10px" v-show="!loading">
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </el-form-item>
  </el-form>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, onMounted, reactive, nextTick } from 'vue';
// services
import energyCostSetting from '@/services/view/page-diy/energy-cost-setting';
import useCurrentInstance from '@/utils/use-current-instance';
import { ElForm } from 'element-plus';
import { useStore } from 'vuex';

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
    energyCostDetail: {
      type: Object as PropType<pageDiyData.IntroduceData>,
      default: {},
    },
  },
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const store = useStore();
    const ruleForm = ref(ElForm);
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
    const energyCost = ref<{
      componentTitle: string;
      energyTypeList: any[];
      selectedArr: string[];
    }>({
      componentTitle: '',
      energyTypeList: [],
      selectedArr: [],
    });
    // 校验规则
    const rules = {
      componentTitle: [
        {
          required: true,
          message: '请输入项目标题',
          trigger: 'blur',
        },
      ],
      selectedArr: [
        {
          type: 'array',
          required: true,
          message: '请选择能源类型',
          trigger: 'change',
        },
      ],
    };
    const getEnergyCode = async () => {
      try {
        const res = await energyCostSetting.getEnergyCode();
        if (res.code === 200 && res.success) {
          energyCost.value.energyTypeList = res.data || [];
        } else {
          loading.value = false;
        }
      } catch (err) {
        loading.value = false;
        return proxy.$message.error('获取能源类型数据失败');
      }
    };
    // 获取数据
    const getList = async () => {
      try {
        loading.value = true;
        const res = await energyCostSetting.getInitData(homeOptionData.id);
        if (res.code === 200 && res.success) {
          energyCost.value.componentTitle = (res.data && res.data.title) || '';
          if (
            res.data &&
            res.data.energyCodeList &&
            res.data.energyCodeList.length &&
            Array.isArray(res.data.energyCodeList)
          ) {
            res.data.energyCodeList.forEach(function (e: any) {
              if (energyCost.value.energyTypeList) {
                const newData: any = energyCost.value.energyTypeList.find((item: any) => {
                  return item.code === e;
                });
                if (newData) {
                  energyCost.value.selectedArr.push(newData.name);
                }
              } else {
                energyCost.value.selectedArr = [];
              }
            });
          } else {
            energyCost.value.selectedArr = [];
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (err) {
        console.log(err);
        if (!(err as any)?.code?.includes('4f0')) {
          proxy.$message.error('操作失败');
        }
      } finally {
        loading.value = false;
      }
    };
    // 提交
    const onSubmit = async () => {
      try {
        let flag;
        ruleForm.value.validate((valid: boolean) => {
          if (valid) {
            flag = true;
          } else {
            return false;
          }
        });
        if (flag) {
          let arr: string[] = [];
          energyCost.value.energyTypeList.filter((item: any) => {
            for (let i = 0; i < energyCost.value.selectedArr.length; i++) {
              if (item.name == energyCost.value.selectedArr[i]) {
                arr.push(item.code);
              }
            }
          });
          const obj = {
            energyCodeList: arr,
            id: homeOptionData.id,
            title: energyCost.value.componentTitle,
          };
          const res = await energyCostSetting.saveData(obj);
          if (res.code === 200 && res.success) {
            context.emit('closeDialog');
            proxy.$message.success(res.message ?? '操作成功');
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              proxy.$message.error(res.message ?? '操作失败');
            }
          }
        }
      } catch (err) {
        if (!(err as any)?.code?.includes('4f0')) {
          proxy.$message.error('操作失败');
        }
      }
    };

    onMounted(async () => {
      homeOptionData = store.state.homeOption;
      await getEnergyCode();
      await getList();
      nextTick(() => {
        if (ruleForm.value) {
          ruleForm.value.clearValidate();
        }
      });
    });
    return { energyCost, rules, loading, onSubmit, ruleForm };
  },
});
</script>
<style lang="less" scoped></style>
