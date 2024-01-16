<template>
  <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="76px" @submit.native.prevent>
    <el-form-item label="省份" prop="province">
      <el-select
        placeholder="请选择"
        v-model="formData.province"
        style="width: 328px"
        filterable
        default-first-option
        @change="provinceChange"
      >
        <el-option v-for="(item, index) in provinceList" :key="index" :label="item.name" :value="item.code"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="导入类型" prop="importType">
      <el-radio-group v-model="formData.importType" @change="importTypeChange">
        <el-radio-button label="已有项目" />
        <el-radio-button label="新增项目" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="医院名称" prop="hospitalName" :key="formData.importType">
      <el-input
        style="width: 328px"
        placeholder="请选择医院名称"
        v-model="formData.hospitalName"
        v-inputFilter:search="{ allowSpace: false, regularStr: regularStr }"
        :maxlength="50"
        v-if="formData.importType === '新增项目' && hospitalNameListOptions.length === 0"
      />
      <te-select-v2
        v-else
        placeholder="请选择"
        v-model="formData.hospitalName"
        style="width: 328px; height: 36px"
        :height="272"
        filterable
        :allow-create="formData.importType === '新增项目' && hospitalNameListOptions.length === 0"
        default-first-option
        @change="hospitalNameChange"
        :options="hospitalNameListOptions"
        :teleported="false"
        :title="formData.hospitalName"
      >
        <template #default="{ item }">
          <div @click="getMoreParam(item)" style="height: 100%; display: flex; align-items: center" :title="item.label">
            <span style="margin-right: 8px; overflow: hidden; text-overflow: ellipsis">{{ item.label }}</span>
          </div>
        </template>
      </te-select-v2>
    </el-form-item>
    <el-form-item label="附件" prop="uploadFile" role="file">
      <el-button type="primary" @click="importData">选择</el-button>&nbsp;
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
      <el-button @click="onCancel(ruleFormRef)">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)">确定</el-button>
    </el-row>
  </el-form>

  <!-- 导入数据重复弹窗 + -->
  <el-dialog
    v-model="visible"
    width="480px"
    title="导入数据重复"
    :append-to-body="true"
    :modal="false"
    @close="onClose"
  >
    <div style="margin-bottom: 8px">
      <el-icon style="vertical-align: text-top; margin-right: 8px" color="#FAAD14"><WarningFilled /></el-icon>
      <span>导入数据部分重复，确定要覆盖当前版本吗？</span>
    </div>
    <div style="margin-left: 22px; margin-bottom: 20px">
      <p>如选择确定，则存入当前版本并覆盖重复数据；如选择新建版本，则将新建版本并将当前版本的重复数据存为历史版本。</p>
    </div>
    <el-divider></el-divider>
    <el-row>
      <el-col :span="12">
        <el-button @click="onNewBuiltSubmit">新建版本</el-button>
      </el-col>
      <el-col :span="12">
        <el-row type="flex" justify="end">
          <el-button @click="onClose">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </el-row>
      </el-col>
    </el-row>
  </el-dialog>
  <!-- 导入数据重复弹窗 - -->

  <!-- 导入模板错误数据 + -->
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
          <th>模板位置</th>
          <th>详细信息</th>
        </tr>
      </thead>
      <tbody style="height: 480px" @scroll="onScroll">
        <tr v-for="(item, index) in errorDataList" :key="index">
          <td style="width: 50px">{{ index + 1 }}</td>
          <td ellipsis>
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
  <!-- 导入模板错误数据 - -->
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, nextTick } from 'vue';

import { WarningFilled } from '@element-plus/icons-vue';

import message from '@/utils/message';
import { onScroll } from '@/utils/index';

import { Service } from './epl-l-import-template.service';
import { IFormData, IKeyValue, ErrorDataListType, HistoryFlagType } from './epl-l-import-template.api';
import { useFileUploadHandler } from '@/core/file';

export default defineComponent({
  name: 'EplLImportTemplate',
  emits: ['close', 'search', 'getHospitalNameList'],
  components: {
    WarningFilled,
  },
  setup(props, { emit }) {
    const regularStr = String.raw`\`\-\\;\'\"<>\/\?\*\[\]\:\？\：`;
    const visible = ref<boolean>(false);
    const formData = reactive<IFormData>({
      province: '',
      importType: '已有项目',
      hospitalName: '',
      hospitalId: '',
      hospitalRelId: '',
    });
    const provinceList = ref<IKeyValue[]>([]);
    const hospitalNameList = ref<any>([]);
    const hospitalNameListOptions = ref<any>([]);

    // 上传文件校验
    const errorMessage = ref<string | null>('请选择文件上传');
    const checkFile = (rule: any, value: any, callback: any) => {
      if (!file) {
        return callback(new Error('请选择文件上传'));
      } else if ((file as File).size > 1024 * 1024 * 100) {
        callback(new Error('文件大小不超过100MB'));
      } else if ((file as File).name.substring((file as File).name.lastIndexOf('.')) !== '.xls') {
        if ((file as File).name.substring((file as File).name.lastIndexOf('.')) !== '.xlsx') {
          callback(new Error('文件格式不正确'));
        } else {
          callback();
        }
        callback(new Error('文件格式不正确'));
      } else {
        callback();
      }
    };

    // 医院名称校验
    const checkHospitalName = (rule: any, value: any, callback: any) => {
      if (!value) {
        return callback(new Error('请输入医院名称'));
      } else {
        if (formData.importType === '新增项目' && hospitalNameList.value.length > 0) {
          const arr: any = hospitalNameList.value.map((item: any) => {
            return item.hospitalName;
          });
          while (!arr.includes(formData.hospitalName)) {
            return callback(new Error('所选省份无此医院，请确认名称是否正确'));
          }
        }
        callback();
      }
    };
    const rules = reactive({
      province: [{ required: true, message: '请选择省份', trigger: 'change' }],
      importType: [{ required: true, message: '请选择引入类型', trigger: 'change' }],
      hospitalName: [{ message: '请输入医院名称', required: true, trigger: 'change' }],
      uploadFile: [{ validator: checkFile, required: true, trigger: 'change' }],
    });

    let file: File | FileList | null; // 文件
    const fileName = ref<string>(''); // 文件名称
    const importData = async () => {
      const res = await useFileUploadHandler(false, '.xls, .xlsx');
      if (res) {
        file = res;
        fileName.value = (file as File).name;
        ruleFormRef.value.clearValidate(['uploadFile']);
      }
    };

    const importErrorVisible = ref<boolean>(false);
    const uploadLoading = ref<boolean>(false);
    const errorDialogClose = () => {
      importErrorVisible.value = false;
    };

    // 导入错误信息弹窗表格数据
    const errorDataList = ref<ErrorDataListType[]>([]);
    // 导入方法
    const importDatas = async (params: File, historyFlag: number = HistoryFlagType.初次导入) => {
      if (uploadLoading.value) {
        return;
      }
      uploadLoading.value = true;
      const messageInstance = message.loading('正在导入');
      try {
        const form: any = new FormData(); // FormData 对象

        form.append('file', params);
        form.append('newHospitalFlag', formData.importType === '已有项目' ? false : true);
        form.append('hospitalId', formData.hospitalId ? formData.hospitalId : '');
        form.append('hospitalRelId', formData.hospitalRelId ? formData.hospitalRelId : '');
        form.append('hospitalName', formData.hospitalName);
        form.append('historyFlag', historyFlag);
        form.append('provinceCode', formData.province);

        const res = await Service.uploadBenchmarkingData(form);

        if (res?.data?.length === 0 && res.success && res.code === 200) {
          emit('search');
          emit('getHospitalNameList');
          emit('close');
          message.success(res.message);
        } else if (res?.data === null && !res.success && res.code === 24001) {
          visible.value = true;
          const dialogModel = document.getElementsByClassName('dialogModel');
          (dialogModel[0] as HTMLElement).style.display = 'none';
        } else if (res?.data === null && !res.success && res.code === 500) {
          message.error('导入失败，' + res.message);
        } else if (res?.data?.length > 0 && res.success && res.code === 200) {
          errorDataList.value = res.data || [];
          importErrorVisible.value = true;
        } else {
          message.error('导入失败，' + res.message);
        }
        messageInstance.close();
      } catch (error) {
        uploadLoading.value = false;
        importErrorVisible.value = false;
        console.log(error, '导入失败');
        message.error('导入失败, 请求超时');
        messageInstance.close();
        fileName.value = '';
        file = null;
        if (error === 'Network Error') {
          message.warning('检测到文件已被修改，请重新选择文件');
        }
      } finally {
        uploadLoading.value = false;
      }
    };

    // 省份切换事件
    const provinceChange = async (val: any) => {
      formData.province = val;
      formData.hospitalName = '';
      hospitalNameList.value = [];
      // 获取医院名称
      if (formData.importType === '已有项目') {
        getHospitalNameList();
      } else {
        getNewHospitalNameList();
      }
    };

    // 导入形式切换事件
    const importTypeChange = (val: any) => {
      formData.importType = val;
      formData.hospitalName = '';
      if (formData.importType === '已有项目') {
        hospitalNameList.value = [];
        getHospitalNameList();
      } else {
        hospitalNameList.value = [];
        getNewHospitalNameList();
      }
    };

    const hospitalNameChange = (val: any) => {
      formData.hospitalName = val;
      ruleFormRef.value.clearValidate(['hospitalName']);
    };

    const getMoreParam = (val: any) => {
      formData.hospitalId = val.hospitalId;
      formData.hospitalRelId = val.hospitalRelId;
    };

    // 已有项目获取医院名称列表
    const getHospitalNameList = async () => {
      try {
        const obj = {
          provinceCode: formData.province,
        };
        const res = await Service.queryHospitalNameList(obj);
        if (res?.data && res.code === 200) {
          hospitalNameList.value = res.data;
          hospitalNameListOptions.value = hospitalNameList.value.map((item: any, idx: any) => ({
            value: item.hospitalName,
            label: item.hospitalName,
            hospitalId: item.id,
            hospitalRelId: item.hospitalRelId,
          }));
        } else {
          hospitalNameList.value = [];
        }
      } catch (error) {
        hospitalNameList.value = [];
        console.log(error, '导入已有项目');
      }
    };

    // 新建项目获取医院名称列表
    const getNewHospitalNameList = async () => {
      try {
        const obj = {
          provinceCode: formData.province,
        };
        const res = await Service.queryNewHospitalNameList(obj);
        if (res?.data && res.code === 200) {
          hospitalNameList.value = res.data;
          hospitalNameListOptions.value = hospitalNameList.value.map((item: any, idx: any) => ({
            value: item.hospitalName,
            label: item.hospitalName,
            hospitalRelId: item.id,
          }));
        } else {
          hospitalNameList.value = [];
        }
      } catch (error) {
        hospitalNameList.value = [];
        console.log(error, '新增项目');
      }
    };

    // 获取省份列表
    const getProvinceList = async () => {
      try {
        const res = await Service.queryProvinceList();
        if (res?.data && res.code === 200) {
          provinceList.value = res.data;
        } else {
          provinceList.value = [];
        }
      } catch (error) {
        provinceList.value = [];
        console.log(error);
      }
    };

    // 导入项目 提交事件
    const ruleFormRef = ref();
    const submitForm = (refEl: any) => {
      if (!refEl) return;
      refEl.validate((valid: any, fields: any) => {
        if (valid) {
          console.log('submit!');
          // 上传文件
          importDatas(file as File);
        } else {
          console.log('error submit!', fields);
        }
      });
    };

    const onCancel = (formEl: any) => {
      emit('close');
      if (!formEl) return;
      formEl.resetFields();
    };

    // 覆盖版本-用户点击确认按钮
    const onSubmit = () => {
      visible.value = false;
      importDatas(file as File, HistoryFlagType.覆盖版本);
    };

    // 保存为历史版本，用户点击-新建版本按钮
    const onNewBuiltSubmit = () => {
      visible.value = false;
      importDatas(file as File, HistoryFlagType.保存为历史版本);
    };

    // 【数据重复】弹窗关闭触发
    const onClose = () => {
      visible.value = false;
      const dialogModel = document.getElementsByClassName('dialogModel');
      (dialogModel[0] as HTMLElement).style.display = 'block';
    };

    onMounted(async () => {
      await getProvinceList();
    });

    return {
      regularStr,
      visible,
      formData,
      rules,
      ruleFormRef,
      provinceList,
      hospitalNameList,
      hospitalNameListOptions,
      importErrorVisible,
      uploadLoading,
      errorDataList,
      fileName,

      importData,
      onCancel,
      onSubmit,
      onNewBuiltSubmit,
      onClose,
      submitForm,
      provinceChange,
      importTypeChange,
      hospitalNameChange,
      getMoreParam,
      errorDialogClose,
      onScroll,
    };
  },
});
</script>
<style lang="less" scoped>
.el-form {
  .el-divider--horizontal {
    margin: 8px 0px;
  }

  .file-name {
    position: absolute;
    top: 12px;
    left: 70px;
  }
}
.el-radio-group {
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    color: var(--el-color-primary) !important;
    background-color: var(--el-color-white) !important;
    border-color: var(--el-color-primary) !important;
  }

  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    width: 164px;
    border-left: no-set;
  }

  :deep(.el-radio-button:last-child .el-radio-button__inner) {
    width: 164px;
  }

  :deep(.el-radio-button__inner) {
    height: 36px;
    padding: 10px 20px;
  }
}
:deep(.el-form-item__content) {
  display: flex !important;
  align-items: center !important;

  input.te-select-v2__combobox-input:focus {
    box-shadow: none !important;
  }
}

:deep([role='file'] .el-form-item__content) {
  display: block !important;
}
</style>
<style>
.el-dialog .el-divider--horizontal {
  margin: 8px 0;
}
</style>
