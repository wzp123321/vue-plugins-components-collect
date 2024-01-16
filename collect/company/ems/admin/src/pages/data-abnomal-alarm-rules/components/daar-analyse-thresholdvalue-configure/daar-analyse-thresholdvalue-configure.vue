<template>
  <div
    class="daar-analyse-thresholdvalue-configure"
    id="daar-analyse-thresholdvalue-configure"
    v-loading="thresholdValueConfigure.loading"
  >
    <sub-title title="异常阈值区间设置" class="mb16"></sub-title>
    <table style="width: 100%">
      <thead>
        <tr>
          <th>能源异常类型</th>
          <th>异常阈值</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in thresholdValueConfigure.dataSource" :key="'threshold_' + index">
          <td>{{ item.abnormalTypeName }}</td>
          <td>
            {{
              item.threshold === '' || item.threshold === null
                ? '-'
                : `${transferPercent(Number(item.threshold), 100)}%`
            }}
          </td>
          <td>
            <el-switch
              :active-value="EThresboldStatus.开启"
              :inactive-value="EThresboldStatus.关闭"
              :model-value="item.status"
              @change="thresholdValueConfigure.handleStatusChange($event, item.id)"
            />
          </td>
          <td>
            <button
              text
              @click="thresholdValueConfigure.handleEditShow(item.id, item.abnormalTypeName, item.threshold)"
            >
              编辑
            </button>
            <button text @click="linkToLog(item.id)">查看日志</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      class="common-table__empty"
      v-show="thresholdValueConfigure.dataSource?.length === 0 && !thresholdValueConfigure.loading"
    >
      <img src="../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
      <p>暂无数据</p>
    </div>

    <!-- 修改状态 -->
    <div v-drag="thresholdValueConfigure.statusUpdateVisible">
      <el-dialog
        v-model="thresholdValueConfigure.statusUpdateVisible"
        title="编辑状态"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="thresholdValueConfigure.handleStatusUpdateClose"
      >
        <el-form @submit.native.prevent :model="thresholdValueConfigure.statusUpdateParams" label-width="50px">
          <el-form-item label="原因">
            <el-input
              style="width: 100%"
              maxlength="128"
              type="textarea"
              placeholder="请输入"
              v-model="thresholdValueConfigure.statusUpdateParams.reason"
              v-inputFilter:search
            />
          </el-form-item>
          <div class="flex-row-center-center">
            <button @click="thresholdValueConfigure.handleStatusUpdateClose">取消</button>
            <button primary @click="thresholdValueConfigure.handleStatusUpdateSubmit">确认</button>
          </div>
        </el-form>
      </el-dialog>
    </div>

    <!-- 日志 -->
    <readLogDialog ref="logDialogVisible" :id="id" :queryUrl="EDaarLogType.查询能耗分析异常配置日志"></readLogDialog>

    <!-- 编辑 -->
    <div v-drag="thresholdValueConfigure.editVisible">
      <el-dialog
        v-model="thresholdValueConfigure.editVisible"
        title="编辑异常阈值区间"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="thresholdValueConfigure.handleEditClose"
      >
        <el-form @submit.native.prevent label-width="100px" class="edit-form">
          <el-form-item label="能耗异常类型">
            <input type="text" disabled :value="thresholdValueConfigure.editParams.abnormalTypeName" />
          </el-form-item>
          <el-form-item label="异常阈值" class="edit-form-threshold">
            <input
              type="text"
              v-inputFilter:number="{ integral: 3, decimal: 2 }"
              v-model="thresholdValueConfigure.editParams.threshold"
            />
          </el-form-item>
          <div class="flex-row-center-center mt32">
            <button @click="thresholdValueConfigure.handleEditClose">取消</button>
            <button primary @click="thresholdValueConfigure.handleEditSubmit">确认</button>
          </div>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import ThresholdValueConfigureService from './daar-analyse-thresholdvalue-configure.service';
import { EThresboldStatus } from './daar-analyse-thresholdvalue-configure.api';
import { EDaarLogType } from '../../data-abnomal-alarm-rules.api';

import { transferPercent } from '../../../../utils/index';

import readLogDialog from '../daar-log-dialog/daar-log-dialog.vue';

const thresholdValueConfigure = new ThresholdValueConfigureService();
const logDialogVisible = ref();
const id = ref<number>(-1);

function linkToLog(value: number) {
  id.value = value;

  if (logDialogVisible.value) {
    logDialogVisible.value?.show();
  }
}
</script>
<style lang="less" scoped>
#daar-analyse-thresholdvalue-configure {
  table {
    border: 1px solid var(--color-text-divider);
    border-bottom: none;

    thead > tr > th,
    tbody > tr > td {
      border-right: 1px solid var(--color-text-divider);
      border-bottom: 1px solid var(--color-text-divider);
    }

    thead > tr > th:last-child,
    tbody > tr > td:last-child {
      border-right: none;
    }

    tbody > tr:nth-child(even) > td {
      background-color: #fafafa;
    }
  }

  :deep(.el-form.edit-form) {
    input {
      width: 100%;
    }

    .edit-form-threshold {
      input {
        position: relative;
      }

      .el-form-item__content::after {
        content: '%';
        position: absolute;
        line-height: 34px;
        top: 50%;
        right: 8px;
        transform: translateY(-50%);
      }
    }
  }
}
</style>
