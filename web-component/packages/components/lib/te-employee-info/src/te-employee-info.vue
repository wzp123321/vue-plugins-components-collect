<template>
  <te-popover
    placement="top-start"
    :width="250"
    trigger="click"
    popper-class="te-employee-info-popover"
    :popper-style="{ padding: 'var(--te-space-16)' }"
    @before-enter="getPersonInfo(id)"
  >
    <template #reference>
      <slot />
    </template>
    <div class="te-employee-info">
      <div class="tei-emo-icon">{{ empInfo.name?.slice(-2) }}</div>
      <div class="tei-title">{{ empInfo.name }}</div>
      <div class="tei-row">
        <div class="tei-label">联系电话</div>
        <div>{{ empInfo.phone }}</div>
        <te-button class="tei-copy" text @click="copyPhone(empInfo.phone)"><icon-copy-document /></el-button>
      </div>
      <div class="tei-row">
        <div class="tei-label">岗位</div>
        <div>{{ empInfo.jobName }}</div>
      </div>
      <div class="tei-row">
        <div class="tei-label">部门</div>
        <div>{{ empInfo.deptName }}</div>
      </div>
      <div class="tei-row">
        <div class="tei-label">标签</div>
        <div>{{ empInfo.labelName }}</div>
      </div>
    </div>
  </el-popover>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { ElPopover, ElButton, ElMessage } from 'element-plus';
import { IconCopyDocument } from '@arco-iconbox/vue-te/esm';
import { type AxiosInstance } from 'axios';

import EmployeeV2OpenApi from '../../api/EmployeeV2OpenApi';
import GetEmployeeRequest from '../../models/GetEmployeeRequest';
import { SafetyService } from './safety';
const props = defineProps<{
  id: string;
  axios: AxiosInstance;
  tenantId: string;
}>();

const empInfo = ref({ name: '', phone: '', deptName: '', labelName: '', jobName: '' });
/**
 * 获取员工信息
 * @param id 员工id
 */
const getPersonInfo = (id?: string) => {
  if (id && props.axios) {
    const params = new GetEmployeeRequest();
    params.idEq = id;
    params.fetchParts = ['department', 'job', 'label', 'phone'];
    EmployeeV2OpenApi.getEmployeeById(props.axios, props.tenantId, params).then((data) => {
      if (data.errcode === '0' && data.data) {
        const info = data.data;
        empInfo.value.name = info.name;
        empInfo.value.phone = SafetyService.decryptGcm(info.phone.nationalNumber) || '';
        empInfo.value.deptName = info.department?.name || '';
        empInfo.value.labelName = info.label?.map((item) => item.name).join('、') || '';
        empInfo.value.jobName = info.job?.name || '';
      }
    });
  }
};
/**
 * 复制电话号码
 * @param phone 电话号码
 */
const copyPhone = (phone: string) => {
  let el = document.createElement('input');
  el.value = phone;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  ElMessage.success('复制成功');
};
</script>

<style lang="less" scoped>
.te-employee-info-popover {
  .tei-emo-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--te-color-primary);
    line-height: 40px;
    color: #fff;
    text-align: center;
    margin-bottom: var(--te-space-8);
  }
  .tei-title {
    font-weight: 600;
    font-size: var(--te-font-size-h16);
    line-height: 24px;
    margin-bottom: var(--te-space-12);
  }
  .tei-row {
    display: flex;
    line-height: 22px;
    &:not(:last-child) {
      margin-bottom: var(--te-space-8);
    }
  }
  .tei-label {
    flex: 0 0 68px;
    color: var(--te-text-color-secondary);
  }
  .tei-copy {
    padding: 0 var(--te-space-8);
    margin-left: var(--te-space-4);
    margin-top: -6px;
  }
}
</style>
