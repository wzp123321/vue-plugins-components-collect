<!-- @format -->

<template>
  <div class="wrap" v-drag>
    <el-dialog v-model="dialogVisible" :title="`${title}-属性设置`" :width="width" :close-on-click-modal="false">
      <SettingFormContainer>
        <!-- 项目介绍 -->
        <ProjectProductionSetting
          v-if="type === SETTING_TYPES.PROJECT_PRODUCTION && dialogVisible"
          @closeDialog="closeDialog"
        ></ProjectProductionSetting>
        <!-- 能耗排名 -->
        <EnergyRankSetting
          v-if="type === SETTING_TYPES.ENERGY_RANK && dialogVisible"
          @closeDialog="closeDialog"
        ></EnergyRankSetting>
        <!-- 同环比概览 -->
        <SequentialOverview
          v-if="type === SETTING_TYPES.SEQUENTIAL_SURVEY && dialogVisible"
          @closeDialog="closeDialog"
        ></SequentialOverview>
        <!-- 单位面积 -->
        <UnitArea
          v-if="type === SETTING_TYPES.UNIT_AREA_ENERGY_RANK && dialogVisible"
          @closeDialog="closeDialog"
        ></UnitArea>
        <!-- kpi仪表盘 -->
        <KpiDasheboard v-if="type === SETTING_TYPES.KPI && dialogVisible" @closeDialog="closeDialog"></KpiDasheboard>
        <!-- 重点区域用能 -->
        <KeyAreaAnalysis
          v-if="type === SETTING_TYPES.EMPHASIS_AREA_ENERGY && dialogVisible"
          @closeDialog="closeDialog"
        ></KeyAreaAnalysis>
        <!-- 能源成本分析 -->
        <EnergyCostAnalysis
          v-if="type === SETTING_TYPES.ENERGY_COST_ANALYSIS && dialogVisible"
          @closeDialog="closeDialog"
        ></EnergyCostAnalysis>
        <!-- 关联分析 -->
        <AssociationAnalysis
          v-if="type === SETTING_TYPES.RELATION_ANALYSIS && dialogVisible"
          @closeDialog="closeDialog"
        ></AssociationAnalysis>
        <!-- 用能分项 -->
        <EnergyItemRatio
          v-if="type === SETTING_TYPES.ENERGY_ITEM_RATIO && dialogVisible"
          @closeDialog="closeDialog"
        ></EnergyItemRatio>
      </SettingFormContainer>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from 'vue';
// config
import { SETTING_TYPES } from './config/index';
// components
import SettingFormContainer from './components/pd-csd-setting-form-container.vue';
import ProjectProductionSetting from './components/pd-csd-project-production-setting.vue';
import EnergyRankSetting from './components/pd-csd-energy-rank-setting.vue';
import SequentialOverview from './components/pd-csd-sequential-overview.vue';
import UnitArea from './components/pd-csd-unit-area.vue';
import KpiDasheboard from './components/pd-csd-kpi-dashboard.vue';
import KeyAreaAnalysis from './components/pd-csd-key-area-analysis.vue';
import EnergyCostAnalysis from './components/pd-csd-energy-cost-setting.vue';
import AssociationAnalysis from './components/pd-csd-association-analysis.vue';
import EnergyItemRatio from './components/pd-csd-energy-item-ratio.vue';
interface SettingState {
  dialogVisible: Boolean;
}
export default defineComponent({
  name: 'ComponentSettingDialog',
  props: {
    // 类型
    type: {
      type: String,
      default: '',
      // SETTING_TYPES.PROJECT_PRODUCTION || SETTING_TYPES.ENERGY_RANK
    },
    // 宽度
    width: {
      type: String,
      default: '40%',
    },
    // 组件名
    title: {
      type: String,
      default: '',
    },
  },
  components: {
    SettingFormContainer,
    ProjectProductionSetting,
    EnergyRankSetting,
    SequentialOverview,
    UnitArea,
    KpiDasheboard,
    KeyAreaAnalysis,
    EnergyCostAnalysis,
    AssociationAnalysis,
    EnergyItemRatio,
  },
  setup(props) {
    const settingState = reactive<SettingState>({
      dialogVisible: false,
    });
    // 弹框类型
    const type = computed(() => {
      return props.type;
    });
    // 弹框标题
    const title = computed(() => {
      return props.title;
    });
    // 弹框宽度
    const width = computed(() => {
      return props.width;
    });
    // 打开
    const show = () => {
      settingState.dialogVisible = true;
    };
    // 关闭弹框
    const closeDialog = () => {
      settingState.dialogVisible = false;
    };
    return {
      ...toRefs(settingState),
      SETTING_TYPES,
      type,
      title,
      width,
      show,
      closeDialog,
    };
  },
});
</script>
