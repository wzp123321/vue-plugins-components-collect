<template>
  <te-dialog
    v-model="showDialog"
    class="wrap"
    title="导入"
    width="560px"
    :before-close="handleClose"
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="showClose"
    v-if="ifDialog"
    v-bind="$attrs"
  >
    <template v-if="importFileStep === ImportStep.preparation">
      <div class="wrap-group-download">
        <div class="wrap-group-download-tip">
          你可以使用自有数据表格导入，也可下载模板进行编辑使用。
        </div>
        <div class="wrap-download-group-btn" @click="downloadTemplate">
          下载模板
        </div>
      </div>

      <div class="wrap-group">
        <te-upload
          ref="uploadRef"
          :limit="1"
          v-bind="$attrs"
          :accept="props.accept"
          :before-upload="beforeUpload"
          :on-error="excelUploadError"
        >
          <te-button v-if="uploadState === 'init'" type="primary">
            <te-icon><icon-upload-filled /></te-icon>
            <span>上传文件</span>
          </te-button>

          <div
            v-else-if="uploadState === 'success'"
            class="wrap-group-upload-success"
          >
            <div class="wrap-group-upload-success-info">
              <te-icon class="wrap-group-upload-success-info-icon">
                <icon-file-type-excel />
              </te-icon>
              <span>{{ fileName }}</span>
            </div>
            <div class="wrap-group-upload-success-btn">重新上传</div>
          </div>

          <div
            v-else-if="uploadState === 'fail'"
            class="wrap-group-upload-fail"
          >
            <div class="wrap-group-upload-fail-info">
              <te-icon class="wrap-group-upload-fail-info-icon"
                ><icon-warning-filled
              /></te-icon>
              <span>{{ uploadFailTip }}</span>
            </div>
            <div class="wrap-group-upload-fail-btn">重新上传</div>
          </div>

          <div
            v-else-if="uploadState === 'pending'"
            class="wrap-group-upload-pending"
          >
            <div class="wrap-group-upload-pending-top-container">
              <div class="wrap-group-upload-success-info">
                <te-icon class="wrap-group-upload-pending-info-icon"
                  ><icon-file-type-excel
                /></te-icon>
                <span>{{ fileName }}</span>
              </div>
              <div class="wrap-group-upload-pending-text">
                {{ `${uploadProgress}%` }}
              </div>
            </div>
            <te-progress
              class="wrap-group-upload-pending-progress"
              :percentage="uploadProgress"
              :show-text="false"
            />
          </div>
        </te-upload>
      </div>

      <div class="wrap-desc" v-if="!tips || tips.length === 0">
        <div class="wrap-desc-info">
          <icon-dot />
          {{
            fileSizeLimitText
              ? fileSizeLimitText
              : `文件导入大小不超过${
                  fileSizeLimit / 1024
                }M，支持文件类型：${fileTypeText}`
          }}
        </div>
        <div class="wrap-desc-info" v-if="props.showImportTips">
          <icon-dot />若文件中存在重复数据，则只会导入其中一条，但不影响其它信息导入
        </div>
        <div v-if="props.showUpdateTips" class="wrap-desc-info">
          <icon-dot />若导入的表格数据与系统中存在的数据重复时，则更新此数据
        </div>
      </div>
      <div class="wrap-desc" v-else>
        <div class="wrap-desc-info" v-for="item in tips" :key="item">
          <icon-dot />{{ item }}
        </div>
      </div>
    </template>
    <template v-else-if="importFileStep === ImportStep.importing">
      <div class="wrap-import-progress">
        <te-progress :percentage="importProgressResult.progress" />
        <div class="wrap-import-progress-text">
          {{
            `文件导入中：成功${importProgressResult.successCount}条，${
              importProgressResult.ignoreCount == undefined
                ? ''
                : `忽略${importProgressResult.ignoreCount}条，`
            }失败${importProgressResult.failCount}条`
          }}
        </div>
      </div>
    </template>
    <div
      v-else-if="importFileStep === ImportStep.end"
      class="wrap-group-import"
    >
      <div
        v-if="
          importProgressResult.successCount > 0 &&
          !importProgressResult.failCount &&
          !importProgressResult.ignoreCount
        "
        class="wrap-group-import-success"
      >
        <div class="wrap-group-import-success-info">
          <te-icon class="wrap-group-import-success-info-icon"
            ><icon-circle-check-filled
          /></te-icon>
          <span>{{
            `导入完成，成功${importProgressResult.successCount}条，${
              importProgressResult.ignoreCount == undefined
                ? ''
                : `忽略${importProgressResult.ignoreCount}条，`
            }失败${importProgressResult.failCount}条`
          }}</span>
          <!-- <te-button link type="primary" @click="downloadImportResultFile"> 下载结果文件 </te-button> -->
        </div>
      </div>
      <div v-else class="wrap-group-import-warning">
        <div class="wrap-group-import-success wrap-group-import-fail">
          <div class="wrap-group-import-success-info">
            <te-icon class="wrap-group-import-success-info-icon"
              ><icon-warning-filled
            /></te-icon>
            <te-text class="wrap-group-import-fail-text"
              >{{
                `部分导入完成，成功${importProgressResult.successCount}条，${
                  importProgressResult.ignoreCount == undefined
                    ? ''
                    : `忽略${importProgressResult.ignoreCount}条，`
                }失败${importProgressResult.failCount}条`
              }}
              <!-- <te-text v-if="importProgressResult.fail > 0" class="wrap-group-import-fail-text">
              ，请下载错误文件并按照提示修改信息后再次上传
          </te-text>   -->
              <te-button
                v-if="
                  importProgressResult.ignoreCount > 0 ||
                  importProgressResult.failCount > 0
                "
                link
                type="primary"
                @click="downloadImportResultFile"
              >
                下载结果文件
              </te-button>
              <!-- <te-button link type="primary" v-if="importProgressResult.fail > 0" class="wrap-group-import-fail-btn" @click="importFileStep = ImportStep.preparation">
              再次上传
          </te-button>   -->
            </te-text>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="importFileStep === ImportStep.interrupt"
      class="wrap-group-import"
    >
      <div class="wrap-group-import-success wrap-group-import-fail">
        <div class="wrap-group-import-success-info">
          <te-icon class="wrap-group-import-success-info-icon"
            ><icon-warning-filled
          /></te-icon>
          <te-text class="wrap-group-import-fail-text"
            >{{
              `导入中断，${
                importProgressResult.successCount == undefined ||
                importProgressResult.successCount <= 0
                  ? ''
                  : `成功${importProgressResult.successCount}条，`
              }${
                importProgressResult.ignoreCount == undefined ||
                importProgressResult.ignoreCount <= 0
                  ? ''
                  : `忽略${importProgressResult.ignoreCount}条，`
              }失败${importProgressResult.failCount}条${`${
                importProgressResult.failCount > 0
                  ? '，请下载结果文件并按照提示修改信息后重新上传'
                  : ''
              }`}`
            }}
          </te-text>
        </div>
      </div>
    </div>

    <template #footer>
      <span
        v-if="importFileStep === ImportStep.preparation"
        class="dialog-footer"
      >
        <te-button @click="handleClose">取消</te-button>
        <te-button
          type="primary"
          @click="onConfirmImport"
          :disabled="uploadState !== 'success'"
          :loading="uploadState === 'pending'"
        >
          确定导入
        </te-button>
      </span>
      <te-button
        v-else-if="importFileStep === ImportStep.importing"
        @click="onImportInterrupt"
        >中断导入</te-button
      >
      <te-button
        v-if="importFileStep === ImportStep.interrupt"
        class="wrap-group-import-fail-btn"
        @click="importFileStep = ImportStep.preparation"
      >
        重新上传
      </te-button>
      <te-button
        type="primary"
        v-if="importFileStep === ImportStep.interrupt"
        @click="downloadImportResultFile"
      >
        下载结果文件
      </te-button>
    </template>
  </te-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, defineEmits, reactive, watch } from 'vue';
import {
  TeIcon,
  TeButton,
  TeDialog,
  TeUpload,
  TeText,
  TeProgress,
} from '@tiansu/element-plus';
import {
  IconDot,
  IconUploadFilled,
  IconFileTypeExcel,
  IconWarningFilled,
  IconCircleCheckFilled,
} from '@arco-iconbox/vue-te';
import type {
  UploadProps,
  UploadRawFile,
  UploadFile,
  UploadInstance,
} from '@tiansu/element-plus';
// import { UploadProgressEvent } from '@tiansu/element-plus/lib/components/upload';
import { AxiosInstance } from 'axios';

// 导入阶段
enum ImportStep {
  preparation = 'preparation', // 待导入
  importing = 'importing', // 导入中
  end = 'end', // 导入完成
  interrupt = 'interrupt', // 导入中断
}

type Update_Status = 'init' | 'pending' | 'fail' | 'success';

/** #######接收父组件传参####### */
const props = withDefaults(
  defineProps<{
    // 弹窗关闭后清空数据
    closeDestroy?: boolean;
    // 弹窗显示
    modelValue?: boolean;
    // 更新数据文案是否显示，默认true
    showUpdateTips?: boolean;
    // 导入结果提示
    showImportTips?: boolean;
    // 文件类型限制
    accept?: string;
    // 上传尺寸限制
    fileSizeLimit?: number;
    // 外部传入的接口请求实例，必传
    httpRequest: AxiosInstance;
    // 导入接口
    importApi: string;
    // 导入接口额外参数
    importParam?: object;
    // 导入进度查询接口
    importProgressApi?: string;
    // 导入中断接口
    importInterruptApi?: string;
    // 导入接口回调
    callbackRequestImportApi?: (data: Object) => void;
    // 导入进度查询接口回调
    callbackRequestImportProgressApi?: (data: Object) => void;
    // 导入中断的回调函数
    callBackImportInterruptApi?: (data: Object) => void;
    // 导入完成后的回调函数
    callBackImportEnd?: (data: Object) => void;
    // 点击下载结果文件的回调函数
    callBackDownloadImportRes?: (fileUrl: string) => void;
    // 点击下载模板文件的回调函数
    callBackDownloadTemplate?: () => void;
    // api请求成功code码
    apiSuccessCode?: string;
    // 文件大小限制描述
    fileSizeLimitText?: string;
    // 提示文案
    tips?: string[];
  }>(),
  {
    // 设置默认值
    closeDestroy: true,
    modelValue: false,
    showUpdateTips: true,
    showImportTips: true,
    accept: '.xls,.xlsx,.xlsm',
    fileSizeLimit: 102400,
    importApi: '',
    importProgressApi: '',
    importInterruptApi: '',
    apiSuccessCode: '0',
    tips: () => [],
  },
);
// 事件向上冒泡
const emit = defineEmits(['update:modelValue']);

/** ###导入弹窗展示####* */
const showDialog = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
const handleClose = () => {
  emit('update:modelValue', false);
};

const showClose = ref(true); // 是否显示关闭按钮
const uploadRef = ref<UploadInstance>();

// 可接受的文件类型说明
const fileTypeText = computed(() =>
  props.accept.split('.').join('').split(',').join('、'),
);
const importFileStep = ref(ImportStep.preparation); // 导入阶段

const uploadState = ref<Update_Status>('init'); // 上传状态
const uploadFailTip = ref(''); // 错误提示

const fileType = props.accept.split(','); // 文件类型限制
const fileName = ref(''); // 文件名
const uploadProgress = ref(0); // 上传进度

let resFileUrl = ''; // 导入结果文件地址
let taskId = ''; // 上传任务id
let timer: any; // 保证全局唯一，只有一个轮询任务在执行

// 导入进度数据
const importProgressResultDefault = {
  progress: 0,
  successCount: 0,
  failCount: 0,
  ignoreCount: 0,
  errorMsg: '',
};
const importProgressResult = ref(importProgressResultDefault);
let selectFile: File;

// 设置上传失败提示语
const setUploadFailTip = (value: string) => {
  uploadState.value = 'fail';
  uploadFailTip.value = value;
};

// 文件上传之前判断
const beforeUpload: UploadProps['beforeUpload'] = (file: UploadRawFile) => {
  // if (fileList.value.length >= limit) {
  //   setUploadFailTip(`上传文件数量不能超过${limit}个!`);
  //   return false;
  // }
  let fileExtension = '';
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.'));
  }
  const isFile = fileType.some((type: string) => {
    if (file.type.indexOf(type) > -1) return true;
    return !!(fileExtension && fileExtension.indexOf(type) > -1);
  });
  const isLimit = file.size > props.fileSizeLimit * 1024;
  if (!isFile) {
    setUploadFailTip(`文件格式不正确, 请选择正确的文件上传`);
    return false;
  }
  if (isLimit) {
    setUploadFailTip(`上传文件大小不能超过${props.fileSizeLimit / 1024}M!`);
    return false;
  }

  selectFile = file;
  fileName.value = file.name;
  uploadState.value = 'success';
  return false;

  // 开始上传的回调函数
  // if (props.callBackBeforeUpload) {
  //   const resolve = (headersParms: Headers | Record<string, any>, dataParms: Record<string, any>) => {
  //     Object.assign(headers, headersParms);
  //     Object.assign(data, dataParms);
  //   };
  //   props.callBackBeforeUpload(resolve);
  // }
  // fileUploadSuccess.value = false;
  // TeMessage.success('正在上传文件，请稍候...');
};

// const handleUpload: UploadProps['httpRequest'] = (options: UploadRequestOptions) => {
//   let params = new FormData();
//   params.append('file', options.file);
//   params.append('module', 'hlmsFrontExcel');
//   params.append('isCovered', '1');

//   return CommonProxy.post<string>(props.uploadTargetUrl, params);
// };

// 文件上传成功
// const handleFileSuccess: UploadProps['onSuccess'] = (
//   _res: unknown,
//   uploadFile: UploadFile,
// ): void => {
//   // 上传成功后清空上传列表，否则无法再次上传
//   uploadRef.value!.clearFiles();
//   fileName.value = uploadFile.name;
// const resolve = (state: boolean, failText?: string) => {
//   let failTextInit = '上传失败，请您重新上传！';
//   if (state) {
//     uploadState.value = 'success';
//     fileUploadSuccess.value = true;
//   } else {
//     setUploadFailTip(failText || failTextInit);
//   }
// };
// if (props.callBackAfterUpload) {
//   props.callBackAfterUpload(res, resolve);
// }
// };

// 上传错误提示
const excelUploadError: UploadProps['onError'] = (): void => {
  setUploadFailTip('上传失败，请您重新上传！');
};

/**
 * ##################
 * 导入完成
 * 导入进度为100时，弹窗切换为展示导入结果
 */
const endFileImport = (respData: Object) => {
  showClose.value = true;
  importFileStep.value = ImportStep.end;
  props.callBackImportEnd && props.callBackImportEnd(respData);
};

/**
 * 轮询查询导入进度
 */
const queryImportProcess = () => {
  showClose.value = false;
  const cb = () => {
    props.httpRequest
      ?.post(props.importProgressApi.replace('{taskId}', taskId), null)
      .then((resp: any) => {
        const respCodeSuccess =
          resp.errcode && resp.errcode === props.apiSuccessCode;
        if (respCodeSuccess || resp.data?.errcode === props.apiSuccessCode) {
          // 更新导入进度
          const respData = respCodeSuccess ? resp.data : resp.data?.data;
          importProgressResult.value = { ...respData };
          // 任务失败状态，取消轮询
          const taskFailed =
            respData.taskStatus &&
            ['fail', 'timeout_fail', 'cancel'].includes(respData.taskStatus);
          if (importProgressResult.value.progress >= 100 || taskFailed) {
            clearInterval(timer);
            endFileImport(respData);
            resFileUrl = respData.resultFileObjectId
              ? respData.resultFileObjectId
              : respData.fileObjectId;
          }
        }
        props.callbackRequestImportProgressApi &&
          props.callbackRequestImportProgressApi(resp);
      })
      .catch((error) => {
        props.callbackRequestImportProgressApi &&
          props.callbackRequestImportProgressApi(error);
      });
    // const resolve = (importProgressParms: ProgressResult, errorState = false) => {
    //   Object.assign(importProgressResult, {
    //     percent: parseInt(importProgressParms.percent.toString()),
    //     success: parseInt(importProgressParms.success.toString()),
    //     fail: parseInt(importProgressParms.fail.toString()),
    //     errorMessage: importProgressParms.errorMessage,
    //   });
    //   if (errorState) {
    //     //接口错误情况下，清除轮询
    //     onImportInterrupt()
    //     return;
    //   }
    //   if (importProgressResult.percent === 100) {
    //     clearInterval(timer);
    //     endExcelUpload();
    //   }
    // };
    // props.callBackImportProcess && props.callBackImportProcess(taskId, resolve);
    // return cb;
  };

  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(cb, 1000);
};

const getErrMsg = (error) => {
  if (error.data) {
    return error.data.errmsg;
  } else if (error.response) {
    return error.response.data?.errmsg;
  } else if (error.message) {
    return error.message;
  }
  return error.response?.data?.errmsg;
};

/**
 * 确定导入点击
 */
const onConfirmImport = () => {
  uploadState.value = 'pending';
  const formData = new FormData();
  formData.append('file', selectFile);

  if (props.importParam) {
    for (const [key, value] of Object.entries(props.importParam)) {
      formData.append(key, value);
    }
  }
  if (props.httpRequest) {
    props
      .httpRequest({
        method: 'POST',
        url: props.importApi,
        data: formData,
      })
      .then((resp: any) => {
        uploadState.value = 'success';
        const respCodeSuccess =
          resp.errcode && resp.errcode === props.apiSuccessCode;
        if (respCodeSuccess || resp.data?.errcode === props.apiSuccessCode) {
          importFileStep.value = ImportStep.importing;
          taskId = resp.data?.taskId;
          queryImportProcess();
        }
        props.callbackRequestImportApi && props.callbackRequestImportApi(resp);
      })
      .catch((error) => {
        setUploadFailTip(getErrMsg(error));
        props.callbackRequestImportApi && props.callbackRequestImportApi(error);
      });
  }
};

/**
 * 导入中断事件
 */
const onImportInterrupt = () => {
  props.httpRequest
    ?.post(props.importInterruptApi.replace('{taskId}', taskId), null)
    .then((resp: any) => {
      const respCodeSuccess =
        resp.errcode && resp.errcode === props.apiSuccessCode;
      if (respCodeSuccess || resp.data?.errcode === props.apiSuccessCode) {
        clearInterval(timer);
        importFileStep.value = ImportStep.interrupt;
        showClose.value = true;
        if (respCodeSuccess) {
          resFileUrl = resp.data?.resultFileObjectId
            ? resp.data?.resultFileObjectId
            : resp.data?.fileObjectId;
        } else {
          resFileUrl = resp.data?.data?.resultFileObjectId
            ? resp.data?.data?.resultFileObjectId
            : resp.data?.data?.fileObjectId;
        }

        props.callBackImportInterruptApi &&
          props.callBackImportInterruptApi(resp);
      }
    })
    .catch((error) => {
      props.callBackImportInterruptApi &&
        props.callBackImportInterruptApi(error);
    });
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
      uploadState.value = 'init';
      importFileStep.value = ImportStep.preparation;
      importProgressResult.value = importProgressResultDefault;
      ifDialog.value = false;
    }, 500);
  } else {
    ifDialog.value = true;
  }
});

/**
 * 点击下载导入结果文件
 */
const downloadImportResultFile = () => {
  if (props.callBackDownloadImportRes) {
    props.callBackDownloadImportRes(resFileUrl);
  }
};

/** ##########下载导入文件模板############### */
const downloadTemplate = () => {
  if (props.callBackDownloadTemplate) {
    props.callBackDownloadTemplate();
  }
};
</script>

<style lang="scss" scoped>
.wrap {
  .wrap-group-download {
    margin-top: var(--te-space-30);
    border-radius: 2px;
    background: var(--te-color-info-light-9);
    color: var(--te-color-info);
    font-size: var(--text-size-14);
    line-height: 22px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 16px 8px 16px;
    .wrap-download-group-btn {
      color: var(--te-color-primary);
      cursor: pointer;
      margin-left: 4px;
    }
  }

  .wrap-desc {
    margin-top: var(--te-space-48);
    .wrap-desc-info {
      color: var(--te-text-color-primary);
      font-size: var(--text-size-14);
      line-height: 22px;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }

  .wrap-group {
    margin-top: var(--te-space-48);
    width: 100%;

    %wrap-group-upload-normal {
      width: 520px;
      border-radius: 2px;
      font-size: var(--text-size-14);
      line-height: 22px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px 8px 16px;
      box-sizing: border-box;
    }
    .wrap-group-upload-success {
      @extend %wrap-group-upload-normal;
      background: var(--te-color-success-light-9);
      color: var(--te-color-success);

      .wrap-group-upload-success-info {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .wrap-group-upload-success-info-icon {
        margin-right: 4px;
      }
      .wrap-group-upload-success-btn {
        color: var(--te-color-primary);
      }
    }
    .wrap-group-upload-fail {
      @extend %wrap-group-upload-normal;
      background: var(--te-color-warning-light-9);
      color: var(--te-color-warning);

      .wrap-group-upload-fail-info {
        display: flex;
        flex-direction: row;
        align-items: center;
        .wrap-group-upload-fail-icon {
          margin-right: 4px;
        }
      }
      .wrap-group-upload-fail-btn {
        color: var(--te-color-primary);
      }
    }

    .wrap-group-upload-pending {
      height: 32px;
      display: flex;
      // padding: 0 4px 0 4px;
      color: var(--te-text-color-regular);
      // background: transparent;
      flex-direction: column;
      width: 520px;

      .wrap-group-upload-pending-top-container {
        width: 100%;
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .wrap-group-upload-pending-info-icon {
          margin-right: 4px;
          color: #21b534;
        }
        .wrap-group-upload-pending-text {
          font-size: var(--text-size-12);
        }
      }

      .wrap-group-upload-pending-progress {
        display: flex;
        width: 100%;

        :deep(.te-progress-bar__outer) {
          height: 2px !important;
        }
      }
    }
  }

  .wrap-import-progress {
    padding-bottom: 228px;

    :deep(.te-progress__text) {
      font-size: 12px !important;
      line-height: 20px;
    }

    .wrap-import-progress-text {
      color: var(--te-text-color-regular);
      font-size: var(--text-size-14);
      line-height: 20px;
    }
  }

  .wrap-group-import {
    padding-bottom: 228px;
    .wrap-group-import-success {
      width: 520px;
      border-radius: 2px;
      background: var(--te-color-success-light-9);
      color: var(--te-color-success);
      font-size: var(--text-size-14);
      line-height: 22px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px 8px 16px;
      box-sizing: border-box;

      .wrap-group-import-success-info {
        display: flex;
        // flex-direction: row;
        // align-items: center;
        .wrap-group-import-success-info-btn {
          color: var(--te-color-primary);
          cursor: pointer;
        }
      }
      .wrap-group-import-success-info-icon {
        margin-top: 3px;
        margin-right: var(--te-space-8);
        font-size: var(--te-font-size-h16);
      }
    }

    .wrap-group-import-warning {
      width: 520px;
      border-radius: 2px;
      background: var(--te-color-warning-light-9);
      color: var(--te-color-warning);
      font-size: var(--text-size-14);
      line-height: 22px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 8px 16px 8px 16px;
      box-sizing: border-box;

      .wrap-group-import-warning-icon {
        margin-right: 4px;
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 22px;
        font-size: var(--te-font-size-b16);
      }

      .wrap-group-import-warning-info {
        .wrap-group-import-warning-btn {
          margin-left: var(--te-space-4);
          cursor: pointer;
        }
      }
    }

    .wrap-group-import-success-temp {
      border-radius: 2px;
      background: var(--te-fill-color);
      color: var(--te-color-info) !important;
      box-sizing: border-box;
    }
    .wrap-group-import-fail {
      border-radius: 2px;
      background: var(--te-color-warning-light-9);
      color: var(--te-color-warning) !important;
      box-sizing: border-box;

      .wrap-group-import-fail-text {
        color: var(--te-color-warning);
        display: flex;
        align-items: center;

        .wrap-group-import-fail-btn {
          margin-left: var(--te-space-4);
        }
      }
    }
  }
}
</style>
