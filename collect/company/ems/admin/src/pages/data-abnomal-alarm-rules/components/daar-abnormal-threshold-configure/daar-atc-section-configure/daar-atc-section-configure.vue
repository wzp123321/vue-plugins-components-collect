<template>
  <div
    v-drag="alarmSectionConfigure.visible"
    class="daar-ratc-alarm-section-configure"
    id="daar-ratc-alarm-section-configure"
  >
    <el-dialog
      v-model="alarmSectionConfigure.visible"
      title="编辑区间阈值"
      width="720px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      :before-close="alarmSectionConfigure.handleClose"
    >
      <el-form :model="alarmSectionConfigure.alarmDetail" label-width="100px" @submit.native.prevent>
        <el-form-item label="能耗异常类型：">
          <input type="text" disabled :value="mapAbnormalName()" />
        </el-form-item>
        <el-form-item label="异常描述：" v-show="mapIsRatioAbnormal()">
          <input type="text" disabled :value="alarmSectionConfigure.alarmDetail.thresholdName" />
        </el-form-item>
        <div class="daar-rasc-description">
          <i class="iconfont icon-Info--Circle-Fill"></i>
          <span>填写区间上限值，系统将自动带入下一区间的下限值</span>
        </div>

        <!-- 区间配置 -->
        <button
          class="mt16 add-btn"
          :disabled="MAX_COUNT <= alarmSectionConfigure.alarmDetail.limitThresholds.length"
          @click="alarmSectionConfigure.handleSectionAdd"
        >
          新增区间
        </button>
        <table style="width: 100%" class="mt8">
          <thead>
            <tr>
              <th>能耗区间下限{{ energyUnit ? `（${energyUnit}）` : '' }}</th>
              <th>能耗区间上限{{ energyUnit ? `（${energyUnit}）` : '' }}</th>
              <th>{{ mapIsRatioAbnormal() ? '普通异常阈值' : '异常阈值' }}</th>
              <th v-show="mapIsRatioAbnormal()">严重异常阈值</th>
              <th style="width: 72px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in alarmSectionConfigure.alarmDetail.limitThresholds" :key="'limit_' + index">
              <td :class="{ error: mapInputError(index, 0) }">
                <span v-show="mapUpperLimitEditable(index)">
                  {{ item.lowerLimit !== '' && item.lowerLimit !== null ? item.lowerLimit : '-' }}
                </span>
                <input
                  v-show="!mapUpperLimitEditable(index)"
                  type="text"
                  v-model="item.lowerLimit"
                  v-inputFilter:number="{ integral: 10, decimal: 2 }"
                  style="width: 112px"
                />
              </td>
              <td :class="{ error: mapInputError(index, 1) }">
                <input
                  type="text"
                  v-model="item.upperLimit"
                  style="width: 112px"
                  v-inputFilter:number="{ integral: 10, decimal: 2 }"
                  @change="alarmSectionConfigure.handleLowerLimitChange($event, index)"
                />
              </td>
              <td :class="{ error: mapInputError(index, 2) }">
                <input
                  type="text"
                  v-model="item.general"
                  style="width: 90px"
                  v-inputFilter:number="{ integral: 3, decimal: 2 }"
                />
                <span class="ml8">%</span>
              </td>
              <td v-show="mapIsRatioAbnormal()" :class="{ error: mapInputError(index, 3) }">
                <input
                  type="text"
                  v-model="item.serious"
                  style="width: 90px"
                  v-inputFilter:number="{ integral: 3, decimal: 2 }"
                />
                <span class="ml8">%</span>
              </td>
              <td style="width: 72px">
                <span v-show="mapDeleteable()">-</span>
                <button danger text v-show="!mapDeleteable()" @click="alarmSectionConfigure.handleDelete(index)">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-show="!!alarmSectionConfigure.errorMessage" class="daar-rasc-error">
          {{ alarmSectionConfigure.errorMessage }}
        </p>

        <!-- 告警等级· -->
        <el-form-item label="告警等级：" class="mt16">
          <el-select v-model="alarmSectionConfigure.alarmDetail.alarmLevel" placeholder="请选择">
            <el-option
              v-for="item in alarmSectionConfigure.alarmLevels"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="flex-row-center-center daar-rasc-btn">
        <button @click="alarmSectionConfigure.handleClose">取消</button>
        <button primary @click="handleSectionSubmit">确定</button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { EDaarAbnormalType } from '@/pages/data-abnomal-alarm-rules/data-abnomal-alarm-rules.api';
import { MAX_COUNT } from './daar-atc-section-configure.api';
import { Daar_IRealtimeAbnormalThresholdVO } from '../daar-abnormal-threshold-configure.api';

import AlarmSectionConfigureService from './daar-atc-section-configure.service';

export default defineComponent({
  emits: ['refresh'],
  props: {
    energyUnit: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const alarmSectionConfigure = new AlarmSectionConfigureService();
    const energyUnit = computed(() => {
      return props.energyUnit;
    });
    /**
     * 校验当前上限是否可编辑
     * @param rowIndex 行索引
     * 非最后一行
     */
    function show(list: Daar_IRealtimeAbnormalThresholdVO[], abnormalType: EDaarAbnormalType) {
      alarmSectionConfigure.show(list, abnormalType);
    }
    // 上限是否可编辑
    function mapUpperLimitEditable(rowIndex: number) {
      return rowIndex !== 0;
    }
    // 是否展示删除按钮
    function mapDeleteable() {
      return alarmSectionConfigure.alarmDetail?.limitThresholds?.length === 1;
    }
    // 输入框是否错误提示
    function mapInputError(rowIndex: number, columnIndex: number) {
      return (
        alarmSectionConfigure.exceptionList?.findIndex((item) => {
          return item.rowIndex === rowIndex && columnIndex === item.columnIndex;
        }) !== -1
      );
    }
    function mapIsRatioAbnormal() {
      return alarmSectionConfigure.abnormalType === EDaarAbnormalType.用能异常;
    }
    function mapAbnormalName() {
      return alarmSectionConfigure.abnormalType === EDaarAbnormalType.用能异常 ? '用能异常' : '边界异常';
    }
    async function handleSectionSubmit() {
      if (await alarmSectionConfigure.handleSubmit()) {
        emit('refresh');
      }
    }

    return {
      alarmSectionConfigure,
      MAX_COUNT,

      show,
      mapUpperLimitEditable,
      mapDeleteable,
      mapInputError,
      mapIsRatioAbnormal,
      mapAbnormalName,
      handleSectionSubmit,
    };
  },
});
</script>
<style lang="less" scoped>
#daar-ratc-alarm-section-configure {
  :deep(.el-dialog) {
    .el-dialog__body {
      padding-left: 0;
      padding-right: 0;

      button.add-btn[disabled='true'] {
        cursor: not-allowed;
      }

      table tbody tr {
        td {
          padding-left: 8px;
          padding-right: 8px;
          background-color: transparent;
        }

        td.error > input {
          border-color: rgb(245, 34, 45);
        }
      }

      p.daar-rasc-error {
        color: rgba(245, 34, 45, 1);
        font-family: PingFang SC;
        font-size: 14px;
        line-height: 22px;
        padding: 7px 0;
      }
    }

    .el-form {
      padding-left: 40px;
      padding-right: 40px;

      input[disabled],
      .el-select {
        width: 100%;
      }

      .daar-rasc-description {
        text-align: left;
        padding: 9px 16px;
        border-radius: 2px;
        background: rgba(244, 244, 245, 1);
        display: flex;
        align-items: center;

        i.iconfont {
          font-size: 16px;
          margin-right: 8px;
          color: rgba(144, 147, 153, 1);
        }

        span {
          display: inline-block;
          line-height: 22px;
          color: rgba(144, 147, 153, 1);
          font-size: 13px;
        }
      }
    }

    .daar-rasc-btn {
      padding-top: 16px;
      border-top: 1px solid var(--color-text-border);
    }
  }
}
</style>
