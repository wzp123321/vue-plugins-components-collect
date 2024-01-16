<template>
  <div class="ep-library-middle">
    <el-row>
      <el-col :span="3">
        <span>对标库简称</span>
        <span>{{ projectDescriptionsData.benchmarkSimpleName ?? '--' }}</span>
      </el-col>
      <el-col :span="3">
        <span>简称</span>
        <span>{{ projectDescriptionsData.hospitalSimpleName ?? '--' }}</span>
      </el-col>
      <el-col :span="3">
        <span>省份</span>
        <span>{{ projectDescriptionsData.provinceName ?? '--' }}</span>
      </el-col>
      <el-col :span="3">
        <span>城市</span>
        <span>{{ projectDescriptionsData.city ?? '--' }}</span>
      </el-col>
      <el-col :span="3">
        <span>医院等级</span>
        <el-tag
          v-if="getHospitalLevel(projectDescriptionsData.hospitalLevel, '三级')"
          size="small"
          type="danger"
          role="tag"
          >{{ projectDescriptionsData.hospitalLevel ?? '--' }}
        </el-tag>
        <el-tag
          v-if="getHospitalLevel(projectDescriptionsData.hospitalLevel, '二级')"
          size="small"
          type="warning"
          role="tag"
          >{{ projectDescriptionsData.hospitalLevel ?? '--' }}
        </el-tag>
        <el-tag v-if="getHospitalLevel(projectDescriptionsData.hospitalLevel, '一级')" size="small" role="tag">
          {{ projectDescriptionsData.hospitalLevel ?? '--' }}
        </el-tag>
        <span v-if="!projectDescriptionsData.hospitalLevel"> -- </span>
      </el-col>
      <el-col :span="3">
        <span>医院类型</span>
        <span>{{ projectDescriptionsData.hospitalType ?? '--' }}</span>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="3">
        <span>录入人员</span>
        <span>{{ projectDescriptionsData.realName ?? '--' }}</span>
      </el-col>
      <el-col :span="3">
        <span>绑定项目</span>
        <span>{{ projectDescriptionsData.bindHostingProjectName ?? '--' }}</span>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { default as mitt } from '@/core/eventbus';

import { Service } from './epl-e-project-descriptions.service';
import { ProjectDescriptionsData } from './epl-e-project-descriptions.api';

const route = useRoute();

const projectDescriptionsData = ref<ProjectDescriptionsData>({});

const hospitalId = computed(() => {
  return route.query.hospitalId;
});

const versionId = computed(() => {
  return route.query.versionId;
});

// 查询项目描述列表
const queryProjectDescriptions = async () => {
  try {
    const res = await Service.queryProjectDescriptions({
      id: Number(hospitalId.value),
    });
    if (res?.data && res.code === 200) {
      projectDescriptionsData.value = res.data.list[0];
      mitt.emit('hospitalName', projectDescriptionsData.value.hospitalName);
      mitt.emit('permissionBtn', projectDescriptionsData.value.deletePermission);
    } else {
      projectDescriptionsData.value = {};
    }
  } catch (error) {
    console.log('获取项目描述列表失败');
  }
};
const getHospitalLevel = (name: any, type: any) => {
  if (name && name.includes(type)) {
    return true;
  } else {
    return false;
  }
};
let flag: boolean | null = true;
watch(
  () => versionId.value,
  (n, o) => {
    if (n && flag === true) {
      queryProjectDescriptions();
      flag = null;
    }
  },
);
onMounted(() => {
  queryProjectDescriptions();
});
</script>
<style lang="less" scoped>
.ep-library-middle {
  .el-row {
    margin: 10px 0;
  }

  span:not([role='tag']) {
    display: inline-block;
    width: auto;
    margin-right: 12px;
    font-weight: 700;
  }

  span:nth-child(odd):not([role='tag']) {
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
  }

  span:nth-child(even) {
    margin-right: 0;
  }

  :deep(.el-form-item) {
    margin-bottom: 0 !important;
  }
}
</style>
