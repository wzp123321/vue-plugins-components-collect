<!-- Alert 提示条 -->
<template>
  <te-alert type="warning" show-icon :closable="false" class="alarm-hint-bar">
    <div class="alarm-hint-bar-content">
      <span> 仅展示最近24小时内最新的1000条数据 </span>
      <te-button link type="primary" @click="handleViewMore">
        查看更多告警
      </el-button>
    </div>
  </el-alert>
</template>

<script lang="ts" setup>
import { ElAlert, ElButton } from 'element-plus';
import { ALARM_QUERY_PAGE, IMS_SYSTEM_PREFIX } from '../constant';

defineOptions({ name: 'TeAlarmHintBar' });

/** 跳转历史告警查询页(新窗口) */
const handleViewMore = () => {
  window.open(`${IMS_SYSTEM_PREFIX}${ALARM_QUERY_PAGE}`);
};
</script>

<style lang="less" scoped>
.alarm-hint-bar {
  margin-bottom: 12px;
  flex-shrink: 0;
  :deep(.te-icon.te-alert__icon) {
    width: 16px;
    height: 16px;
  }
  :deep(.te-alert__content) {
    width: 100%;
  }
  .alarm-hint-bar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
