<template>
  <!-- 上传文件弹框 -->
  <el-dialog
    title="上传文件"
    :model-value="uploadFileDialogVisible"
    :width="480"
    @close="onCancel(uploadFormRef)"
    custom-class="dialogModel"
  >
    <el-form
      ref="uploadFormRef"
      :model="uploadFormData"
      :rules="uploadFormRules"
      label-width="76px"
      @submit.native.prevent
    >
      <el-form-item label="文件类别" prop="fileType">
        <el-select
          v-model="uploadFormData.fileType"
          style="width: 328px"
          :disabled="fileTypeList.length === 1"
          @change="fileTypeChange"
        >
          <el-option
            v-for="(item, index) in fileTypeList"
            :key="index"
            :label="item.name"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间维度" prop="timeFrame">
        <!-- <el-select v-model="uploadFormData.timeFrame" style="width: 328px">
          <el-option v-for="(item, index) in timeDimensionList" :key="index" :value="item" :label="item"></el-option>
        </el-select> -->
        <el-date-picker
          v-model="uploadFormData.timeFrame"
          type="year"
          style="width: 328px"
          placeholder="请选择时间维度"
          :disabled-date="filterDate"
          value-format="YYYY"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="附件" prop="file">
        <el-button type="primary" @click="onSelectFile">选择</el-button>&nbsp;
        <el-tooltip effect="dark" placement="right">
          <template v-slot:content>
            <div style="word-break: break-all; white-space: normal">支持.xls/.xlsx格式文件，大小不超过100MB</div>
          </template>
          <i class="toc-iconfont icon-toc-wenhao"></i>
        </el-tooltip>
        <p>{{ fileName ?? '' }}</p>
      </el-form-item>
      <el-divider></el-divider>
      <el-row type="flex" justify="end">
        <el-button @click="onCancel(uploadFormRef)">取消</el-button>
        <el-button type="primary" @click="onSubmitForm(uploadFormRef)">确定</el-button>
      </el-row>
    </el-form>
  </el-dialog>

  <!-- 导入错误数据弹框 -->
  <el-dialog
    custom-class="import-error-dialog"
    v-model="importErrorVisible"
    title="错误原因"
    width="800px"
    :before-close="errorDialogClose"
  >
    <table style="width: 100%" scroll-y>
      <thead :style="{ width: errorDataList?.length > 10 ? 'calc(100% - 8px)' : '100%' }">
        <tr>
          <th style="width: 50px">序号</th>
          <th style="width: 170px">模板位置</th>
          <th>详细信息</th>
        </tr>
      </thead>
      <tbody style="height: 480px" @scroll="">
        <tr v-for="(item, index) in errorDataList" :key="index">
          <td style="width: 50px">{{ index + 1 }}</td>
          <td style="width: 170px" ellipsis>
            <el-tooltip effect="dark" placement="bottom" :offset="4" :show-after="500">
              <template v-slot:content>
                <div style="word-break: break-all; white-space: normal">{{ item.position }}</div>
              </template>
              <span>{{ item.position }}</span>
            </el-tooltip>
          </td>
          <td ellipsis>
            <el-tooltip effect="dark" placement="bottom" :offset="4" :show-after="500">
              <template v-slot:content>
                <div style="word-break: break-all; white-space: normal">{{ item.detail }}</div>
              </template>
              <span>{{ item.detail }}</span>
            </el-tooltip>
          </td>
        </tr>
      </tbody>
    </table>
  </el-dialog>

  <!-- 数据重复弹框 -->
  <el-dialog v-model="visible" width="480px" title="上传数据重复" :append-to-body="true" :modal="true">
    <div style="margin-bottom: 8px">
      <el-icon style="vertical-align: text-top; margin-right: 8px" color="#FAAD14"><WarningFilled /></el-icon>
      <span>上传文件中数据部分重复，确定要继续上传并覆盖吗？</span>
    </div>
    <div style="margin-left: 22px; margin-bottom: 20px">
      <p>如选择确定，则覆盖当前文件；如选择取消，则取消上传。</p>
    </div>
    <el-divider></el-divider>
    <el-row type="flex" justify="end">
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onSubmit">确定</el-button>
    </el-row>
  </el-dialog>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { FGetCookie } from '@/core/token';
import { FGetQueryParam, getTenant } from '@/utils/index';

import { default as mitt } from '@/core/eventbus';
import message from '@/utils/message';

import { Service } from './fm-upload.service';
import { useFileUploadHandler } from '@/core/file';

import { DictDetailQueryByCodeResponse } from '../fm-searchbar/fm-searchbar.api';
import { ImportType, FileManagementUploadFormData } from '../fm-table/fm-table.api';

import { WarningFilled } from '@element-plus/icons-vue';

const props = defineProps(['uploadFileDialogVisible']);
const uploadFileDialogVisible = computed(() => props.uploadFileDialogVisible);
const emits = defineEmits(['closeUploadFileDialog', 'queryFileListPage']);
const uploadFormRef = ref();

// 文件对象
let file = ref<any>();
// 文件名称
const fileName = ref<string | undefined>('');
defineExpose({ fileName, file });

// 数据重复弹框显隐
const visible = ref<boolean>(false);

// 上传文件参数
const uploadFormData = ref<FileManagementUploadFormData>({
  fileType: '',
  timeFrame: '', // 时间范围
  timeFrameType: '',
});

// 文件类别列表
const fileTypeList = ref<DictDetailQueryByCodeResponse[]>([]);

// 时间维度列表
const timeDimensionList = ref<string[]>([]);
// 文件格式校验
const checkFile = (rule: any, value: any, callback: any) => {
  if (file.value === null) {
    callback(new Error('请选择文件上传'));
  } else if (file.value.size > 1024 * 1024 * 100) {
    callback(new Error('文件大小不超过100MB'));
  } else if (file.value.name.substring(file.value.name.lastIndexOf('.')) !== '.xls') {
    if (file.value.name.substring(file.value.name.lastIndexOf('.')) !== '.xlsx') {
      callback(new Error('文件格式不正确'));
    } else {
      callback();
    }
    callback(new Error('文件格式不正确'));
  } else {
    callback();
  }
};

const uploadFormRules = ref({
  fileType: [{ required: true, message: '请选择文件类别', trigger: 'blur' }],
  timeFrame: [{ required: true, message: '请选择时间维度', trigger: 'change' }],
  file: [{ validator: checkFile, required: true, trigger: 'change' }],
});
const onSelectFile = async () => {
  const res = await useFileUploadHandler(false, '.xls,.xlsx');
  if (res) {
    file.value = res;
    fileName.value = file.value.name;
    uploadFormRef.value.clearValidate(['file']);
  }
};

// 查询时间维度列表
const queryTimeDimensionList = async () => {
  try {
    const params = {
      category: uploadFormData.value.fileType,
      ...getTenant(),
    };
    const res = await Service.queryTimeDimensionList(params);
    if (res?.data && res.code === 200) {
      timeDimensionList.value = res.data?.dimensionList;
      uploadFormData.value.timeFrameType = res.data?.timeDimensionType;
    } else {
      timeDimensionList.value = [];
    }
  } catch (error) {
    timeDimensionList.value = [];
    console.log(error, '查询时间维度列表失败');
  }
};

const fileTypeChange = (val: string) => {
  uploadFormData.value.fileType = val;
  uploadFormData.value.timeFrame = '';
  queryTimeDimensionList();
};

const importErrorVisible = ref<boolean>(false);
const errorDataList = ref();
const upload = async (file: File, importType: number = ImportType.初次导入) => {
  try {
    const form: any = new FormData();
    form.append('file', file);
    form.append('tenantId', getTenant().tenantId);
    form.append('tenantCode', getTenant().tenantCode);
    form.append('category', uploadFormData.value.fileType);
    form.append('timeDimensionType', uploadFormData.value.timeFrameType);
    form.append('timeDimension', uploadFormData.value.timeFrame);
    form.append('firstUpload', importType);
    const res = await Service.uploadFile(form);
    if (res === true) {
      emits('closeUploadFileDialog');
      emits('queryFileListPage');
      // fileName.value = '';
    } else if (res.data === null && res.code === 2004 && !res.success) {
      // 数据重复
      visible.value = true;
      const dialogModel = document.getElementsByClassName('dialogModel');
      (dialogModel[0] as HTMLElement).style.display = 'none';
    } else if (res.errorMessageList && res.errorMessageList.length > 0) {
      // 某一行错误
      importErrorVisible.value = true;
      errorDataList.value = res.errorMessageList || [];
    } else if (res.data === null && res.code === 500 && !res.success) {
      message.error(res.message);
    }
  } catch (error) {
    message.error('导入失败，请求超时');
    importErrorVisible.value = false;
    console.log(error, '导入失败');
    if (error === false) {
      message.warning('检测到文件已被修改，请重新选择文件');
    }
  }
};

const onClose = () => {
  visible.value = false;
  const dialogModel = document.getElementsByClassName('dialogModel');
  (dialogModel[0] as HTMLElement).style.display = 'block';
};

const onSubmit = () => {
  visible.value = false;
  upload(file.value, ImportType.覆盖文件);
  // file.value = null;
  onClose();
};

const errorDialogClose = () => {
  importErrorVisible.value = false;
  emits('closeUploadFileDialog');
};

// 上传文件提交
const onSubmitForm = (refEl: any) => {
  if (!refEl) return;
  refEl.validate((valid: any, fields: any) => {
    if (valid) {
      // 上传文件
      upload(file.value);
      // if (file.value) {
      //   file.value = null;
      // }
    } else {
      console.log('error submit!', fields);
    }
  });
};

const onCancel = (elForm: any) => {
  emits('closeUploadFileDialog');
  if (!elForm) return;
  elForm.resetFields();
};

const filterDate = (val: any) => {
  return !timeDimensionList.value.includes(String(val.getFullYear()) + '年');
};

// 监听来自searchbar的【文件类别】事件（初始化查询）
mitt.on('fileTypeList', (val: any) => {
  fileTypeList.value = val;
  if (val.length === 1) {
    uploadFormData.value.fileType = val[0].code;
    queryTimeDimensionList();
  }
});

onMounted(() => {});

// 关闭查询监听事件
onUnmounted(() => {
  mitt.off('fileTypeList');
});
</script>
<style lang="less" scoped>
:deep(.el-input__suffix) {
  justify-content: center;
  align-items: center;
  right: 7px;
}
</style>
<style lang="less">
.el-dialog {
  .el-dialog__header {
    padding: 12px 20px;
  }

  &__body {
    margin-top: 10px;
    padding: 10px 20px;
  }

  .el-divider--horizontal {
    margin: 8px 0px;
  }
}
</style>
