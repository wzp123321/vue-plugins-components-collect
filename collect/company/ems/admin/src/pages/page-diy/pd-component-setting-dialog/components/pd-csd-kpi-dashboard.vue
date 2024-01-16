<template>
  <el-form
    :model="projectProduction"
    :rules="rules"
    ref="ruleForm"
    label-position="right"
    label-width="120px"
    v-loading="projectProduction.loading"
  >
    <el-form-item label="项目标题" prop="componentTitle" v-show="!projectProduction.loading">
      <el-input
        v-inputFilter:search="{ allowSpace: false }"
        v-model.trim="projectProduction.componentTitle"
        :maxlength="18"
        placeholder="请输入项目标题"
      ></el-input>
    </el-form-item>
    <el-form-item
      label="指标类型"
      prop="indicatorsSelected"
      style="text-align: left"
      v-show="!projectProduction.loading"
    >
      <el-radio-group v-model="projectProduction.indicatorsSelected" @change="changeIndicatorsSelected">
        <el-radio v-for="item in projectProduction.indicatorsArr" :key="item.kpiType" :label="item.kpiType">{{
          item.kpiName
        }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="能源类型" v-show="!projectProduction.loading">
      <el-select v-model="projectProduction.energyType" placeholder="请选择" @change="changeEnergy">
        <el-option
          v-show="projectProduction.indicatorsSelected === 1"
          v-for="item in projectProduction.energyTypeArr"
          :key="item.energyCode"
          :label="item.energyCodeName"
          :value="item.energyCode"
        >
        </el-option>
        <el-option
          v-show="projectProduction.indicatorsSelected === 2"
          v-for="item in projectProduction.energyTypeArr"
          :key="item.energyCodeId"
          :label="item.energyCodeName"
          :value="item.energyCodeId"
        >
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="百分比区间配置" v-show="!projectProduction.loading">
      <div style="text-align: left; color: #3498db; font-size: 14px; word-break: break-all; white-space: normal">
        区间范围是大于下限值,小于等于上限值,修改“重点关注”百分比会联动修改“关注”和“紧急关注”百分比
      </div>
      <!-- <div style="text-align: left; color: #3498db; font-size: 14px"></div> -->
    </el-form-item>
    <div class="focus" v-show="!projectProduction.loading">
      <el-form-item label="关注">
        <el-input v-model="input0" disabled class="mr5"><template #append>%</template></el-input
        >~<el-input v-model.number="projectProduction.input1" class="ml7" disabled
          ><template #append>%</template></el-input
        >
      </el-form-item>
      <el-form-item label="重点关注" required>
        <!--  style="margin-left: 8px" -->
        <el-col :span="11">
          <el-form-item prop="input1">
            <el-input
              v-model="projectProduction.input1"
              :maxlength="6"
              show-word-limit
              @keyup="projectProduction.input1 = Number(String(projectProduction.input1).replace(/^(0+)|[^\d]+/g, ''))"
              ><template #append>%</template></el-input
            >
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2" style="margin: 0 5px 0 7px">~</el-col>
        <el-col :span="11">
          <el-form-item prop="input2">
            <el-input
              v-model="projectProduction.input2"
              :maxlength="6"
              show-word-limit
              @keyup="projectProduction.input2 = Number(String(projectProduction.input2).replace(/^(0+)|[^\d]+/g, ''))"
              ><template #append>%</template></el-input
            >
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="紧急关注">
        <el-input v-model="projectProduction.input2" class="mr5" disabled><template #append>%</template></el-input>
        ~
        <el-input v-model="input3" class="mr7" disabled><template #append>%</template></el-input>
      </el-form-item>
    </div>
    <div style="text-align: center" v-show="!projectProduction.loading">
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </div>
  </el-form>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import kpi from '../../../../services/view/page-diy/kpi-dashboard';
import useCurrentInstance from '../../../../utils/use-current-instance';
import { useStore } from 'vuex';
import { ElForm } from 'element-plus';
import { cloneDeep } from 'lodash';
interface KpiState {
  componentTitle: string;
  indicatorsSelected: string | number;
  indicatorsArr: { kpiType: number; kpiName: string }[];
  energyType: string;
  energyTypeArr: any;
  input1: number | string;
  input2: number | string;
  loading: boolean;
}
export default defineComponent({
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const store = useStore();
    const ruleForm = ref(ElForm);
    const energyTypeCopy = ref<string>('');
    const kpiTypeCopy = ref<string>();
    const projectProduction = ref<KpiState>({
      componentTitle: '',
      indicatorsSelected: 1,
      indicatorsArr: [
        { kpiType: 1, kpiName: '节能考核' },
        { kpiType: 2, kpiName: 'KPI管理' },
      ],
      energyType: '',
      energyTypeArr: [],
      input1: 15,
      input2: 30,
      loading: false,
    });
    const input0 = ref<number>(0);
    const input3 = ref<string>('--');
    let arr: any;
    let homeOptionData = reactive<any>({});
    const rules = {
      componentTitle: [
        {
          required: true,
          message: '请输入项目标题',
          trigger: 'blur',
        },
      ],
      indicatorsSelected: [
        {
          required: true,
          message: '请选择指标类型',
          trigger: 'change',
        },
      ],
      energyType: [
        {
          required: true,
          message: '请选择能源类型',
          trigger: 'change',
        },
      ],
      input1: [
        {
          required: true,
          message: '请填入数据',
          trigger: 'blur',
        },
      ],
      input2: [
        {
          required: true,
          message: '请填入数据',
          trigger: 'blur',
        },
      ],
    };
    // 初始化kpi配置
    const getKpiList = async () => {
      try {
        projectProduction.value.loading = true;
        const res = await kpi.getInitData(homeOptionData.id);
        if (res.code === 200 && res.success) {
          // console.log(res, '初始化数据');
          if (res.data) {
            projectProduction.value.componentTitle = res.data.componentTitle;
            projectProduction.value.indicatorsSelected = Number(res.data.kpiType);

            projectProduction.value.energyType = res.data.kpiType == 2 ? res.data.energyCodeId : res.data.energyCode;
            energyTypeCopy.value = cloneDeep(projectProduction.value.energyType);
            kpiTypeCopy.value = res.data.kpiType;
            projectProduction.value.input1 = res.data.keyPointLowPercentage;
            projectProduction.value.input2 = res.data.keyPointHighPercentage;
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (err) {
        if (!(err as any)?.code?.includes('4f0')) {
          return proxy.$message.error('初始化数据失败');
        }
      } finally {
        projectProduction.value.loading = false;
      }
    };
    // 获取能源类型数据
    const getEnergyList = async () => {
      try {
        const res = await kpi.getEnergyData(projectProduction.value.indicatorsSelected);
        if (res?.code === 200 && res?.success) {
          projectProduction.value.energyTypeArr = res.data || [];
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            // 后台设计2张表主键不同 故做下兼容
            if (projectProduction.value.indicatorsSelected === 1) {
              if (kpiTypeCopy.value !== '1') {
                projectProduction.value.energyType = res.data[0].energyCode;
              } else {
                projectProduction.value.energyType = energyTypeCopy.value;
              }
              arr = projectProduction.value.energyTypeArr.filter((item: any) => {
                return item.energyCode == projectProduction.value.energyType;
              });
              const index = projectProduction.value.energyTypeArr.findIndex(
                (item: any) => item.energyCode === energyTypeCopy.value,
              );
              if (index === -1 && kpiTypeCopy.value === '1') {
                projectProduction.value.energyType = '';
              }
            } else {
              if (kpiTypeCopy.value !== '2') {
                projectProduction.value.energyType = res.data[0].energyCodeId;
              } else {
                projectProduction.value.energyType = energyTypeCopy.value;
              }

              arr = projectProduction.value.energyTypeArr.filter((item: any) => {
                return item.energyCodeId == projectProduction.value.energyType;
              });
              const index = projectProduction.value.energyTypeArr.findIndex(
                (item: any) => item.energyCodeId === energyTypeCopy.value,
              );
              if (index === -1 && kpiTypeCopy.value === '2') {
                projectProduction.value.energyType = '';
              }
            }
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (err) {
        console.log(JSON.stringify(err), err, (err as any)?.code);
        if (!(err as any)?.code?.includes('4f0')) {
          proxy.$message.error('获取能源类型数据失败');
        }
      }
    };

    // 切换指标类型
    const changeIndicatorsSelected = () => {
      projectProduction.value.energyTypeArr = [];
      // projectProduction.value.energyType = '';
      getEnergyList();
    };
    // 切换能源类型
    const changeEnergy = (val: any) => {
      if (projectProduction.value.indicatorsSelected === 1) {
        if (projectProduction.value.energyTypeArr.length > 0) {
          arr = projectProduction.value.energyTypeArr.filter((item: any) => {
            return item.energyCode == val;
          });
        }
      } else {
        if (projectProduction.value.energyTypeArr.length > 0) {
          arr = projectProduction.value.energyTypeArr.filter((item: any) => {
            return item.energyCodeId == val;
          });
        }
      }
    };
    // 保存配置
    const onSubmit = () => {
      try {
        if (!projectProduction.value.energyType) {
          return proxy.$message.error('能源类型不能为空');
        }
        if (projectProduction.value.input1 != 0 && projectProduction.value.input2 != 0) {
          if (!projectProduction.value.input1 || !projectProduction.value.input2) {
            return proxy.$message.error('重点关注区间不能为空');
          }
        }

        if (Number(projectProduction.value.input2) <= Number(projectProduction.value.input1)) {
          return proxy.$message.error('重点关注区间下限值要小于上限值');
        }
        ruleForm.value.validate(async (valid: boolean) => {
          if (valid) {
            const obj = {
              componentCode: homeOptionData.componentCode,
              componentTitle: projectProduction.value.componentTitle,
              energyCode: arr[0].energyCode,
              energyCodeId: arr[0].energyCodeId,
              energyCodeName: arr[0].energyCodeName,
              energyCodeUnit: arr[0].energyCodeUnit,
              id: homeOptionData.id,
              keyPointHighPercentage: projectProduction.value.input2,
              keyPointLowPercentage: projectProduction.value.input1,
              kpiType: projectProduction.value.indicatorsSelected,
              quotaType: arr[0].quotaType,
            };
            const res = await kpi.saveData(obj);
            if (res.code === 200 && res.success) {
              context.emit('closeDialog');
              proxy.$message.success(res.message);
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message);
              }
            }
          } else {
            return false;
          }
        });
      } catch (err) {
        if (!(err as any)?.code?.includes('4f0')) {
          proxy.$message.error('操作失败');
        }
      }
    };
    onMounted(async () => {
      homeOptionData = store.state.homeOption;
      await getKpiList();
      await getEnergyList();
    });
    return {
      projectProduction,
      onSubmit,
      rules,
      changeIndicatorsSelected,
      ruleForm,
      changeEnergy,
      input0,
      input3,
    };
  },
});
</script>
<style scoped lang="less">
:deep(.el-select) {
  width: 100%;
}
.focus {
  width: 490px;
  text-align: left;
  :deep(.el-input__inner) {
    width: 110px;
    height: 38px;
  }
  :deep(.el-input) {
    width: 110px;
  }
}
</style>
