<template>
  <div id="fm-searchbar">
    <el-form :inline="true" :model="fmFormData" @submit.native.prevent>
      <el-form-item label="">
        <el-input
          v-model="fmFormData.fileName"
          class="fm-searchbar-input"
          v-inputFilter:search="{ allowSpace: false, regularStr: regularStr }"
          placeholder="请输入文件名称"
          :maxlength="32"
          :suffix-icon="Search"
        />
      </el-form-item>
      <el-form-item label="文件类型">
        <el-select v-model="fmFormData.fileType" placeholder="请选择">
          <el-option v-for="(item, index) in fileTypeList" :key="index" :label="item.name" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="上传时间">
        <el-date-picker
          v-model="fmFormData.uploadDate"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 284px"
        />
      </el-form-item>
      <el-form-item>
        <button primary @click="search">查询</button>
        <button @click="reset()">重置</button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, shallowRef } from 'vue';
import { Service } from './fm-searchbar.service';

import { default as mitt } from '@/core/eventbus';

import { IFmFormData, DictDetailQueryByCodeResponse } from './fm-searchbar.api';
import { Search } from '@element-plus/icons-vue';

const regularStr = String.raw`\`\-\\;\'\"<>\/\?\*\[\]\:\？\：`;

const fmFormData = ref<IFmFormData>({
  fileName: '',
  fileType: '',
  uploadDate: ['', ''],
});

const fileTypeList = ref<DictDetailQueryByCodeResponse[]>([]);

const search = () => {
  mitt.emit('search', fmFormData.value);
};

const reset = () => {
  fmFormData.value.fileName = '';
  fmFormData.value.fileType = '';
  fmFormData.value.uploadDate = ['', ''];
  search();
};

onMounted(() => {
  search();
  query();
});

// 字典项查询文件类别
const query = async () => {
  try {
    const res = await Service.queryFileTypeList();
    if (res?.data && res.success && res.code === 200) {
      fileTypeList.value = [{ name: '全部', code: '' }, ...res.data];
      mitt.emit('fileTypeList', res.data);
    } else {
      fileTypeList.value = [];
    }
  } catch (error) {
    console.log(error, '获取文件类别列表失败');
  }
};
</script>
<style lang="less" scoped>
:deep(.el-input__suffix-inner) {
  align-items: center;
}
:deep(.fm-searchbar-input) {
  .el-input__inner {
    padding-right: 26px !important;
  }
}
</style>
