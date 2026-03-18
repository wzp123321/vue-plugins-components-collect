<template>
  <te-dialog
    v-model="showDialog"
    class="wrap"
    width="460px"
    :before-close="handleClose"
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="showClose"
  >
    <template #header="{}">
      <div class="wrap-header">
        <icon-circle-check-filled
          class="wrap-header-success"
          v-if="exportFileStep === 3"
        />
        <icon-circle-close-filled
          class="wrap-header-fail"
          v-else-if="exportFileStep === 4"
        />
        {{ dialogTitle }}
      </div>
    </template>
    <template v-if="exportFileStep === 1">
      <div class="wrap-export-progress">
        <te-progress :percentage="exportPercent" />
        <div class="wrap-export-progress-text">
          文件导出中，请勿离开当前页面
        </div>
      </div>
    </template>
    <template v-if="exportFileStep === 2">
      <div class="wrap-export-progress">
        <te-progress :percentage="100" status="success" />
        <div class="wrap-export-progress-text">
          文件导出正常，即将添加至下载任务
        </div>
      </div>
    </template>
    <template v-if="exportFileStep === 3">
      <div class="wrap-export-progress">
        <div class="wrap-export-progress-text">
          文件已成功导出，请至下载文件夹查看
        </div>
      </div>
    </template>
    <template v-if="exportFileStep === 4">
      <div class="wrap-export-progress">
        <div class="wrap-export-progress-text">
          {{ `${exportFailMsg}，请重新操作` }}
        </div>
      </div>
    </template>
  </te-dialog>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { TeDialog, TeProgress } from '@tiansu/element-plus';
import {
  IconCircleCheckFilled,
  IconCircleCloseFilled,
} from '@arco-iconbox/vue-te';
import { AxiosInstance } from 'axios';

const props = withDefaults(
  defineProps<{
    // 弹窗关闭后清空数据
    closeDestroy?: boolean;
    // 弹窗显示
    modelValue?: boolean;
    // 外部传入的接口请求实例，必传
    httpRequest: AxiosInstance;
    // 导入接口
    exportApi?: string;
    exportParam?: {};
    // api请求成功code码
    apiSuccessCode?: string;
    // 导出接口回调
    callbackRequestExportApi?: (data: Object) => void;
    // 导出进度查询接口
    exportProgressApi?: string;
    // 导出进度查询接口回调
    callbackRequestExportProgressApi?: (data: Object) => void;
    // 导出文件已生成,点击下载导出的回调函数
    callBackDownloadExportRes?: (fileUrl: string) => void;
    // 导出文件名前缀
    fileName?: string;
  }>(),
  {
    // 设置默认值
    closeDestroy: true,
    modelValue: false,
    apiSuccessCode: '0',
    exportProgressApi: '/sec/excel/{taskId}/progress',
    fileName: '',
  },
);

const dialogTitle = ref('导出');
const exportFileStep = ref(1);
const exportPercent = ref(0); // 导出进度条
const showClose = ref(true); // 是否显示关闭按钮
const exportFailMsg = ref('文件导出失败');

let taskId = ''; // 任务id
let timer: any; // 保证全局唯一，只有一个轮询任务在执行

const emit = defineEmits(['update:modelValue']);

/** ###导出弹窗展示####* */
const showDialog = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

/**
 * 导出失败事件
 * @param errmsg 错误信息
 */
const onExportFailedEvent = (errmsg: string) => {
  showClose.value = true;
  exportFileStep.value = 4;
  dialogTitle.value = '导出失败';
  exportFailMsg.value = errmsg;
};

// 轮询导出进度
const queryExportProcess = () => {
  showClose.value = false;
  const cb = () => {
    props.httpRequest
      ?.post(props.exportProgressApi.replace('{taskId}', taskId), null)
      .then((resp: any) => {
        const respCodeSuccess =
          resp.errcode && resp.errcode === props.apiSuccessCode;
        if (respCodeSuccess || resp.data?.errcode === props.apiSuccessCode) {
          // 更新导入进度
          const respData = respCodeSuccess ? resp.data : resp.data?.data;
          exportPercent.value = respData.progress;
          if (respData.success && respData.progress >= 100) {
            showClose.value = true;
            clearInterval(timer);
            dialogTitle.value = '导出成功';
            exportFileStep.value = 3;
            // 本地调试时使用固定IP地址
            let baseUrl = window.location.origin;
            // 检查是否为本地开发环境（localhost或127.0.0.1）
            if (
              baseUrl.includes('localhost') ||
              baseUrl.includes('127.0.0.1')
            ) {
              baseUrl = 'http://192.168.50.141:10130';
            }
            window.open(`${baseUrl}${respData.fileObjectId}`);
            if (props.callBackDownloadExportRes) {
              props.callBackDownloadExportRes(respData.fileObjectId);
            }
          } else if (!respData.success && respData.progress >= 100) {
            onExportFailedEvent('导出失败！');
            if (timer) {
              clearInterval(timer);
            }
          }
        }
        if (props.callbackRequestExportProgressApi) {
          props.callbackRequestExportProgressApi(resp);
        }
      })
      .catch((error) => {
        if (timer) {
          clearInterval(timer);
        }
        if (props.callbackRequestExportProgressApi) {
          props.callbackRequestExportProgressApi(error);
        }
      });
  };

  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(cb, 1000);
};

const getErrMsg = (error: any) => {
  if (error.data) {
    return error.data.errmsg;
  }
  if (error.response) {
    return error.response.data?.errmsg;
  }
  if (error.message) {
    return error.message;
  }
  return error.response?.data?.errmsg;
};

// 开始导出
const callBackBeginExport = () => {
  if (props.httpRequest) {
    props
      .httpRequest({
        method: 'POST',
        url: props.exportApi,
        data: props.exportParam,
      })
      .then((response: any) => {
        // 检查响应数据是否为 Blob 类型
        if (response.data instanceof Blob) {
          // 直接处理 blob 响应，立即下载文件，不显示弹窗
          const url = window.URL.createObjectURL(response.data);
          const a = document.createElement('a');
          a.href = url;

          // 生成带时间戳的文件名（使用年月日时分秒格式）
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');
          const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
          const fileName = props.fileName
            ? `${props.fileName}_${timestamp}.xlsx`
            : `导出文件_${timestamp}.xlsx`;

          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);

          // 立即关闭弹窗，不显示任何进度
          emit('update:modelValue', false);

          if (props.callBackDownloadExportRes) {
            props.callBackDownloadExportRes(fileName);
          }
          return;
        }

        // 兼容原有的 JSON 响应格式
        const respCodeSuccess =
          response.errcode && response.errcode === props.apiSuccessCode;
        if (
          respCodeSuccess ||
          response.data?.errcode === props.apiSuccessCode
        ) {
          taskId = response.data;
          queryExportProcess();
        } else {
          onExportFailedEvent(response.errmsg);
        }
        if (props.callbackRequestExportApi) {
          props.callbackRequestExportApi(response);
        }
      })
      .catch((error) => {
        // 处理 blob 错误响应
        if (error.response?.data instanceof Blob) {
          const reader = new FileReader();
          reader.onloadend = (e) => {
            try {
              const errorText = e.target?.result as string;
              const errorData = JSON.parse(errorText);
              onExportFailedEvent(
                errorData.message || errorData.errmsg || '导出失败',
              );
            } catch (parseError) {
              console.log(parseError);
              onExportFailedEvent('导出失败');
            }
          };
          reader.readAsText(error.response.data);
        } else {
          onExportFailedEvent(getErrMsg(error));
        }

        if (props.callbackRequestExportApi) {
          props.callbackRequestExportApi(error);
        }
      });
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      setTimeout(() => {
        callBackBeginExport();
      }, 500);
    }
  },
  { immediate: true },
);

const handleClose = () => {
  emit('update:modelValue', false);
};

// 弹窗关闭后的0.5s,将整个弹窗组件卸载掉，释放内存
const ifDialog = ref(true);
watch(showDialog, (value) => {
  if (!props.closeDestroy) {
    ifDialog.value = true;
    return;
  }
  if (value === false) {
    setTimeout(() => {
      exportFileStep.value = 1;
      exportPercent.value = 0;
      dialogTitle.value = '导出';
      ifDialog.value = false;
    }, 500);
  } else {
    ifDialog.value = true;
  }
});
</script>
<style scoped lang="scss">
.wrap {
  .wrap-header {
    color: var(--te-text-color-primary);
    font-size: var(--te-font-size-h16);
    display: flex;
    flex-direction: row;
    align-items: center;
    .wrap-header-success {
      color: var(--te-color-success);
      margin-right: 16px;
    }
    .wrap-header-fail {
      color: var(--te-color-danger);
      margin-right: 16px;
    }
  }
  .wrap-export-progress {
    margin-top: -24px;
    .wrap-export-progress-text {
      color: var(--te-text-color-regular);
      font-size: var(--te-font-size-b14);
      line-height: 22px;
    }
  }
}
</style>
