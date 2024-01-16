<template>
  <div
    class="daar-yesterday-abnormal-threshold-configure"
    id="daar-yesterday-abnormal-threshold-configure"
    v-loading="yesterdayAbnormalThreshold.loading"
  >
    <sub-title title="异常区间及阈值设置" class="mt32 mb16"></sub-title>
    <el-table
      v-if="!yesterdayAbnormalThreshold.loading"
      border
      class="mt8 mb16"
      :data="yesterdayAbnormalThreshold.dataSource"
      :span-method="yesterdayAbnormalThreshold.mapSpanMethod"
      style="width: 100%"
    >
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="abnormalTypeName" label="能源异常类型" width="150" show-overflow-tooltip />
      <el-table-column label="异常描述" show-overflow-tooltip>
        <template #default="scope"> {{ scope.row.thresholdName === '' ? '--' : scope.row.thresholdName }} </template>
      </el-table-column>
      <el-table-column label="普通异常阈值" width="130" show-overflow-tooltip>
        <template #default="scope">
          {{
            scope.row.general === '' || scope.row.general === null
              ? '-'
              : `${transferPercent(Number(scope.row.general), 100)}%`
          }}
        </template>
      </el-table-column>
      <el-table-column label="严重异常阈值" width="130" show-overflow-tooltip>
        <template #default="scope">
          {{
            scope.row.serious === '' || scope.row.serious === null
              ? '-'
              : `${transferPercent(Number(scope.row.serious), 100)}%`
          }}
        </template>
      </el-table-column>
      <el-table-column label="告警等级" width="120" show-overflow-tooltip>
        <template #default="scope">
          <LevelWrapper :level="scope.row.alarmLevel" :levelText="scope.row.alarmLevelText"></LevelWrapper>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120" show-overflow-tooltip>
        <template #default="scope">
          <el-switch
            :active-value="EThresboldStatus.开启"
            :inactive-value="EThresboldStatus.关闭"
            :model-value="scope.row.status"
            @change="yesterdayAbnormalThreshold.handleStatusChange($event, scope.row.id)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="224px">
        <template #default="scope">
          <div class="flex-row-start-center" style="padding-left: 24px">
            <button text @click="yesterdayAbnormalThreshold.triggerEdit(scope.row)">编辑</button>
            <button text @click="linkToLog(scope.row.id)">日志</button>
            <button
              text
              @click="goToSetting(scope.row.abnormalTypeName)"
              v-if="
                scope.row.abnormalTypeName == '能耗对比异常' ||
                scope.row.abnormalTypeName == '排名变化' ||
                scope.row.abnormalTypeName == '成本异常'
              "
            >
              去配置
            </button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 修改状态 -->
    <div v-drag="yesterdayAbnormalThreshold.editStatusVisible">
      <el-dialog
        v-model="yesterdayAbnormalThreshold.editStatusVisible"
        title="编辑状态"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="yesterdayAbnormalThreshold.handleStatusEditClose"
      >
        <el-form @submit.native.prevent :model="yesterdayAbnormalThreshold.editStatusParams" label-width="50px">
          <el-form-item label="原因">
            <el-input
              style="width: 100%"
              type="textarea"
              maxlength="128"
              placeholder="请输入"
              v-model="yesterdayAbnormalThreshold.editStatusParams.reason"
              v-inputFilter:search
            />
          </el-form-item>
          <div class="flex-row-center-center">
            <button @click="yesterdayAbnormalThreshold.handleStatusEditClose">取消</button>
            <button primary @click="yesterdayAbnormalThreshold.handleStatusUpdateSubmit">确认</button>
          </div>
        </el-form>
      </el-dialog>
    </div>
    <!-- 编辑详情 -->
    <div v-drag="yesterdayAbnormalThreshold.editDetailVisible">
      <el-dialog
        v-model="yesterdayAbnormalThreshold.editDetailVisible"
        title="编辑能源异常"
        width="720px"
        :before-close="yesterdayAbnormalThreshold.handleStatusEditClose"
        custom-class="daar-detail-edit-dialog"
      >
        <el-form @submit.native.prevent label-position="left" label-width="110px">
          <el-form-item label="能耗异常类型：">
            <input disabled type="text" :value="yesterdayAbnormalThreshold.editRow.abnormalTypeName" />
          </el-form-item>
          <el-form-item label="异常描述：">
            <input disabled type="text" :value="yesterdayAbnormalThreshold.editRow.thresholdName" />
          </el-form-item>
          <table style="width: 100%" v-if="mapAbnormalThresholdValue(yesterdayAbnormalThreshold.editRow.abnormalType)">
            <thead>
              <tr>
                <th>普通异常阈值</th>
                <th>严重异常阈值</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="flex-row-justify-center">
                    <input
                      type="text"
                      v-model="yesterdayAbnormalThreshold.editRow.general"
                      v-inputFilter:number="{ integral: 3, decimal: 2 }"
                    />
                    <span>%</span>
                  </div>
                </td>
                <td>
                  <div class="flex-row-justify-center">
                    <input
                      type="text"
                      v-model="yesterdayAbnormalThreshold.editRow.serious"
                      v-inputFilter:number="{ integral: 3, decimal: 2 }"
                    />
                    <span>%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <el-form-item label="告警等级：">
            <el-select v-model="yesterdayAbnormalThreshold.editRow.alarmLevel" placeholder="请选择">
              <el-option
                v-for="item in yesterdayAbnormalThreshold.alarmLevels"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="flex-row-center-center btn-wrapper">
          <button @click="yesterdayAbnormalThreshold.handleStatusEditClose">取消</button>
          <button primary @click="yesterdayAbnormalThreshold.handleDetailUpdateSubmit">确认</button>
        </div>
      </el-dialog>
    </div>
    <!-- 日志 -->
    <ReadLogDialog ref="logDialogVisible" :id="id" :queryUrl="EDaarLogType.查询昨日异常配置日志"></ReadLogDialog>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import YesterdayAbnormalThresholdConfigureService from './daar-yesterday-abnormal-threshold-configure.service';
import { EDaarAbnormalType, EDaarLogType } from '../../data-abnomal-alarm-rules.api';
import { EThresboldStatus } from '../daar-analyse-thresholdvalue-configure/daar-analyse-thresholdvalue-configure.api';
import { openBlankUrl, transferPercent } from '@/utils';

import ReadLogDialog from '../daar-log-dialog/daar-log-dialog.vue';
import LevelWrapper from '../daar-level-wrapper/daar-ratc-level-wrapper.vue';

const logDialogVisible = ref();
const id = ref<number>(-1);

function mapAbnormalThresholdValue(type: EDaarAbnormalType) {
  return (
    type !== EDaarAbnormalType.排名变化 &&
    type !== EDaarAbnormalType.关联分析异常 &&
    type !== EDaarAbnormalType.峰值时间异常 &&
    type !== EDaarAbnormalType.成本异常
  );
}

function linkToLog(value: number) {
  id.value = value;

  if (logDialogVisible.value) {
    logDialogVisible.value?.show();
  }
}

//去配置
function goToSetting(abnormalTypeName: string) {
  let path = '';
  switch (abnormalTypeName) {
    case '能耗对比异常':
      path = '/energyComparisonGroup';
      break;
    case '排名变化':
      path = '/groupRanked';
      break;
    case '成本异常':
      path = '/targetCost';
      break;
    default:
      path = '/energyComparisonGroup';
  }
  openBlankUrl(path);
}

const yesterdayAbnormalThreshold = new YesterdayAbnormalThresholdConfigureService();
</script>
<style lang="less" scoped>
#daar-yesterday-abnormal-threshold-configure {
  min-height: 240px;

  :deep(.el-table) {
    tbody > tr:nth-child(even) > td {
      background-color: transparent;
    }

    .el-table__cell {
      border-right: 1px solid var(--color-text-divider);
      border-bottom: 1px solid var(--color-text-divider) !important;
    }
  }

  .daar-title {
    padding-left: 12px;
  }

  :deep(.el-dialog.daar-detail-edit-dialog) {
    .el-dialog__body {
      padding: 0;

      .el-form {
        padding: 20px 40px 4px 40px;
      }
    }

    input[disabled],
    .el-select {
      width: 100%;
    }

    table {
      margin-bottom: 16px;

      input {
        flex: 1;
      }

      td > div {
        column-gap: 8px;
      }
    }

    .btn-wrapper {
      padding: 12px 0;
      border-top: 1px solid var(--color-text-divider);
    }
  }
}
</style>
