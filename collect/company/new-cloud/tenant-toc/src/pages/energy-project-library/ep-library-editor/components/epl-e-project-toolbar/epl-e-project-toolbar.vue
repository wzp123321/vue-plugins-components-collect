<template>
  <div class="ep-library-top">
    <!-- 项目名称 返回主列表 + -->
    <div class="ep-library-top-right">
      <div class="ep-go-back" @click="goBack()">
        <el-icon style="vertical-align: text-top; margin-right: 7.9987px"><Back /></el-icon>返回
      </div>
      <div class="ep-library-hospitalName">{{ hospitalName ?? '--' }}</div>
    </div>
    <!-- 项目名称 返回主列表 - -->

    <!-- 当前版本详情 + -->
    <div v-if="versionType === 'currentVersion'">
      <button @click="onViewHistoricalVersion">查看历史版本</button>
      <button v-if="exportBtnPermission === CheckPermission.有权限" @click="onExport">导出</button>
      <!-- <button style="color: red" @click="deleteProject">删除项目</button> -->
      <button v-if="permission !== 0" style="color: red" @click="onDeleteProject">删除</button>
    </div>
    <!-- 当前版本详情 - -->

    <!-- 历史版本详情 + -->
    <div v-if="versionType === 'historyVersion'">
      <el-dropdown :max-height="300">
        <span class="el-dropdown-link">
          {{ historyVersionTime || historyVersionDateList[0].versionTime }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, index) in historyVersionDateList"
              :key="index"
              @click="queryHistoryEnergyTableList(item.id, item.versionTime)"
            >
              {{ item.versionTime }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <button v-if="exportBtnPermission === CheckPermission.有权限" primary @click="onDownload">下载</button>
      <button v-if="permission !== 0" style="color: red" @click="deleteVersion">删除版本</button>
    </div>
    <!-- 历史版本详情 - -->
  </div>

  <el-dialog
    v-model="dialogProp.visible"
    :width="dialogProp.width"
    :title="dialogProp.title"
    :close-on-click-modal="false"
    custom-class="dialogModel"
    @close="onCancel"
  >
    <!-- 删除项目 + -->
    <epl-e-delete-dialog v-if="dialogProp.type === DialogType.删除项目" @delSubmit="delSubmit" @close="onCancel" />
    <!-- 删除项目 - -->

    <!-- 查看历史版本 + -->
    <epl-l-history-version-table
      v-if="dialogProp.type === DialogType.查看历史版本"
      @close="onCancel"
      :id="Number(hospitalId)"
      :deletePermission="permission"
      :exportBtnPermission="exportBtnPermission"
    />
    <!-- 查看历史版本 - -->
  </el-dialog>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed, watch, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { timer } from 'rxjs';
import { default as mitt } from '@/core/eventbus/index';

import { ElMessageBox } from 'element-plus';
import { Back, ArrowDown } from '@element-plus/icons-vue';
import { DialogProps, DialogType, HistoryVersionDateList } from './epl-e-project-toolbar.api';
import { CheckPermission } from '../../../energy-project-library.service';

import { Service } from './epl-e-project-toolbar.service';
import EnergyProjectLibraryService, { PermissionList } from '../../../energy-project-library.service';

import EplLHistoryVersionTable from '../../../ep-library-list/components/epl-l-history-version-table/epl-l-history-version-table.vue';
import EplEDeleteDialog from '../../components/epl-e-delete-dialog/epl-e-delete-dialog.vue';
import message from '@/utils/message';

const router = useRouter();
const route = useRoute();

const props = defineProps(['paramId']);
const hospitalName = ref<unknown>('');
const permission = ref<number>(0);
const historyVersionDateList = ref<HistoryVersionDateList[]>([{}]);
const historyVersionTime = ref<any>('');

// 设置历史版本详情title
const setPageContainerTitle = () => {
  const tpt = document.querySelector('.tenant-pagecontainer__title') as HTMLElement;
  if (versionType.value === 'historyVersion') {
    tpt.innerHTML = `<span style="color:rgba(0, 0, 0, 0.45);font-size: 16px;">综能项目库 / </span><span style="font-size: 16px;">历史版本详情</span>`;
  }
};

const versionType = computed(() => {
  return route.query.versionType; // historyVersion,currentVersion
});

const hospitalId = computed(() => {
  return route.query.hospitalId;
});

const versionId = computed(() => {
  return route.query.versionId ?? '';
});

const deletePermission = computed(() => {
  return route.query.permission ?? 0;
});

const dialogProp = ref<DialogProps>({
  visible: false,
  title: '',
  width: 640,
  type: '',
  id: 0,
});

// 切换版本时间
const changeVersionId = ref<string>('');

const queryHistoryEnergyTableList = (val: any, time: any) => {
  historyVersionTime.value = time;
  changeVersionId.value = val ?? versionId.value;
  mitt.emit('queryHistoryEnergyTableList', val);
  router.replace({
    path: '/home/energyProjectLibrary/editor',
    query: {
      versionType: versionType.value,
      hospitalId: hospitalId.value,
      versionId: changeVersionId.value,
    },
  });
};

const queryHistoryVersionDateList = async () => {
  try {
    const res = await Service.queryHistoryVersionDateList({
      hospitalId: hospitalId.value,
    });
    if (res?.data && res.code === 200) {
      historyVersionDateList.value = res.data.list;
      historyVersionTime.value = historyVersionDateList.value[0]?.versionTime;
      historyVersionDateList.value.forEach((item, index) => {
        if (String(item.id) === String(versionId.value)) {
          historyVersionTime.value = historyVersionDateList.value[index].versionTime;
        }
      });
    } else {
      historyVersionDateList.value = [];
    }
  } catch (error) {
    console.log(error, '获取历史版本列表失败');
    historyVersionDateList.value = [];
  }
};

const searchDate = ref<[string, string]>(['', '']);

const onExport = async () => {
  try {
    await Service.downloadData({
      hospitalIdList: [hospitalId.value],
      startTime: searchDate.value[0],
      endTime: searchDate.value[1],
    });
  } catch (error) {
    console.log(error, '操作失败');
  }
};

const onDownload = async () => {
  try {
    await Service.downloadData({
      hospitalIdList: [hospitalId.value],
      startTime: searchDate.value[0],
      endTime: searchDate.value[1],
      versionId: changeVersionId.value || versionId.value,
    });
  } catch (error) {
    console.log(error, '操作失败');
  }
};

const onViewHistoricalVersion = () => {
  dialogProp.value.type = DialogType.查看历史版本;
  dialogProp.value.title = '查看历史版本';
  dialogProp.value.width = 640;
  dialogProp.value.visible = true;
};

const onDeleteProject = () => {
  dialogProp.value.type = DialogType.删除项目;
  dialogProp.value.title = '删除项目';
  dialogProp.value.width = 480;
  dialogProp.value.visible = true;
};

const onCancel = () => {
  dialogProp.value.visible = false;
  timer(233).subscribe(() => {
    dialogProp.value.type = '';
  });
};

const goBack = () => {
  router.push('/home/energyProjectLibrary/list');
};

// 删除历史某一个版本
const deleteVersion = () => {
  ElMessageBox.confirm('删除后无法恢复，确定删除此版本吗？', '删除版本', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    customClass: 'cost-delete-confirm',
  })
    .then(async (res) => {
      if (res === 'confirm') {
        const delRes = await Service.singleDel({ id: changeVersionId.value || versionId.value });
        if (delRes?.data && delRes.code === 200) {
          message.success(delRes.message ?? '操作成功');
          if (historyVersionDateList.value.length === 1) {
            goBack();
          } else {
            await queryHistoryVersionDateList();
            changeVersionId.value = String(historyVersionDateList.value[0].id);
            router.replace({
              path: '/home/energyProjectLibrary/editor',
              query: {
                versionType: versionType.value,
                hospitalId: hospitalId.value,
                versionId: changeVersionId.value,
              },
            });
            mitt.emit('queryHistoryEnergyTableList', historyVersionDateList.value[0].id);
          }
        } else {
          message.error(delRes.message ?? '操作失败');
        }
      }
    })
    .catch((error) => {
      console.log('cancel', error);
    });
};

// 删除当前版本
const delSubmit = async () => {
  try {
    const res = await Service.deleteHospital({ hospitalIds: [hospitalId.value] });
    if (res?.data && res.code === 200) {
      goBack();
      message.success(res.message ?? '操作成功');
    } else {
      message.error(res.message ?? '操作失败');
    }
  } catch (error) {}
};

mitt.on('hospitalName', (val) => {
  hospitalName.value = val;
});

// 刷新页面控制删除按钮权限
mitt.on('permissionBtn', (val) => {
  permission.value = val as number;
});

mitt.on('selectTableRow', (val) => {
  console.log(val, '23');
});

mitt.on('searchDate', async (val: any) => {
  searchDate.value = val;
});

// 在详情页查看历史版本 监听路由变化 重新设置title
watch(
  () => versionId.value,
  (newval, oldval) => {
    if (newval) {
      setPageContainerTitle();
    }
  },
);

// 控制导入，导出按钮显隐
const exportBtnPermission = ref<number | undefined>(CheckPermission.无权限);
const uploadBtnPermission = ref<number | undefined>(CheckPermission.无权限);

const onCheckPermission = async () => {
  const res = await EnergyProjectLibraryService.checkPermission();
  try {
    if (res?.data && res.code === 200) {
      exportBtnPermission.value = res.data.downloadPermission;
      uploadBtnPermission.value = res.data.uploadPermission;
    }
  } catch (error) {
    console.log(error);
  }
};

// 只监听一次，防止切换历史版本重复此请求
let flag = true;
watchEffect(async () => {
  if (versionType.value === 'historyVersion' && flag === true) {
    queryHistoryVersionDateList();
    flag = false;
  }
});

onMounted(async () => {
  setPageContainerTitle();
  await onCheckPermission();
});

onUnmounted(() => {
  mitt.off('hospitalName');
  mitt.off('selectTableRow');
  mitt.off('searchDate');
  mitt.off('permissionBtn');
});
</script>
<style lang="less" scoped>
.ep-library-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  &-right {
    display: flex;
    align-items: center;

    .ep-go-back {
      cursor: pointer;
    }
  }
  .el-dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;

    .el-icon--right {
      margin-right: 10px;
    }
  }
  .ep-library-hospitalName {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 700;

    &::before {
      content: '';
      position: relative;
      display: inline-block;
      text-align: center;
      width: 1px;
      height: 16px;
      margin: 0 16px;
      background-color: rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
