<template>
  <div class="daar-level-wrapper" id="daar-level-wrapper">
    <span class="icon" :style="{backgroundColor: mapBgColor(level as EDaarAlarmLevel)}"></span>
    <span>{{ mapAlarmText(level as EDaarAlarmLevel, levelText) }}</span>
  </div>
</template>
<script lang="ts" setup>
import { EDaarAlarmLevel } from '../../data-abnomal-alarm-rules.api';

defineProps({
  level: {},
  levelText: {
    type: String,
    default: '',
  },
});

function mapBgColor(level: EDaarAlarmLevel) {
  let color = '#f4160f';
  switch (level) {
    case EDaarAlarmLevel.严重:
      color = '#f4160f';
      break;
    case EDaarAlarmLevel.重要:
      color = '#ff8113';
      break;
    case EDaarAlarmLevel.次要:
      color = '#ffca00';
      break;
    case EDaarAlarmLevel.提示:
      color = '#3997d7';
      break;
    default:
      color = '#f4160f';
  }
  return color;
}
function mapAlarmText(level: EDaarAlarmLevel, alarmText: string) {
  if (!!alarmText) {
    return alarmText;
  }
  switch (level) {
    case EDaarAlarmLevel.严重:
      alarmText = '严重';
      break;
    case EDaarAlarmLevel.重要:
      alarmText = '重要';
      break;
    case EDaarAlarmLevel.次要:
      alarmText = '次要';
      break;
    case EDaarAlarmLevel.提示:
      alarmText = '提示';
      break;
    default:
      alarmText = '';
  }
  return alarmText;
}
</script>
<style lang="less" scoped>
#daar-level-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    display: inline-block;
  }

  span.icon {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    margin-right: 7px;
  }
}
</style>
