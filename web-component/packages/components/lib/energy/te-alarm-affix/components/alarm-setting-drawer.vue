<!--
 * 告警通知设置抽屉
 * 5 大区域:appScope / sound / notice / subscribe / dnd
 * 表单数据结构 = AlarmNoticeConfigVO,直接绑 DTO 字段
 * 仅保存接口成功才 emit config-saved;取消/×/Esc 永远不调接口
-->
<template>
  <te-drawer
    :model-value="props.modelValue"
    title="告警通知设置"
    direction="rtl"
    :size="560"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    :append-to-body="true"
    @update:model-value="handleModelValueChange"
    @open="handleOpen"
  >
    <div v-loading="loading" class="alarm-setting-drawer">
      <!-- 1. 展示应用范围设置 -->
      <section class="asd-section">
        <TeAlarmSubTitle title="展示应用范围设置" />
        <div class="asd-section-content">
          <p class="asd-tip">勾选应用后，其页面右下角将展示全局告警悬浮图标</p>
          <div class="asd-checkbox-group">
            <te-checkbox
              v-for="m in alarmSettingForm.applicationScopeList"
              :key="m.code"
              :model-value="m.selected"
              :label="m.name"
              @update:model-value="(value: any) => (m.selected = value)"
            />
          </div>
        </div>
      </section>
      <!-- 2. 声音设置 -->
      <section class="asd-section">
        <TeAlarmSubTitle title="声音设置" />
        <div class="asd-section-content">
          <div class="asd-row">
            <div class="asd-row-label">
              <div class="asd-row-title">告警提示音</div>
              <div class="asd-row-desc">新告警到来时播放提示音</div>
            </div>
            <te-switch
              v-model="alarmSettingForm.alarmSoundSwitch"
              :active-value="SwitchFlag.ON"
              :inactive-value="SwitchFlag.OFF"
            />
          </div>

          <div class="asd-row">
            <div class="asd-row-label">
              <div class="asd-row-title">事件提示音</div>
              <div class="asd-row-desc">新事件到来时播放提示音</div>
            </div>
            <te-switch
              v-model="alarmSettingForm.eventSoundSwitch"
              :active-value="SwitchFlag.ON"
              :inactive-value="SwitchFlag.OFF"
            />
          </div>

          <div class="asd-row asd-row--test">
            <te-button :disabled="!speechSupported" @click="handleTestSound">
              <icon-setting />
              <span>点击进行声音播放测试</span>
            </el-button>
          </div>
        </div>
      </section>
      <!-- 3. 通知设置 -->
      <section class="asd-section">
        <TeAlarmSubTitle title="通知设置" />
        <div class="asd-section-content">
          <div class="asd-row">
            <div class="asd-row-label">
              <div class="asd-row-title">弹窗通知</div>
              <div class="asd-row-desc">在页面右下角弹窗告警通知卡片</div>
            </div>
            <te-switch
              v-model="alarmSettingForm.popupNotificationSwitch"
              :active-value="SwitchFlag.ON"
              :inactive-value="SwitchFlag.OFF"
            />
          </div>

          <div class="asd-row">
            <div class="asd-row-label">
              <div class="asd-row-title">弹窗停留时长</div>
            </div>
            <te-select
              v-model="alarmSettingForm.popupStayTime"
              class="asd-row-select"
            >
              <te-option
                v-for="opt in NOTICE_DURATION_OPTIONS"
                :key="String(opt.value)"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>

          <div class="asd-row">
            <div class="asd-row-label">
              <div class="asd-row-title">列表弹窗</div>
              <div class="asd-row-desc">在页面中间直接弹出告警列表弹窗</div>
            </div>
            <te-switch
              v-model="alarmSettingForm.listPopupSwitch"
              :active-value="SwitchFlag.ON"
              :inactive-value="SwitchFlag.OFF"
            />
          </div>
        </div>
      </section>
      <!-- 4. 订阅设置 -->
      <section class="asd-section">
        <TeAlarmSubTitle title="订阅设置" />
        <div class="asd-section-content">
          <div class="asd-row-label has-gap">
            <div class="asd-row-title">订阅告警等级</div>
            <div class="asd-checkbox-group">
              <te-checkbox
                v-for="m in alarmSettingForm.subscribeAlarmLevelList"
                :key="m.code"
                :model-value="m.selected"
                :label="m.name"
                @update:model-value="(value: boolean) => (m.selected = value)"
              />
            </div>
          </div>
          <div class="asd-row-label has-gap">
            <div class="asd-row-title">订阅事件等级</div>
            <div class="asd-checkbox-group">
              <te-checkbox
                v-for="m in alarmSettingForm.subscribeEventLevelList"
                :key="m.code"
                :model-value="m.selected"
                :label="m.name"
                @update:model-value="(value: boolean) => (m.selected = value)"
              />
            </div>
          </div>
          <div class="asd-row-label has-gap">
            <div class="asd-row-title">订阅专业模块</div>
            <div class="asd-checkbox-group">
              <te-checkbox
                v-for="m in alarmSettingForm.subscribeSystemList"
                :key="m.id"
                :model-value="m.selected"
                :label="m.name"
                @update:model-value="(value: boolean) => (m.selected = value)"
              />
            </div>
          </div>
        </div>
      </section>
      <!-- 5. 免打扰 -->
      <section class="asd-section">
        <TeAlarmSubTitle title="免打扰" />
        <div class="asd-section-content">
          <div class="asd-row">
            <div class="asd-row-label">
              <div class="asd-row-title">免打扰模式</div>
              <div class="asd-row-desc">设定时段内不弹窗不响铃</div>
            </div>
            <te-switch
              v-model="alarmSettingForm.noDisturbanceSwitch"
              :active-value="SwitchFlag.ON"
              :inactive-value="SwitchFlag.OFF"
            />
          </div>

          <div
            v-if="alarmSettingForm.noDisturbanceSwitch === '1'"
            class="asd-row"
          >
            <div class="asd-row-label">
              <div class="asd-row-title">免打扰时段</div>
            </div>
            <div class="asd-row-dnd">
              <te-time-picker
                v-model="alarmSettingForm.noDisturbanceStartTime"
                placeholder="请选择"
                format="HH:mm"
                value-format="HH:mm"
              />
              <span class="asd-row-dnd-sep">至</span>
              <te-time-picker
                v-model="alarmSettingForm.noDisturbanceEndTime"
                placeholder="请选择"
                format="HH:mm"
                value-format="HH:mm"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
    <template #footer>
      <te-button @click="handleCancel">取消</el-button>
      <te-button
        type="primary"
        :disabled="saving || loading"
        @click="handleSave"
      >
        确定
      </el-button>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue';
import { IconSetting } from '@arco-iconbox/vue-te';
import {
  ElDrawer,
  ElCheckbox,
  ElSwitch,
  ElButton,
  ElSelect,
  ElOption,
  TeTimePicker,
  ElMessage,
} from 'element-plus';
import { TE_AL_SERVICES_KEY } from '../types/injection';
import {
  NOTICE_DURATION_OPTIONS,
  SwitchFlag,
  type AlarmNoticeConfigVO,
} from '../api/index.api';
import {
  isSpeechSynthesisSupported,
  speakText,
  TTS_TEST_CONTENT,
} from '../utils/tts';
import { TeAlarmSubTitle } from './index';

defineOptions({
  name: 'TeAlarmSettingDrawer',
});

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  /** 配置保存成功,带最新完整配置(原始 DTO),供容器同步给兄弟组件（如首页表格） */
  (event: 'config-saved', config: AlarmNoticeConfigVO): void;
}>();

const services = inject(TE_AL_SERVICES_KEY, null);
if (!services) {
  throw new Error(
    '[AlarmSettingDrawer] 必须在外层 <TeAlarmAffix> / 业务容器内使用',
  );
}

const { fetchConfig, saveConfig } = services.config;

/* ============ 状态 ============ */
const loading = ref(false);
const saving = ref(false);

const alarmSettingForm = ref<AlarmNoticeConfigVO>({
  applicationScopeList: [],
  alarmSoundSwitch: SwitchFlag.OFF,
  eventSoundSwitch: SwitchFlag.OFF,
  popupNotificationSwitch: SwitchFlag.OFF,
  popupStayTime: 5,
  listPopupSwitch: SwitchFlag.OFF,
  subscribeAlarmLevelList: [],
  subscribeEventLevelList: [],
  subscribeSystemList: [],
  noDisturbanceSwitch: SwitchFlag.OFF,
  noDisturbanceStartTime: '',
  noDisturbanceEndTime: '',
});

/** 用 DTO 整体覆盖表单:后端返回什么就展示什么,不重建 */
const setAlarmSettingForm = (params?: AlarmNoticeConfigVO) => {
  alarmSettingForm.value.id = params?.id ?? null;
  alarmSettingForm.value.applicationScopeList =
    params?.applicationScopeList ?? [];
  alarmSettingForm.value.alarmSoundSwitch =
    params?.alarmSoundSwitch ?? SwitchFlag.OFF;
  alarmSettingForm.value.eventSoundSwitch =
    params?.eventSoundSwitch ?? SwitchFlag.OFF;
  alarmSettingForm.value.popupStayTime = params?.popupStayTime ?? 5;
  alarmSettingForm.value.listPopupSwitch =
    params?.listPopupSwitch ?? SwitchFlag.OFF;
  alarmSettingForm.value.subscribeAlarmLevelList =
    params?.subscribeAlarmLevelList ?? [];
  alarmSettingForm.value.subscribeEventLevelList =
    params?.subscribeEventLevelList ?? [];
  alarmSettingForm.value.subscribeSystemList =
    params?.subscribeSystemList ?? [];
  alarmSettingForm.value.noDisturbanceSwitch =
    params?.noDisturbanceSwitch ?? SwitchFlag.OFF;
  alarmSettingForm.value.noDisturbanceStartTime =
    params?.noDisturbanceStartTime ?? '';
  alarmSettingForm.value.noDisturbanceEndTime =
    params?.noDisturbanceEndTime ?? '';
  alarmSettingForm.value.popupNotificationSwitch =
    params?.popupNotificationSwitch ?? SwitchFlag.OFF;
};

/* 浏览器能力检测 */
const speechSupported = isSpeechSynthesisSupported();

/* 抽屉打开:拉取最新配置 */
const handleModelValueChange = (isOpen: boolean) => {
  emit('update:modelValue', isOpen);
};

/** 打开抽屉:拉取最新配置并回填表单 */
const handleOpen = async () => {
  loading.value = true;
  try {
    const remoteDto = await fetchConfig();
    setAlarmSettingForm(remoteDto as AlarmNoticeConfigVO);
  } catch (err) {
    ElMessage.error('配置加载失败');
    console.warn('[AlarmSettingDrawer] handleOpen failed:', err);
    setAlarmSettingForm();
  } finally {
    loading.value = false;
  }
};

/** 取消:永远不 emit config-saved */
const handleCancel = () => {
  emit('update:modelValue', false);
};

/** 声音测试 */
const handleTestSound = () => {
  const played = speakText(TTS_TEST_CONTENT);
  if (!played) {
    ElMessage.error('语音播报启动失败');
  }
};

/** 校验免打扰时段 */
const validateDnd = (): boolean => {
  if (alarmSettingForm.value.noDisturbanceSwitch !== SwitchFlag.ON) return true;
  const { noDisturbanceStartTime, noDisturbanceEndTime } =
    alarmSettingForm.value;
  if (!noDisturbanceStartTime || !noDisturbanceEndTime) {
    ElMessage.error('请选择免打扰时段');
    return false;
  }
  if (noDisturbanceStartTime === noDisturbanceEndTime) {
    ElMessage.error('起始时间不能等于结束时间');
    return false;
  }
  return true;
};

/** 保存:接口无返回,saveConfig 内部用 form 回填 state;emit 同一份 DTO 给容器同步 */
const handleSave = async () => {
  if (!validateDnd()) {
    return;
  }
  saving.value = true;
  try {
    const saveRes = await saveConfig(alarmSettingForm.value);
    emit('config-saved', saveRes);
    emit('update:modelValue', false);
  } catch (err) {
    // 抽屉不关,保留用户输入
    const errorMessage = err instanceof Error ? err.message : '保存失败';
    ElMessage.error(errorMessage);
  } finally {
    saving.value = false;
  }
};
</script>

<style lang="less" scoped>
.alarm-setting-drawer {
  display: flex;
  flex-direction: column;
  gap: var(--te-space-24);
  .asd-section {
    display: flex;
    flex-direction: column;
    gap: var(--te-space-8);
    .asd-section-content {
      display: flex;
      flex-direction: column;
      gap: var(--te-space-8);
      padding-left: var(--te-space-20);
    }
    :deep(.TeAlarmSubTitle) {
      margin-bottom: var(--te-space-8);
    }
    &-header {
      display: flex;
      align-items: center;
      margin: 8px 0 16px;
    }
    &-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--te-color-text-primary);
    }
  }
  .asd-tip {
    color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    margin: 0;
  }
  .asd-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    &-label {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      &.has-gap {
        gap: var(--te-space-8);
      }
    }
    &-title {
      color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
    }
    &-desc {
      color: var(--te-text-color-secondary, rgba(0, 0, 0, 0.55));
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
    }
    &-select {
      width: 160px;
    }
    &-dnd {
      display: flex;
      align-items: center;
      gap: 8px;
      &-sep {
        color: var(--te-color-text-secondary);
        font-size: 13px;
      }
      :deep(.te-input.te-date-editor.te-date-editor--time) {
        width: 120px;
      }
    }
    &--test {
      justify-content: flex-start;
      padding-top: 4px;
      .te-button > span {
        display: flex;
        align-items: center;
        > span {
          color: var(--te-text-color-primary);
          font-weight: 400;
          font-size: 14px;
          line-height: 22px;
        }
        > svg {
          margin-right: var(--te-space-4);
        }
      }
    }
  }
  .asd-checkbox-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
