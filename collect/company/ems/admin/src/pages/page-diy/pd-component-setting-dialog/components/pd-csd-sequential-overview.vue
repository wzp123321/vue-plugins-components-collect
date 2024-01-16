<template>
  <el-form :model="projectProduction" :rules="rules" ref="ruleForm" v-loading="loading">
    <el-form-item label="项目标题" prop="componentTitle" v-show="!loading">
      <el-input
        v-model.trim="projectProduction.componentTitle"
        :maxlength="18"
        v-inputFilter:search="{ allowSpace: false }"
        placeholder="请输入项目标题"
      ></el-input>
    </el-form-item>

    <el-form-item label="能源类型" prop="selectedArr" v-show="!loading">
      <el-checkbox-group v-model="projectProduction.selectedArr" style="text-align: left">
        <el-checkbox v-for="item in projectProduction.energyTypeList" :key="item.code" :label="item.name"></el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item style="text-align: center; padding-top: 10px" v-show="!loading">
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </el-form-item>
  </el-form>
</template>
<script lang="ts">
import { nextTick, defineComponent, PropType, ref, onMounted, reactive } from 'vue';
// services
import sequentialOverview from '../../../../services/view/page-diy/sequential-overview';
import useCurrentInstance from '../../../../utils/use-current-instance';
import { ElForm } from 'element-plus';
import { useStore } from 'vuex';
// import { ENERGYCODE } from '../config/index';
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
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const store = useStore();
    const ruleForm = ref(ElForm);
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
    // const projectProduction = ref(props.projectProductionDetail);
    const projectProduction = ref<{
      componentTitle: string;
      energyTypeList: any[];
      selectedArr: string[];
    }>({
      componentTitle: '',
      energyTypeList: [],
      selectedArr: [],
    });
    const loading = ref<boolean>(true);
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
        const res = await sequentialOverview.getEnergyCode({
          energyFlag: '1',
          parentCode: '',
        });
        if (res.code === 200 && res.success) {
          projectProduction.value.energyTypeList = res.data || [];
        } else {
          loading.value = false;
        }
      } catch (err) {
        loading.value = false;
      }
    };
    // 获取数据
    const getList = async () => {
      try {
        loading.value = true;
        const res = await sequentialOverview.getInitData(homeOptionData.id);
        if (res.code === 200 && res.success) {
          // projectProduction.value = res.data || {};
          projectProduction.value.componentTitle = (res.data && res.data.title) || '';
          if (res.data && res.data.energyCodes && res.data.energyCodes.length && Array.isArray(res.data.energyCodes)) {
            projectProduction.value.selectedArr = res.data.energyCodes.map((item: { name: string; code: string }) => {
              return item.name;
            });
          } else {
            projectProduction.value.selectedArr = [];
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (err) {
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
          projectProduction.value.energyTypeList.filter((item: any) => {
            for (let i = 0; i < projectProduction.value.selectedArr.length; i++) {
              if (item.name == projectProduction.value.selectedArr[i]) {
                arr.push(item.code);
              }
            }
          });
          const str = arr.join();
          const obj = {
            componentCode: homeOptionData.componentCode,
            energyCodes: str,
            id: homeOptionData.id,
            title: projectProduction.value.componentTitle,
          };
          const res = await sequentialOverview.saveData(obj);
          if (res.code === 200 && res.success) {
            context.emit('closeDialog');
            proxy.$message.success(res.message);
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              proxy.$message.error(res.message);
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
    return { projectProduction, rules, onSubmit, ruleForm, loading };
  },
});
</script>
<style lang="less" scoped></style>
