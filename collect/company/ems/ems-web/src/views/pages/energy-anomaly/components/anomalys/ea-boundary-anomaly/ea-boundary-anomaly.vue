<template>
  <div class="ea-boundary-anomaly" id="ea-boundary-anomaly">
    <img class="ea-ba-ico" src="../../../../../../assets/img/energy-anomaly/ea-abnormal.png" alt="图标" />

    <div class="ea-ba-container">
      <label>变化点</label>
      <span class="bold">{{ anomalyDetail.abnormalTime }}</span>
      <label>变化点前期中位数</label>
      <div class="flex-row-start-center">
        <span class="bold">{{ anomalyDetail.beforeValueStr }}</span>
        <span class="ml8">{{ anomalyDetail.unit }}</span>
      </div>
      <label>变化点后期中位数</label>
      <div class="flex-row-start-center">
        <span class="bold">{{ anomalyDetail.afterValueStr }}</span>
        <span class="ml8">{{ anomalyDetail.unit }}</span>
      </div>

      <span>是否触发边界条件</span>
      <el-radio-group
        v-if="anomalyDetail.triggerFlag === EBoundaryType.未查看"
        v-model="triggleForm.isTriggle"
        @change="handleChange"
      >
        <el-radio :label="EBoundaryType.触发边界">触发</el-radio>
        <el-radio :label="EBoundaryType.未触发边界">未触发</el-radio>
      </el-radio-group>
      <span v-else class="tag">触发边界</span>

      <div class="ea-ba-form" v-show="triggleForm.isTriggle === EBoundaryType.未触发边界">
        <p>备注信息</p>
        <textarea
          placeholder="请输入异常处理的备注信息"
          v-model="triggleForm.remark"
          v-inputFilter:search
          :maxlength="100"
          v-show="triggleForm.isTriggle === EBoundaryType.未触发边界"
        ></textarea>
      </div>
    </div>

    <div :class="['rate', anomalyDetail.abnormalLevel === ANOMALY_LAVEL.SERIOUS ? 'serious' : '']">
      <span>抬升偏差值</span>
      <span class="precent">{{ anomalyDetail.deviationRateStr }}</span>
    </div>

    <!-- 按钮 -->
    <div class="ea-ba-btn mt20">
      <button @click="onClose">
        取消
      </button>
      <button
        primary
        :disabled="anomalyDetail.triggerFlag === EBoundaryType.未查看 && !triggleForm.isTriggle"
        @click="handleSubmit"
      >
        {{
          anomalyDetail.triggerFlag === EBoundaryType.触发边界
            ? '查看能源事件'
            : triggleForm.isTriggle === EBoundaryType.触发边界
            ? '确定并记录能源事件'
            : '确定'
        }}
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PropType, toRef, ref, inject } from 'vue';

import energyAnomalyService from '../../../services/energy-anomaly.service';

import { ANOMALY_LAVEL } from '@/config/enum';
import { EA_IBoundaryAnomalyInfo, EBoundaryType } from '../../../energy-anomaly.api';
import { EA_BA_IForm } from './ea-boundary-anomaly.api';
import message from '@/utils/message';
import { FResHandler, openBlankUrl } from '@/utils';

const PATH = '/web/eetEnergyEvent';

const props = defineProps({
  typeAnomalyDetail: {
    type: Object as PropType<EA_IBoundaryAnomalyInfo>,
    default: {},
  },
  id: {
    type: Number,
    default: 0,
  },
});

const triggleForm = ref<EA_BA_IForm>({
  isTriggle: '',
  remark: '',
});
const anomalyDetail = toRef(props, 'typeAnomalyDetail');
const loading = ref<boolean>(false);

const onClose = inject('handleClose') as () => void;
const handleRefresh = inject('handleRefresh') as () => void;

// 切换单选
const handleChange = () => {
  triggleForm.value.remark = '';
};

// 提交
const handleSubmit = () => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  if (anomalyDetail.value.triggerFlag === EBoundaryType.触发边界) {
    loading.value = false;
    linkToPage('', anomalyDetail.value.energyEventType, anomalyDetail.value.energyEventCreateTime);
  } else {
    if (triggleForm.value.isTriggle === EBoundaryType.触发边界) {
      handleAlarmTriggle().then(res => {
        if (res !== null && res !== undefined && res !== '') {
          console.log('保存并跳转能源事件，打开弹框', res, props.id);
          linkToPage(String(props.id ?? ''), '', '');
        }
      });
    } else {
      // dealAnomaly().then(res => {
      //   if (res) {
      //     handleAlarmTriggle();
      //   }
      // });
      handleAlarmTriggle();
    }
  }
};
/**
 * 保存
 */
const handleAlarmTriggle = () => {
  return new Promise(async resolve => {
    try {
      const params = {
        id: props.id,
        alarmId: props.typeAnomalyDetail.alarmId,
        triggerFlag: triggleForm.value.isTriggle,
        handleRemarks: !!triggleForm.value.remark ? triggleForm.value.remark : null,
      };
      const res = await energyAnomalyService.getBoundarySaveTriggle(params);
      const data = FResHandler(res);
      if (res?.success) {
        resolve(data);
        handleRefresh();
        message.success(res?.message ?? '操作成功');
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
      message.error(error as string);
    } finally {
      loading.value = false;
    }
  });
};
/**
 * 处理告警
 */
const dealAnomaly = () => {
  return new Promise(async resolve => {
    if (!triggleForm.value.remark) {
      message.error('请填写备注信息');
      loading.value = false;
      resolve(false);

      return;
    }
    try {
      const params = {
        alarmId: anomalyDetail.value.alarmId,
        handleRemarks: triggleForm.value.remark,
        operateType: '3',
      };
      const res = await energyAnomalyService.getAbnormalDeal(params);
      const data = FResHandler(res);
      if (data) {
        handleRefresh();
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      message.error(error as string);
      loading.value = false;
      resolve(false);
    }
  });
};
/**
 * 跳转能源事件
 * @param type 跳转后执行的操作类型
 * @param options 携带的参数
 */
const linkToPage = (boundaryId?: string, eventType?: string, energyEventCreateTime?: string) => {
  const params = {
    boundaryId,
    eventType,
    energyEventCreateTime,
  };
  window.sessionStorage.setItem('ems-anomaly-event-params', JSON.stringify(params));

  openBlankUrl(PATH);
};
</script>
<style lang="less" scoped>
#ea-boundary-anomaly {
  position: relative;
  width: 100%;
  padding-left: 20px;
  margin-top: 10px;

  .ea-ba-container {
    display: grid;
    grid-template-columns: 112px 1fr;
    row-gap: 24px;
    column-gap: 50px;

    text-align: left;

    span.bold {
      font-size: 24px;
      color: var(--color-text-title);
    }

    label {
      height: 20px;
      line-height: 20px;
    }

    span.tag {
      height: 24px;
      line-height: 24px;
      width: 66px;
      text-align: center;

      border-radius: 2px;
      color: rgba(255, 77, 79, 1);
      background-color: rgba(255, 241, 240, 1);
      border: 1px solid rgba(255, 204, 199, 1);
    }

    .el-radio-group {
      .el-radio + .el-radio {
        margin-left: 24px;
      }
    }

    .ea-ba-form {
      grid-column-start: span 2;

      p {
        color: var(--color-text-primary);
      }

      textarea {
        width: 100%;
        margin-top: 8px;

        height: 120px;
        resize: none;
      }
    }
  }

  .ea-ba-ico {
    position: absolute;
    top: 5px;
    left: 0;
  }

  div.rate {
    position: absolute;
    top: 89px;
    right: 0;

    display: flex;
    align-items: center;

    padding: 4px 12px;
    border-radius: 13px;
    background-color: rgba(245, 77, 66, 0.04);

    span.precent {
      color: rgba(244, 76, 65, 1);
      font-size: 16px;
      font-weight: 600;

      margin-left: 8px;
    }

    &.serious {
      background-color: var(--iot-anomaly-serious-bg-color);
      color: #fff;
      span.precent {
        color: #fff;
      }
    }
  }

  .ea-ba-btn {
    grid-column-start: span 2;
    text-align: right;
  }
}
</style>
