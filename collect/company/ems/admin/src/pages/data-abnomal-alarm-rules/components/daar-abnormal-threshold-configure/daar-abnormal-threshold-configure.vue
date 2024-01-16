<template>
  <div class="daar-abnormal-threshold-configure" id="daar-abnormal-threshold-configure">
    <div class="flex-row-justify-center">
      <sub-title title="异常区间及阈值设置" class="mt32 mb16"></sub-title>
      <EnergyCodeRadio
        :energy-code="abnormalThresholdConfigure.energyCode"
        :energy-code-list="abnormalThresholdConfigure.energyCodeList"
        @setEnergyCode="abnormalThresholdConfigure.setEnergyCode"
      ></EnergyCodeRadio>
    </div>
    <table style="width: 100%" v-loading="abnormalThresholdConfigure.loading">
      <thead>
        <tr>
          <th>能源异常类型</th>
          <th v-if="mapIsRatioAbnormal()">异常描述</th>
          <th>能耗区间下限</th>
          <th>能耗区间上限</th>
          <th>{{ mapIsRatioAbnormal() ? '普通异常阈值' : '异常阈值' }}</th>
          <th v-if="mapIsRatioAbnormal()">严重异常阈值</th>
          <th>告警等级</th>
          <th v-if="mapIsRatioAbnormal()">状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in abnormalThresholdConfigure.dataSource"
          :key="'realtime_' + index"
          :class="{ stripe: item.thresholdType === EDaarThresholdType.用能下降 }"
        >
          <td
            :rowspan="mapRowspan('abnormalTypeName', index, item.abnormalType)"
            v-if="mapRowspan('abnormalTypeName', index, item.abnormalType) !== 0"
          >
            {{ mapAbnormalName() }}
          </td>
          <td
            class="threshold-name"
            :rowspan="mapRowspan('thresholdName', index, item.thresholdName)"
            v-if="mapIsRatioAbnormal() && mapRowspan('thresholdName', index, item.thresholdName) !== 0"
          >
            {{ item.thresholdName }}
          </td>
          <td rowspan="1" :class="{ stripe: mapRowStripe(item.thresholdType, item.id) }">
            {{ item.lowerLimit !== '' && item.lowerLimit !== null ? item.lowerLimit : '-' }}
          </td>
          <td rowspan="1" :class="{ stripe: mapRowStripe(item.thresholdType, item.id) }">
            {{ item.upperLimit !== '' && item.upperLimit !== null ? item.upperLimit : '-' }}
          </td>
          <td rowspan="1" :class="{ stripe: mapRowStripe(item.thresholdType, item.id) }">
            {{ item.general !== '' && item.general !== null ? `${transferPercent(Number(item.general), 100)}%` : '-' }}
          </td>
          <td rowspan="1" v-if="mapIsRatioAbnormal()" :class="{ stripe: mapRowStripe(item.thresholdType, item.id) }">
            {{ item.serious !== '' && item.serious !== null ? `${transferPercent(Number(item.serious), 100)}%` : '-' }}
          </td>
          <td
            :rowspan="mapRowspan('alarmLevel', index, item.alarmLevel)"
            v-if="mapRowspan('alarmLevel', index, item.alarmLevel) !== 0"
          >
            <LevelWrapper :level="item.alarmLevel" :levelText="item.alarmLevelText"></LevelWrapper>
          </td>
          <td
            class="status"
            :rowspan="mapRowspan('thresholdName', index, item.thresholdName)"
            v-if="mapIsRatioAbnormal() && mapRowspan('thresholdName', index, item.thresholdName) !== 0"
          >
            <el-switch
              :active-value="EThresboldStatus.开启"
              :inactive-value="EThresboldStatus.关闭"
              :model-value="item.status"
              @change="abnormalThresholdConfigure.show(item)"
            />
          </td>
          <td
            class="operate"
            :rowspan="mapRowspan('thresholdName', index, item.thresholdName)"
            v-if="mapRowspan('thresholdName', index, item.thresholdName) !== 0"
          >
            <button text @click="handleEdit(item)">编辑</button>
            <button text @click="showLog(item.id, item.thresholdType)">查看日志</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      class="common-table__empty"
      v-show="abnormalThresholdConfigure.dataSource?.length === 0 && !abnormalThresholdConfigure.loading"
    >
      <img src="../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
      <p>暂无数据</p>
    </div>

    <!-- 修改状态 -->
    <div v-drag="abnormalThresholdConfigure.statusUpdateVisible">
      <el-dialog
        v-model="abnormalThresholdConfigure.statusUpdateVisible"
        title="编辑状态"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="abnormalThresholdConfigure.handleClose"
      >
        <el-form @submit.native.prevent :model="abnormalThresholdConfigure.updateStatusParams" label-width="50px">
          <el-form-item label="原因">
            <el-input
              style="width: 100%"
              type="textarea"
              placeholder="请输入"
              maxlength="128"
              v-model="abnormalThresholdConfigure.updateStatusParams.reason"
              v-inputFilter:search
            />
          </el-form-item>
          <div class="flex-row-center-center">
            <button @click="abnormalThresholdConfigure.handleClose">取消</button>
            <button primary @click="abnormalThresholdConfigure.confirmChangeStatus">确认</button>
          </div>
        </el-form>
      </el-dialog>
    </div>
    <!-- 日志 -->
    <ReadLogDialog
      ref="alarmLogRef"
      :id="id"
      :abnormalType="String(abnormalType)"
      :thresholdType="String(thresholdType)"
      :queryUrl="EDaarLogType.查询实时异常配置日志"
      :energyCode="abnormalThresholdConfigure.energyCode"
    ></ReadLogDialog>
    <!-- 编辑 -->
    <AlarmSectionConfigureComp
      ref="alarmConfigureRef"
      :energyUnit="abnormalThresholdConfigure.energyUnit"
      @refresh="abnormalThresholdConfigure.query()"
    ></AlarmSectionConfigureComp>
  </div>
</template>
<script lang="ts">
import { ref, defineComponent, nextTick } from 'vue';
import AbnormalThresholdConfigure from './daar-abnormal-threshold-configure.service';
import { EThresboldStatus } from '../daar-analyse-thresholdvalue-configure/daar-analyse-thresholdvalue-configure.api';
import { Daar_IEnergyVO, Daar_IRealtimeAbnormalThresholdVO } from './daar-abnormal-threshold-configure.api';
import { EDaarAbnormalType, EDaarLogType, EDaarThresholdType } from '../../data-abnomal-alarm-rules.api';

import { transferPercent } from '@/utils/index';

import AlarmSectionConfigureComp from './daar-atc-section-configure/daar-atc-section-configure.vue';
import LevelWrapper from '../daar-level-wrapper/daar-ratc-level-wrapper.vue';
import EnergyCodeRadio from '../daar-energycode-radio/daar-energycode-radio.vue';
import ReadLogDialog from '../daar-log-dialog/daar-log-dialog.vue';

export default defineComponent({
  props: {
    abnormalType: {
      type: Number,
      default: 2,
    },
  },
  components: {
    LevelWrapper,
    EnergyCodeRadio,
    ReadLogDialog,
    AlarmSectionConfigureComp,
  },
  setup(props) {
    const abnormalThresholdConfigure = new AbnormalThresholdConfigure();
    abnormalThresholdConfigure.abnormalType = props.abnormalType;

    const alarmLogRef = ref();
    const alarmConfigureRef = ref();
    const id = ref<number>(-1);
    const thresholdType = ref<string>('');

    function load(list: Daar_IEnergyVO[]) {
      console.log('%c✨✨异常区间加载成功✨✨', 'font-size: 24px', props.abnormalType, list);
      abnormalThresholdConfigure.initEnergyCodeList(list);
    }

    function mapRowspan(column: string, rowIndex: number, value: string | EDaarAbnormalType) {
      let span = 1;
      switch (column) {
        case 'abnormalTypeName':
        case 'alarmLevel':
          span = rowIndex === 0 ? abnormalThresholdConfigure.dataSource.length : 0;
          break;
        case 'thresholdName':
          const i = abnormalThresholdConfigure.dataSource.findIndex((item) => {
            return item.thresholdName === value;
          });
          span =
            i === rowIndex
              ? abnormalThresholdConfigure.dataSource?.filter((item) => {
                  return item.thresholdName === value;
                })?.length
              : 0;
          break;
      }
      return span;
    }
    function mapRowStripe(thresholdType: EDaarThresholdType, id: number) {
      const list = abnormalThresholdConfigure.dataSource.filter((item) => {
        return item.thresholdType === thresholdType;
      });
      return (
        list?.findIndex((item) => {
          return item.id === id;
        }) %
          2 ===
        1
      );
    }
    function mapIsRatioAbnormal() {
      return props.abnormalType === EDaarAbnormalType.用能异常;
    }
    function mapAbnormalName() {
      return props.abnormalType === EDaarAbnormalType.用能异常 ? '用能异常' : '边界异常';
    }
    function showLog(value: number, thresholdTypeVal: string) {
      id.value = value;
      thresholdType.value = thresholdTypeVal;
      if (alarmLogRef.value) {
        alarmLogRef.value.show();
      }
    }
    function handleEdit(row: Daar_IRealtimeAbnormalThresholdVO) {
      const list = abnormalThresholdConfigure.dataSource?.filter((item) => {
        return item.thresholdType === row.thresholdType;
      });
      nextTick(() => {
        if (alarmConfigureRef.value) {
          alarmConfigureRef.value.show(list, props.abnormalType);
        }
      });
    }

    return {
      abnormalThresholdConfigure,
      id,
      thresholdType,
      EDaarAbnormalType,
      EDaarLogType,
      EThresboldStatus,
      alarmConfigureRef,
      alarmLogRef,
      EDaarThresholdType,

      transferPercent,
      load,
      mapRowspan,
      mapIsRatioAbnormal,
      mapRowStripe,
      mapAbnormalName,
      showLog,
      handleEdit,
    };
  },
});
</script>
<style lang="less" scoped>
#daar-abnormal-threshold-configure {
  min-height: 166px;

  .daar-title {
    padding-left: 12px;
  }

  table {
    border: 1px solid var(--color-text-divider);
    border-bottom: none;
    border-right: none;

    thead > tr > th,
    tbody > tr > td {
      // border-right: 1px solid var(--color-text-divider);
      border-bottom: 1px solid var(--color-text-divider);
    }

    // thead > tr > th:last-child,
    // tbody > tr > td:last-child {
    //   border-right: none;
    // }

    tbody > tr:nth-child(even) > td {
      background-color: transparent;
    }
  }

  table tbody {
    tr td {
      background-color: transparent;
      border-bottom: 1px solid var(--color-text-divider);
      border-right: 1px solid var(--color-text-divider);

      // &.operate {
      //   border-right: none;
      // }
    }

    // tr.stripe {
    //   td.threshold-name,
    //   td.status,
    //   td.operate {
    //     background-color: var(--color-table-body);
    //   }
    // }

    // tr td.stripe {
    //   background-color: var(--color-table-body);
    // }
  }

  table thead {
    tr th {
      &:not(:last-child) {
        border-right: 1px solid var(--color-text-divider);
        border-bottom: 1px solid var(--color-text-divider);
      }
    }
  }

  .common-table__empty {
    height: 100%;
  }
}
</style>
