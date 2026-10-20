<!-- eslint-disable vue/require-v-for-key -->
<!-- eslint-disable vue/valid-v-for -->
<!--
 * @Author: liusw 
 * @Date: 2022-05-24 10:39:41
 * @LastEditors: 刘冠奇 liugq@tiansu-china.com
 * @LastEditTime: 2025-04-22 16:17:52
 * @FilePath: \web\src\components\common\alarm-detail\alarm-detail.vue
 * @Description: 
 * 
 * Copyright (c) 2022 by liushaowei liusw@tiansu-china.com, All Rights Reserved. 
-->
<template>
  <div id="alarm-detail">
    <te-dialog
      :draggable="true"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      v-model="visible"
      :title="'告警详情'"
      :append-to-body="true"
      @open="openDialog"
      @close="closeDialog"
      class="alarm-detail"
      width="80%"
    >
      <div class="ad-content">
        <div class="ad-content-left">
          <div class="ad-content-left-title">
            <div class="title-titletop">
              <div class="title-titletime">{{ detailData.generationTime }}</div>
            </div>
            <div class="title-titlemid" :title="detailData.content">
              {{ detailData.content }}
            </div>
            <div class="title-bottom">
              <te-tag
                :effect="detailData.levelName === '次要' ? 'light' : 'dark'"
                :type="
                  detailData.levelName === '严重'
                    ? 'danger'
                    : detailData.levelName === '重要'
                    ? 'warning'
                    : detailData.levelName === '次要'
                    ? 'data6'
                    : ''
                "
              >
                {{ detailData.levelName }}
              </te-tag>
              <te-divider direction="vertical" v-if="isAlarmType"></te-divider>
              <te-badge
                is-status
                :type="detailData.statusName === '已恢复' ? 'info' : 'danger'"
                v-if="isAlarmType"
              >
                {{ detailData.statusName }}
              </te-badge>
              <te-divider direction="vertical" v-if="isAlarmType"></te-divider>
              <div class="ad-label-list" v-if="isAlarmType">
                <te-tag
                  v-for="label in detailData.labelList"
                  :type="(ALARM_LABEL_MAP as any)[label].type"
                >
                  {{ (ALARM_LABEL_MAP as any)[label].name }}
                </te-tag>
              </div>
            </div>
          </div>
          <div class="ad-content-left-tab">
            <te-tabs
              v-model="activeName"
              class="demo-tabs"
              v-if="
                detailData.recordType === '2' &&
                detailData.overrunFlag === '1' &&
                !(highPrecision === '0' && lowPrecision === '0')
              "
            >
              <te-tab-pane label="描述" name="description" :key="0">
                <alarm-no-data v-if="noDataVisible"></alarm-no-data>
                <div class="threshold" v-if="!noDataVisible">
                  <div class="ad-threshold-title">
                    <IconTitleDecoration></IconTitleDecoration>
                    <span>描述值</span>
                  </div>
                  <div class="ad-threshold-content">
                    <div
                      class="ad-limit"
                      :class="[
                        detailData.originAlarmTypeId === 3
                          ? 'up'
                          : detailData.originAlarmTypeId === 4
                          ? 'upup'
                          : detailData.originAlarmTypeId === 5
                          ? 'down'
                          : 'downdown',
                      ]"
                    >
                      <div>越限值</div>
                      <div class="ad-threshold-number">
                        {{ detailData.alarmChart?.value ?? '-' }}
                        <span class="unit">{{
                          detailData.alarmChart?.unit
                        }}</span>
                      </div>
                    </div>
                    <div class="ad-threshold">
                      <div class="ad-threshold-title">
                        <span>当前设定阈值</span>
                        <te-link
                          type="primary"
                          class="ad-edit-over-limit"
                          @click="
                            openEditOverLimitDialog(
                              detailData.configId,
                              detailData.alarmChart?.overrunValue ?? NaN,
                              detailData.code,
                            )
                          "
                        >
                          修改
                        </te-link>
                      </div>
                      <div class="ad-threshold-number">
                        {{ detailData.alarmChart?.overrunValue ?? '-' }}
                        <span class="unit">{{
                          detailData.alarmChart?.unit
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ad-chart-window" v-show="!noDataVisible">
                  <div class="ad-chart-wrapper">
                    <div
                      class="ad-chart-item"
                      :style="{
                        zIndex: showHighChart ? 0 : 1,
                        opacity: showHighChart ? 0 : 1,
                      }"
                    >
                      <div class="ad-chart-title">
                        <IconTitleDecoration></IconTitleDecoration>
                        <span class="ad-chart-bold">
                          {{
                            highPrecision === '1' && lowPrecision === '0'
                              ? '高精度曲线'
                              : '告警曲线'
                          }}
                        </span>
                        <span
                          v-if="highPrecision === '1' && lowPrecision === '1'"
                          class="ad-chart-title-but"
                          @click="switchChart('high')"
                        >
                          <img
                            src="../../assets/alarm-affix-switch.svg"
                            alt=""
                          />
                          高精度曲线
                        </span>
                      </div>
                      <div id="ad-chart">
                        <div :id="chartId" class="ad-chart-realchart"></div>
                        <div
                          v-if="
                            highDetailChartData &&
                            highDetailChartData.data.length < 121 &&
                            highPrecision === '1' &&
                            lowPrecision === '0'
                          "
                          class="ad-chart-block"
                        ></div>
                      </div>
                    </div>
                    <div
                      class="ad-chart-item"
                      :style="{
                        zIndex: showHighChart ? 1 : 0,
                        opacity: showHighChart ? 1 : 0,
                      }"
                    >
                      <div class="ad-chart-title">
                        <te-icon
                          class="ad-chart-cursor-pointer"
                          @click="switchChart('low')"
                        >
                          <icon-left />
                        </te-icon>
                        <span
                          class="ad-chart-cursor-pointer ad-chart-bold"
                          @click="switchChart('low')"
                        >
                          高精度曲线
                        </span>
                      </div>
                      <div id="ad-chart">
                        <div
                          :id="chartId + 'high'"
                          class="ad-chart-realchart"
                        ></div>
                        <div
                          v-if="
                            highDetailChartData &&
                            highDetailChartData.data.length < 121 &&
                            highPrecision === '1' &&
                            lowPrecision === '1'
                          "
                          class="ad-chart-block"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="chart-detail" v-show="!noDataVisible">
                  <div class="chart-detail-item">
                    <div class="item-value">
                      <span>越限值:</span>
                      <span>
                        {{ detailData.alarmChart?.value ?? '-' }}
                      </span>
                    </div>
                    <div class="item-time">
                      <div>告警时间:</div>
                      <div class="time">
                        {{ detailData.alarmChart?.valueTime ?? '-' }}
                      </div>
                    </div>
                    <template
                      v-if="
                        detailData.alarmChart?.voltageFlag === EVoltageFlag.是
                      "
                    >
                      <div class="item-time">
                        <div>闭锁值:</div>
                        <div
                          class="time"
                          v-if="
                            detailData.alarmChart.alarmLockoutFlag ===
                            EAlarmLockoutFlag.启用
                          "
                        >
                          {{ detailData.alarmChart?.alarmLockoutValue ?? '-' }}
                        </div>
                        <div class="time" v-else>未启用</div>
                      </div>
                      <div class="item-time">
                        <div>关联电流值:</div>
                        <div
                          class="time"
                          v-if="
                            detailData.alarmChart.alarmLockoutFlag ===
                            EAlarmLockoutFlag.启用
                          "
                        >
                          {{
                            detailData.alarmChart?.alarmElecValue ??
                            '未读取到电流值'
                          }}
                        </div>
                        <div class="time" v-else>未启用闭锁值</div>
                      </div>
                    </template>
                  </div>
                  <div class="chart-detail-item">
                    <div class="item-value">
                      <span>峰值:</span>
                      <span>
                        {{ detailData.alarmChart?.peakValue ?? '-' }}
                      </span>
                    </div>
                    <div class="item-time">
                      <div>时间:</div>
                      <div class="time">
                        {{ detailData.alarmChart?.peakTime ?? '-' }}
                      </div>
                    </div>
                  </div>
                  <div class="chart-detail-item">
                    <div class="item-value">
                      <span>恢复值:</span>
                      <span>
                        {{ detailData.alarmChart?.resumeValue ?? '-' }}
                      </span>
                    </div>
                    <div class="item-time">
                      <div>恢复时间:</div>
                      <div class="time">
                        {{ detailData.alarmChart?.resumeTime ?? '-' }}
                      </div>
                    </div>
                    <template
                      v-if="
                        detailData.alarmChart?.voltageFlag === EVoltageFlag.是
                      "
                    >
                      <div class="item-time">
                        <div>闭锁值:</div>
                        <div
                          class="time"
                          v-if="detailData.statusName === '正在告警'"
                        >
                          -
                        </div>
                        <div
                          class="time"
                          v-else-if="
                            detailData.alarmChart.resumeLockoutFlag ===
                            EAlarmLockoutFlag.启用
                          "
                        >
                          {{ detailData.alarmChart?.resumeLockoutValue ?? '-' }}
                        </div>
                        <div class="time" v-else>未启用</div>
                      </div>
                      <div class="item-time">
                        <div>关联电流值:</div>
                        <div
                          class="time"
                          v-if="detailData.statusName === '正在告警'"
                        >
                          -
                        </div>
                        <div
                          class="time"
                          v-else-if="
                            detailData.alarmChart.resumeLockoutFlag ===
                            EAlarmLockoutFlag.启用
                          "
                        >
                          {{
                            detailData.alarmChart?.resumeElecValue ??
                            '未读取到电流值'
                          }}
                        </div>
                        <div class="time" v-else>未启用闭锁值</div>
                      </div>
                    </template>
                  </div>
                </div>
              </te-tab-pane>
              <te-tab-pane label="备注" name="remarks" :key="1">
                <te-form
                  :model="addCommentForm"
                  ref="remarkForm"
                  label-width="52px"
                  @submit.native.prevent
                >
                  <te-form-item
                    label="备注"
                    prop="comment"
                    :rules="[
                      {
                        required: true,
                        message: '请输入处理备注',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <te-input
                      placeholder="请输入处理备注"
                      :maxlength="50"
                      :model-value="addCommentForm.comment"
                      @update:model-value="handleCommentInput"
                      type="textarea"
                      resize="none"
                      show-word-limit
                    />
                  </te-form-item>
                  <te-form-item>
                    <te-button
                      type="primary"
                      plain
                      size="small"
                      @click="handleAddComment"
                      >提交</te-button
                    >
                  </te-form-item>
                </te-form>
                <div class="tabletitle">备注记录</div>
                <alarm-no-data v-if="tableData.length === 0"></alarm-no-data>
                <te-table
                  size="large"
                  v-else
                  stripe
                  :data="tableData"
                  height="295"
                >
                  <te-table-column
                    prop="commentTime"
                    label="提交时间"
                    align="center"
                  />
                  <te-table-column
                    prop="username"
                    label="填写人"
                    align="center"
                  />
                  <te-table-column
                    prop="comment"
                    label="详细描述"
                    show-overflow-tooltip
                    :format="(row: any) => row.comment ?? '-'"
                    align="center"
                  ></te-table-column>
                </te-table>
              </te-tab-pane>
            </te-tabs>
            <div class="ad-remark" v-else>
              <te-form
                :model="addCommentForm"
                ref="remarkForm"
                label-width="52px"
                @submit.native.prevent
              >
                <te-form-item
                  label="备注"
                  prop="comment"
                  :rules="[
                    {
                      required: true,
                      message: '请输入处理备注',
                      trigger: 'blur',
                    },
                  ]"
                >
                  <te-input
                    placeholder="请输入处理备注"
                    :maxlength="50"
                    :model-value="addCommentForm.comment"
                    type="textarea"
                    resize="none"
                    show-word-limit
                    @update:model-value="handleCommentInput"
                  />
                </te-form-item>
                <te-form-item>
                  <te-button
                    type="primary"
                    plain
                    size="small"
                    @click="handleAddComment"
                    >提交</te-button
                  >
                </te-form-item>
              </te-form>
              <div class="tabletitle">备注记录</div>
              <alarm-no-data v-if="tableData.length === 0"></alarm-no-data>
              <te-table
                size="large"
                v-else
                stripe
                :data="tableData"
                height="295"
              >
                <te-table-column
                  prop="commentTime"
                  label="提交时间"
                  align="center"
                />
                <te-table-column
                  prop="username"
                  label="填写人"
                  align="center"
                />
                <te-table-column
                  prop="comment"
                  label="详细描述"
                  show-overflow-tooltip
                  :format="(row: any) => row.comment ?? '-'"
                  align="center"
                ></te-table-column>
              </te-table>
            </div>
          </div>
        </div>
        <div class="ad-content-right">
          <div class="ad-content-right-detail">
            <div class="detail-title">
              <IconTitleDecoration></IconTitleDecoration>
              <span>明细</span>
            </div>
            <div class="detail-info">
              <div class="detail-info-item">
                <div class="detail-info-itemlabel">空间位置</div>
                <div
                  class="detail-info-itemcontent"
                  :title="detailData.spaceName ? detailData.spaceName : '-'"
                >
                  {{ detailData.spaceName ? detailData.spaceName : '-' }}
                </div>
              </div>
              <div class="detail-info-item">
                <div class="detail-info-itemlabel">关联站点</div>
                <div
                  class="detail-info-itemcontent"
                  :title="
                    detailData.concentratorName
                      ? detailData.concentratorName
                      : '-'
                  "
                >
                  {{
                    detailData.concentratorName
                      ? detailData.concentratorName
                      : '-'
                  }}
                </div>
              </div>
              <div class="detail-info-item">
                <div class="detail-info-itemlabel">关联设备</div>
                <div
                  class="detail-info-itemcontent"
                  :title="detailData.deviceName ? detailData.deviceName : '-'"
                >
                  {{ detailData.deviceName ? detailData.deviceName : '-' }}
                </div>
              </div>
              <div class="detail-info-item">
                <div class="detail-info-itemlabel">关联点位</div>
                <div class="detail-info-itemcontent">
                  {{ detailData.pointName ? detailData.pointName : '-' }}
                </div>
              </div>
              <div class="detail-info-item">
                <div class="detail-info-itemlabel">专业模块</div>
                <div class="detail-info-itemcontent">
                  {{ detailData.systemName ? detailData.systemName : '-' }}
                </div>
              </div>
              <div class="detail-info-item">
                <div class="detail-info-itemlabel">告警类型</div>
                <div class="detail-info-itemcontent">
                  {{
                    detailData.transAlarmTypeName
                      ? detailData.transAlarmTypeName
                      : '-'
                  }}
                </div>
              </div>
              <div class="detail-info-item">
                <div class="detail-info-itemlabel">发生时间</div>
                <div class="detail-info-itemcontent">
                  {{ detailData.generationTime }}
                </div>
              </div>
            </div>
          </div>
          <div class="ad-content-right-progress">
            <div class="progress-title">
              <IconTitleDecoration></IconTitleDecoration>
              <span>历史告警</span>
            </div>
            <te-form-item label="生成时间" v-if="isAlarmType">
              <TeSelectSubContentV2
                v-model="selectedHistory"
                :data="historyList"
                :value-key="'id'"
                :textProps="{
                  mainText: 'generationTime',
                  subText: 'content',
                }"
                @change="handleSelectHistory"
              ></TeSelectSubContentV2>
            </te-form-item>
            <div class="progress-chart">
              <div class="progress-item" v-for="item in progressList">
                <div class="title">
                  <div class="dot">
                    <div></div>
                    {{ item.operateTypeName }} {{ item.operateTime }}
                  </div>
                </div>
                <div class="content">操作人:{{ item.loginName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer v-if="isAsure">
        <te-button @click="onCancel">取消</te-button>
        <te-button type="primary" @click="onAsure">确认告警</te-button>
      </template>
      <te-dialog
        :close-on-click-modal="false"
        v-model="editOverLimitDialogVisible"
        title="修改越限值"
        :destroy-on-close="true"
        :append-to-body="true"
        width="400px"
        class="ad-edit-overrunValue-dialog"
      >
        <te-form :model="updateCrossDataParams" @submit.native.prevent>
          <te-form-item
            prop="overrunValue"
            label="越限值"
            :rules="[
              { required: true, message: '请输入越限值', trigger: 'blur' },
            ]"
          >
            <te-input-number
              :controls="false"
              :max="9999999999.9999"
              :min="-9999999999.9999"
              :precision="4"
              v-model="updateCrossDataParams.overrunValue"
              class="ad-overrun-value-input"
            ></te-input-number>
          </te-form-item>
        </te-form>
        <template #footer>
          <te-button @click="closeEditOverLimitDialog">取消</te-button>
          <te-button
            type="primary"
            @click="handleEditOverrunValue"
            :loading="updateCrossDataLoading"
            >保存</te-button
          >
        </template>
      </te-dialog>
    </te-dialog>
    <TeAlarmRemarkDialog
      v-model="remarkDialogVisible"
      :saving="remarkSaving"
      @confirm="handleRemarkConfirm"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, computed, onBeforeUnmount } from 'vue';
import type { AxiosInstance } from 'axios';
import { QueryAlarmDetailModule } from './alarm-detail.function';
import AlarmChartService from './alarm-chart/alarm-chart-service';
import {
  TeMessage,
  TeTag,
  TeDivider,
  TeBadge,
  TeDialog,
  TeLink,
  TeInputNumber,
  TeButton,
  TeFormItem,
  TeForm,
  TeInput,
  TeTable,
  TeTableColumn,
  TeTabs,
  TeTabPane,
  TeIcon,
} from '@tiansu/element-plus';
import AlarmNoData from './alarm-no-data/alarm-no-data.vue';
import { TeSelectSubContentV2 } from '../../../../te-select-sub-content-v2';
import { IconTitleDecoration, IconLeft } from '@arco-iconbox/vue-te';
import { useEditOverLimitDialog } from './hooks/useEditOverLimitDialog';
import { useAddComment } from './hooks/useAddComment';
import { useHistorySelect } from './hooks/useHistorySelect';
import { ALARM_LABEL_MAP } from '../../constant';
import { EAlarmLockoutFlag, EVoltageFlag } from '../../api/index.api';
import { TQueryAlarmHistoryListRes } from './alarm-deatil.service';
import TeAlarmRemarkDialog from '../alarm-remark-dialog.vue';
import { filterText } from '../../utils';

const props = defineProps<{
  /** axios 实例（由父级容器传入） */
  axiosInstance: AxiosInstance;
  /** 登录用户名 */
  userName: string;
}>();

/* ============ 业务 hook（接收容器传入的 axiosInstance） ============ */
const { axiosInstance } = props;
const userName = props.userName;

const {
  editOverLimitDialogVisible,
  openEditOverLimitDialog,
  closeEditOverLimitDialog,
  updateCrossDataParams,
  updateCrossDataLoading,
  updateCrossData,
} = useEditOverLimitDialog(axiosInstance);
const { addCommentForm, submitAdd } = useAddComment(axiosInstance);
const { selectedHistory, historyList, queryAlarmHistoryList } =
  useHistorySelect(axiosInstance);
const visible = ref<boolean>(false);
// 导入查询告警详情功能
const QueryAlarmDetailFunction = new QueryAlarmDetailModule(axiosInstance);
const detailData = ref(QueryAlarmDetailFunction.alarmDetailRes);
const lowDetailChartData = ref<any>();
const highDetailChartData = ref<any>();
// 告警事件确认功能导入
const isAsure = ref<boolean>(true);
const chartId = `charts_${(Math.random() * 10000).toFixed(0)}`;
const alarmChart = new AlarmChartService();
const highAlarmChart = new AlarmChartService();
const noDataVisible = ref<boolean>(false);
// 控制动效
// const chartWrapperLeft = ref<string>('0');
const showHighChart = ref(false);

const emit = defineEmits(['handleClose', 'handleSure']);

const highPrecision = ref<string>('1');
const lowPrecision = ref<string>('1');
const detailType = ref<string>(''); // 告警类型 '1':事件（代表从事件记录标签页打开的），'2':告警（代表从告警记录标签页打开的）
const isAlarmType = computed<boolean>(() => detailType.value === '2');
const tableData = ref<any[]>([]);
const activeName = ref<string>('description');
const progressList = ref<any[]>([]);
const remarkForm = ref<InstanceType<typeof TeForm>>();
/**
 * 初始化告警详情弹框
 * @param id 告警ID
 * @param type 告警类型（1:事件,2:告警）
 * @param status 操作状态（1:正常,2:异常）
 * @param highPrecisionFlag 高精度标志（0:低精度,1:高精度）
 * @param lowPrecisionFlag 低精度标志（0:低精度,1:高精度）
 */
const initDialog = async (
  id: number,
  type: string,
  status: string,
  highPrecisionFlag: string,
  lowPrecisionFlag: string,
) => {
  console.log(
    'initDialog',
    id,
    type,
    status,
    highPrecisionFlag,
    lowPrecisionFlag,
  );
  detailType.value = type;
  highPrecision.value = highPrecisionFlag;
  lowPrecision.value = lowPrecisionFlag;
  // chartWrapperLeft.value = '0';
  showHighChart.value = false;
  if (highPrecision.value === '0' && lowPrecision.value === '0') {
    noDataVisible.value = true;
    activeName.value = 'remarks';
  }
  // 兜底：detail 子模块的 axios 走业务系统接口,demo / mock 模式下可能失败,
  // 用 try/catch 包住避免阻塞弹框打开,弹框内展示空态。
  try {
    await queryDetail(id, type);
  } catch (err) {
    console.warn('[initDialog] queryDetail failed:', err);
  }
  try {
    await queryAlarmHistoryList(id);
  } catch (err) {
    console.warn('[initDialog] queryAlarmHistoryList failed:', err);
  }
  selectedHistory.value = id;
  if (
    detailData.value.alarmChart &&
    detailData.value.alarmChart?.data.length > 0
  ) {
    detailData.value.alarmChart.upFlag = detailData.value.upFlag;
    lowPrecision.value === '1' &&
      (alarmChart.dataSource = lowDetailChartData.value);
    highPrecision.value === '1' &&
      (highAlarmChart.dataSource = highDetailChartData.value);
    noDataVisible.value = false;
    visible.value = true;
    nextTick(() => {
      if (lowPrecision.value === '0' && highPrecision.value === '1') {
        highAlarmChart.initChart(chartId, 'high');
      } else {
        lowPrecision.value === '1' && alarmChart.initChart(chartId);
        highPrecision.value === '1' &&
          highAlarmChart.initChart(`${chartId}high`, 'high');
      }
    });
  } else {
    noDataVisible.value = true;
    visible.value = true;
  }
  if (type === '2' && detailData.value.overrunFlag === '1') {
    activeName.value = 'description';
    if (highPrecision.value === '0' && lowPrecision.value === '0') {
      activeName.value = 'remarks';
    }
  } else {
    activeName.value = 'remarks';
  }
  if (status === '1') {
    isAsure.value = false;
  } else if (status === '0') {
    isAsure.value = true;
  }
};
const openDialog = () => {
  // commentContent.value = '';
};
const closeDialog = () => {
  remarkForm.value?.clearValidate();
  emit('handleClose');
};

/* 组件销毁时释放 ECharts 实例，防止内存泄漏 */
onBeforeUnmount(() => {
  alarmChart.dispose();
  highAlarmChart.dispose();
});
// 确认告警时弹出备注 dialog(由 AlarmRemarkDialog 提供表单校验 + saving 锁定)
const remarkDialogVisible = ref<boolean>(false);
const remarkSaving = ref<boolean>(false);

const onAsure = () => {
  remarkDialogVisible.value = true;
};

/** 备注 dialog 确认回调:真正执行 batchConfirmAlarm */
const handleRemarkConfirm = async (remark: string) => {
  remarkSaving.value = true;
  try {
    // 确认告警
    const res = await QueryAlarmDetailFunction.batchConfirmAlarm({
      idList: [detailData.value.id],
      type: detailData.value.recordType,
      comment: remark,
    });
    if (res) {
      emit('handleSure');
      TeMessage.success('确认成功');
      remarkDialogVisible.value = false;
      visible.value = false;
    }
  } finally {
    remarkSaving.value = false;
  }
};
const onCancel = async () => {
  visible.value = false;
};
const queryDetail = async (id: number, typeId: string) => {
  if (lowPrecision.value === '1') {
    await QueryAlarmDetailFunction.queryAlarmDetail({
      id,
      typeId,
      highPrecisionFlag: false,
    });
    lowDetailChartData.value = JSON.parse(
      JSON.stringify(QueryAlarmDetailFunction.alarmDetailRes.alarmChart),
    );
    lowDetailChartData.value.upFlag =
      QueryAlarmDetailFunction.alarmDetailRes.upFlag;
  }
  if (highPrecision.value === '1') {
    await QueryAlarmDetailFunction.queryAlarmDetail({
      id,
      typeId,
      highPrecisionFlag: true,
    });
    highDetailChartData.value = JSON.parse(
      JSON.stringify(QueryAlarmDetailFunction.alarmDetailRes.alarmChart),
    );
    highDetailChartData.value.upFlag =
      QueryAlarmDetailFunction.alarmDetailRes.upFlag;
  }
  if (lowPrecision.value === '0' && highPrecision.value === '0') {
    await QueryAlarmDetailFunction.queryAlarmDetail({
      id,
      typeId,
      highPrecisionFlag: false,
    });
  }
  detailData.value = QueryAlarmDetailFunction.alarmDetailRes;
  if (lowPrecision.value === '1') {
    detailData.value.alarmChart!.peakValue = lowDetailChartData.value.peakValue;
    detailData.value.alarmChart!.peakTime = lowDetailChartData.value.peakTime;
    detailData.value.alarmChart!.resumeValue =
      lowDetailChartData.value.resumeValue;
    detailData.value.alarmChart!.resumeTime =
      lowDetailChartData.value.resumeTime;
  }
  tableData.value = QueryAlarmDetailFunction.alarmDetailRes.commentList;
  progressList.value = QueryAlarmDetailFunction.alarmDetailRes.operationList;
};
function switchChart(type: string) {
  if (type === 'high') {
    // chartWrapperLeft.value = '-1360px';
    showHighChart.value = true;
    detailData.value.alarmChart!.peakValue =
      highDetailChartData.value.peakValue;
    detailData.value.alarmChart!.peakTime = highDetailChartData.value.peakTime;
    detailData.value.alarmChart!.resumeValue =
      highDetailChartData.value.resumeValue;
    detailData.value.alarmChart!.resumeTime =
      highDetailChartData.value.resumeTime;
  }
  if (type === 'low') {
    // chartWrapperLeft.value = '0px';
    showHighChart.value = false;
    detailData.value.alarmChart!.peakValue = lowDetailChartData.value.peakValue;
    detailData.value.alarmChart!.peakTime = lowDetailChartData.value.peakTime;
    detailData.value.alarmChart!.resumeValue =
      lowDetailChartData.value.resumeValue;
    detailData.value.alarmChart!.resumeTime =
      lowDetailChartData.value.resumeTime;
  }
}

const handleEditOverrunValue = async () => {
  const res = await updateCrossData();
  if (res.success) {
    detailData.value.alarmChart!.overrunValue =
      updateCrossDataParams.value.overrunValue;
  }
};

const handleAddComment = async () => {
  const res = await submitAdd(
    detailData.value.id,
    detailData.value.recordType,
    userName,
  );
  if (res) {
    queryDetail(detailData.value.id, detailData.value.recordType);
  }
};

/** 备注输入:过滤特殊字符 + 空格 */
const handleCommentInput = (val: string) => {
  addCommentForm.value.comment = filterText(val, { allowSpace: false });
};

const handleSelectHistory = (value: TQueryAlarmHistoryListRes[1]) => {
  // 因为只要能调到这个方法就一定是从告警进来的，这边第二个参数固定传2代表告警
  initDialog(
    value.id,
    '2',
    value.operationStatus,
    value.highPrecisionFlag ?? '0',
    value.historyFlag ?? '0',
  );
};

defineExpose({
  initDialog,
});
</script>
<style lang="less" scoped>
.alarm-detail {
  .alarm-no-data {
    height: 295px;
  }

  .ad-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 10px;
    gap: var(--te-space-20);

    .ad-content-left {
      overflow: hidden;
      flex: 145;
      border-right: 1px solid rgba(0, 0, 0, 0.15);

      .ad-content-left-title {
        .title-titletop {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-right: 16px;

          .title-tag {
            color: #fff;
            width: 46px;
            height: 24px;
            line-height: 24px;
            border-radius: 12px;
            text-align: center;
          }

          .title-titletime {
            color: rgba(0, 0, 0, 0.6);
          }
        }

        .title-titlemid {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .title-bottom {
          display: flex;
          gap: var(--te-space-8);
          margin-bottom: 16px;
          align-items: center;

          // :deep(.ad-alarm-status) {
          //   padding-left: 1em;
          //   color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
          //   sup,
          //   .te-badge__content {
          //     right: unset;
          //     left: 0;
          //     top: 50%;
          //     transform: translateY(-50%);
          //   }
          // }
          .ad-label-list {
            display: flex;
            gap: var(--te-space-8);
          }
        }

        .warning {
          background-color: #fff2f0;
          color: #ff4d4f;
          border: 1px solid #ff4d4f;
        }

        .recover {
          color: rgba(0, 0, 0, 0.45);
          background-color: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.15);
        }

        .title-alarmstatus {
          display: inline-block;
          padding: 0 10px;
          border-radius: 4px;
        }
      }

      .ad-content-left-tab {
        #pane-remarks {
          padding-right: 16px;
        }

        :deep(.el-tabs) {
          .el-tabs__item {
            height: 30px;
            line-height: 30px;
            padding: 0;

            &:nth-child(2) {
              margin-right: 20px;
            }
          }

          .ati-alarm-nature {
            width: 100%;
          }
        }

        .threshold {
          .ad-threshold-title {
            font-size: 14px;
            font-weight: bold;
            position: relative;
            display: flex;
            gap: var(--te-space-4);
            align-items: center;

            .ad-edit-over-limit {
              margin-left: var(--te-space-12);
            }
          }

          .ad-threshold-content {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            padding: 10px;

            .ad-limit {
              margin-right: 100px;
              position: relative;
              margin-left: 30px;

              &:before {
                content: '';
                position: absolute;
                width: 20px;
                height: 20px;
                left: -30px;
                top: 10px;
                background-repeat: no-repeat;
                background-size: contain;
              }
            }

            .up {
              &:before {
                background-image: url('../../assets/alarm-affix-up.png');
              }
            }

            .down {
              &:before {
                background-image: url('../../assets/alarm-affix-down.png');
              }
            }

            .upup {
              &:before {
                background-image: url('../../assets/alarm-affix-upup.png');
              }
            }

            .downdown {
              &:before {
                background-image: url('../../assets/alarm-affix-downdown.png');
              }
            }

            .ad-threshold {
              position: relative;
              margin-left: 30px;

              &:before {
                content: '';
                position: absolute;
                width: 20px;
                height: 20px;
                left: -30px;
                top: 10px;
                background-image: url('../../assets/alarm-affix-threshold.svg');
              }
            }

            .ad-threshold-number {
              font-size: 20px;
              font-weight: bold;

              .unit {
                font-size: 16px;
              }
            }
          }
        }

        .ad-chart-window {
          overflow: hidden;
          position: relative;
          height: 300px;
          width: 100%;

          .ad-chart-wrapper {
            display: flex;
            flex-direction: row;
            position: absolute;
            transition: all 0.5s;
            width: 100%;

            .ad-chart-item {
              position: absolute;
              inset: 0;
            }

            .ad-chart-item:first-of-type {
              .ad-chart-title {
                display: flex;
                flex-direction: row;
                cursor: default;
                gap: var(--te-space-4);
              }
            }

            .ad-chart-title {
              font-size: 14px;
              font-weight: bold;
              position: relative;
              padding-right: 16px;
              display: flex;
              align-items: center;

              .ad-chart-bold {
                font-weight: bold;
              }

              .ad-chart-cursor-pointer {
                cursor: pointer;
              }

              .ad-chart-title-but {
                color: rgba(24, 144, 255, 1);
                cursor: pointer;
                display: flex;
                align-items: center;

                img {
                  margin-right: 5px;
                }
              }
            }

            .ad-chart-realchart {
              width: 100%;
              height: 280px;
            }
          }

          #ad-chart {
            width: 100%;
            height: 280px;
            position: relative;

            .ad-chart-block {
              width: 2px;
              height: 280px;
              position: absolute;
              background-color: #fff;
              top: 0;
              right: 48px;
            }
          }
        }

        .chart-detail {
          display: flex;
          flex-direction: row;
          width: 100%;
          padding-left: 30px;
          align-items: stretch;

          .chart-detail-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0 24px;

            &:not(:first-child) {
              border-left: 1px solid #f0f0f0;
            }
          }

          .item-value {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
          }

          .item-time {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;

            div {
              white-space: nowrap;
            }
          }
        }

        .el-textarea {
          margin: 1px 1px 0 1px;
          width: calc(100% - 2px);
        }

        .tabletitle {
          font-size: 14px;
          font-weight: bold;
          position: relative;
          padding-left: 10px;
          margin-bottom: 10px;

          &:before {
            content: '';
            width: 4px;
            height: 16px;
            background-color: rgba(24, 144, 255, 1);
            position: absolute;
            left: 0;
            top: 2px;
          }
        }

        .ad-remark {
          padding-right: var(--te-space-16);
        }
      }
    }

    .ad-content-right {
      flex: 32;
      min-width: 275px;
      max-height: 620px;
      overflow: scroll;

      .ad-content-right-detail {
        .detail-title {
          color: rgba(16, 16, 16, 100);
          margin-bottom: 5px;
          font-weight: bold;
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--te-space-4);
        }

        .detail-info {
          display: flex;
          flex-direction: column;

          .detail-info-item {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            padding: 2px 0;
            overflow: hidden;

            .detail-info-itemlabel {
              margin-right: 15px;
              color: var(--te-text-color-secondary);
            }

            .detail-info-itemcontent {
              font-weight: 500;
              flex: auto;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      .ad-content-right-progress {
        margin-top: 50px;

        .progress-title {
          font-weight: bold;
          position: relative;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: var(--te-space-4);
        }

        .progress-chart {
          display: flex;
          flex-direction: column;

          .progress-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 40px;
            position: relative;

            &:not(:first-child) {
              &:before {
                content: '';
                width: 2px;
                height: 70px;
                position: absolute;
                bottom: 40px;
                left: 5px;
                background-color: var(
                  --te-border-color-divider,
                  rgba(232, 232, 232, 1)
                );
              }
            }

            .title {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              color: var(--te-text-color-secondary, rgba(0, 0, 0, 0.55));

              .dot {
                display: flex;
                flex-direction: row;
                align-items: center;
                color: var(--te-text-color-primary);

                div {
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background-color: var(--te-color-primary);
                  margin-right: 8px;
                }
              }
            }

            .content {
              margin-left: 20px;
              color: rgba(0, 0, 0, 0.45);
            }
          }
        }

        .te-form-item {
          .te-select-v2 {
            width: 100%;
          }
        }
      }
    }
  }

  .textoverflow {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>

<style>
.ad-overrun-value-input {
  width: 100%;
}
</style>
