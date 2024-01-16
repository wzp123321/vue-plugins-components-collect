<template>
  <div id="ep-library-list">
    <!-- 能源对标库 -->
    <page-container title="综能项目库">
      <template #pageSearch>
        <el-form :inline="true" :model="EnergyProjectLibraryFormData" @submit.native.prevent>
          <el-form-item label="医院名称">
            <el-select
              placeholder="请选择"
              v-model="EnergyProjectLibraryFormData.hospitalId"
              autocomplete
              filterable
              default-first-option
              @change="hospitalIdChange"
              @blur="hospitalIdBlur"
              @focus="hospitalIdFocus"
            >
              <el-option
                v-for="(item, index) in hospitalNameList"
                :key="index"
                :label="item.hospitalName"
                :value="item.id"
                :title="item.hospitalName"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="省份">
            <el-select v-model="EnergyProjectLibraryFormData.provinceCode" placeholder="请选择省份" filterable>
              <el-option
                v-for="(item, index) in provinceList"
                :key="index"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="医院等级">
            <el-select v-model="EnergyProjectLibraryFormData.hospitalLevel" placeholder="请选择医院等级" filterable>
              <el-option
                v-for="(item, index) in hospitalLevelList"
                :key="index"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="">
            <el-button type="primary" @click="search">查询</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #pageContent>
        <div class="ep-top">
          <h5>医院列表</h5>
          <div class="ep-top-right">
            <button @click="onDownload">{{ downLoadLoading ? '正在下载' : '下载模板' }}</button>
            <button v-if="uploadBtnPermission === CheckPermission.有权限" @click="onImport(EDialogType.导入弹窗)">
              导入
            </button>
            <button
              v-if="exportBtnPermission === CheckPermission.有权限"
              @click="onExport"
              :disabled="EnergyProjectLibraryTableData.length === 0 && !loading"
            >
              全部导出
            </button>
            <!-- <el-button type="primary" @click="">新增</el-button> -->
            <button
              :style="{ color: hospitalIdList.length === 0 ? '' : 'red' }"
              :disabled="hospitalIdList.length === 0"
              @click="onMultipleDel(EDialogType.多选删除弹窗)"
            >
              删除
            </button>
          </div>
        </div>
        <div class="ep-bottom" v-loading="loading">
          <el-table
            v-if="EnergyProjectLibraryTableData.length && !loading"
            ref="elTableRef"
            :data="EnergyProjectLibraryTableData"
            style="width: 100%"
            @select="handleSelectionChange"
            @select-all="handleSelectionAllChange"
          >
            <el-table-column type="selection" width="55" :selectable="selectable"> </el-table-column>
            <el-table-column label="序号" width="55" type="index">
              <template #default="scope">
                {{ scope.row.index }}
              </template>
            </el-table-column>
            <el-table-column prop="hospitalName" label="医院名称" width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.hospitalName ?? '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="benchmarkSimpleName" label="对标库简称" width="100" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.benchmarkSimpleName ?? '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="hospitalSimpleName" label="医院简称" width="120" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.hospitalSimpleName ?? '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="provinceName" label="省份" show-overflow-tooltip width="100">
              <template #default="{ row }">
                {{ row.provinceName ?? '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="city" label="城市" width="74" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.city ?? '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="hospitalLevel" label="医院等级" width="120" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.hospitalLevel === '' || row.hospitalLevel === null"> -- </span>
                <el-button
                  v-if="row.hospitalLevel"
                  class="hospital-level-btn"
                  :type="getHospitalLevel(row.hospitalLevel)"
                  plain
                >
                  {{ row.hospitalLevel ?? '--' }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="hospitalType" label="医院类型" width="102" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.hospitalType ?? '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="climaticRegion" label="气候区" width="102" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.climaticRegion ?? '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="realName" label="录入人员" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.realName ?? '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="bindHostingProjectName" label="绑定项目" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.bindHostingProjectName ?? '--' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="228">
              <template #default="{ row }">
                <el-button
                  class="action-btn"
                  type="text"
                  @click="onPageNavTo(EDialogType.版本详情, row.id, row.deletePermission)"
                >
                  详情
                </el-button>
                <el-button
                  class="action-btn"
                  type="text"
                  @click="onViewHistoricalVersion(EDialogType.查看历史版本弹窗, row.id, row.deletePermission)"
                  >查看历史版本
                </el-button>
                <!-- <el-button class="action-btn" type="text" @click="edit(row.id)">编辑</el-button> -->
                <el-button
                  v-if="row.deletePermission !== 0"
                  class="action-btn"
                  type="text"
                  style="color: red"
                  @click="onSingleDel(EDialogType.单选删除弹窗, row.id)"
                  >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <no-data v-if="!loading && !EnergyProjectLibraryTableData.length"></no-data>
          <el-pagination
            v-if="EnergyProjectLibraryTableData.length && !loading"
            :current-page="page"
            :page-sizes="pageSizesArray"
            @size-change="onPageSizeChange"
            @current-change="onCurrentChange"
            :page-size="pageSize"
            layout="prev, pager, next, sizes, jumper"
            :total="total"
          >
          </el-pagination>
        </div>
      </template>
    </page-container>
  </div>

  <!-- 弹窗 + -->
  <el-dialog
    v-model="visible"
    :width="dialogWidth"
    :title="dialogTitle"
    :close-on-click-modal="false"
    custom-class="dialogModel"
    @close="onCancel"
  >
    <!-- 删除项目 +  -->
    <div class="dialog-body" v-if="dialogType === EDialogType.单选删除弹窗 || dialogType === EDialogType.多选删除弹窗">
      <div style="margin-bottom: 8px">
        <el-icon style="vertical-align: text-top; margin-right: 8px" color="#FAAD14"><WarningFilled /></el-icon>
        <span>确定要删除项目？</span>
      </div>
      <div style="margin-left: 22px; margin-bottom: 20px">
        <p>删除项目将一并删除所有历史版本，删除后无法找回。</p>
      </div>
      <el-divider></el-divider>
      <el-row type="flex" justify="end">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onDelSubmit">确定</el-button>
      </el-row>
    </div>
    <!-- 删除项目 -  -->

    <!-- 查看历史版本 + -->
    <epl-l-history-version-table
      v-if="dialogType === EDialogType.查看历史版本弹窗"
      @close="onCancel"
      :id="dialogId"
      :deletePermission="deletePermission"
      :exportBtnPermission="exportBtnPermission"
    ></epl-l-history-version-table>
    <!-- 查看历史版本 - -->

    <!-- 导入 + -->
    <epl-l-import-template
      ref="importTemplateRef"
      v-if="dialogType === EDialogType.导入弹窗"
      @close="onCancel"
      @search="queryTableList"
      @getHospitalNameList="getHospitalNameList"
    ></epl-l-import-template>
    <!-- 导入 - -->
  </el-dialog>
  <!-- 弹窗 - -->
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { timer } from 'rxjs';
import { default as mitt } from '@/core/eventbus';

import { pageSizesArray } from '@/config/index';

import message from '@/utils/message';

import { IFormData, IKeyValue, EnergyProjectLibrarySelectListData, EDialogType } from './ep-library-list.api';
import { CheckPermission } from '../energy-project-library.service';
import { Service } from './ep-library-list.service';
import EnergyProjectLibraryService, { PermissionList } from '../energy-project-library.service';

import { ElTable } from 'element-plus';
import { WarningFilled } from '@element-plus/icons-vue';
import EplLHistoryVersionTable from './components/epl-l-history-version-table/epl-l-history-version-table.vue';
import EplLImportTemplate from './components/epl-l-import-template/epl-l-import-template.vue';

export default defineComponent({
  name: 'EnergeProjectLibraryList',
  components: {
    WarningFilled,
    EplLHistoryVersionTable,
    EplLImportTemplate,
  },
  setup() {
    const router = useRouter();

    const loading = ref<boolean>(true);
    const elTableRef = ref();

    const visible = ref<boolean>(false);
    const dialogType = ref<string>('');
    const dialogTitle = ref<string>('');
    const dialogWidth = ref<number>(0);
    const dialogId = ref<number>();

    const EnergyProjectLibraryFormData = ref<IFormData>({
      hospitalId: '',
      provinceCode: '',
      hospitalLevel: '',
      keyword: null,
    });

    const EnergyProjectLibraryTableData = ref<EnergyProjectLibrarySelectListData[]>([]);

    // 查询医院名称列表
    const hospitalNameList = ref<EnergyProjectLibrarySelectListData[]>([]);
    const getHospitalNameList = async () => {
      try {
        const res = await Service.queryHospitalNameList();
        if (res?.data && res.code === 200) {
          hospitalNameList.value = [{ id: '', hospitalName: '全部' }, ...res.data];
        } else {
          hospitalNameList.value = [];
        }
      } catch (error) {
        hospitalNameList.value = [];
        console.log(error);
      }
    };

    // 查询省份列表
    const provinceList = ref<IKeyValue[]>([]);
    const getProvinceList = async () => {
      try {
        const res = await Service.queryProvinceList();
        if (res?.data && res.code === 200) {
          provinceList.value = [{ code: '', name: '全部' }, ...res.data];
        } else {
          provinceList.value = [];
        }
      } catch (error) {
        provinceList.value = [];
        console.log(error);
      }
    };

    // 查询医院等级
    const hospitalLevelList = ref<IKeyValue[]>([]);
    const getHospitalLevelList = async () => {
      try {
        const res = await Service.queryHospitalLevelList();
        if (res?.data && res.code === 200) {
          hospitalLevelList.value = [
            { code: '', name: '全部' },
            ...res.data.map((item) => {
              return {
                code: item.name,
                name: item.name,
              };
            }),
          ];
        } else {
          hospitalLevelList.value = [];
        }
      } catch (error) {
        hospitalLevelList.value = [];
        console.log(error);
      }
    };

    const initSearchBarService = async () => {
      // 同步请求
      const Synchronize_Events = [
        queryTableList(),
        getHospitalNameList(),
        getProvinceList(),
        getHospitalLevelList(),
        onCheckPermission(),
      ];
      await Promise.all(Synchronize_Events);
    };

    const downLoadLoading = ref<boolean>(false);
    const exportLoading = ref<boolean>(false);

    // 导入项目库
    const onImport = (type: string) => {
      dialogTitle.value = '导入项目';
      dialogType.value = type;
      dialogWidth.value = 480;
      visible.value = true;
    };

    // 下载模板
    const onDownload = async () => {
      if (downLoadLoading.value) {
        return;
      }
      downLoadLoading.value = true;
      await Service.download(
        '/energyProjectLibrary/downloadTemplate',
        '下载',
        () => {
          downLoadLoading.value = false;
        },
        () => {
          downLoadLoading.value = false;
        },
      );
    };

    // 全部导出项目
    const onExport = async () => {
      hospitalIdList.value = [];
      if (exportLoading.value) {
        return;
      }
      try {
        exportLoading.value = true;
        await Service.exportProject({
          hospitalIdList: [],
        });
        elTableRef.value.clearSelection();
      } catch (error) {
        console.log(error, '操作失败');
      } finally {
        exportLoading.value = false;
      }
    };

    const hospitalIdList = ref<number[]>([]);
    const hospitalId = ref<number[]>([]);

    // 表格多选框点击事件
    const handleSelectionChange = (val: number[]) => {
      hospitalIdList.value = [];
      val.forEach((item: any) => {
        hospitalIdList.value.push(item.id);
      });
      console.log(hospitalIdList.value);
    };

    // 表格全选框点击事件
    const handleSelectionAllChange = (val: number[]) => {
      hospitalIdList.value = [];
      val.forEach((item: any) => {
        hospitalIdList.value.push(item.id);
      });
      console.log(hospitalIdList.value);
    };

    // 表格多选框状态
    const selectable = (row: any) => {
      return row.deletePermission === 0 ? false : true;
    };

    // 查询
    const search = () => {
      page.value = 1;
      pageSize.value = pageSizesArray[0];
      queryTableList();
    };

    const reset = () => {
      EnergyProjectLibraryFormData.value.hospitalId = '';
      EnergyProjectLibraryFormData.value.provinceCode = '';
      EnergyProjectLibraryFormData.value.hospitalLevel = '';
      keyword.value = null;
      search();
    };

    // 跳转项目详情
    const onPageNavTo = (versionType: string, hospitalId: number, permission: number) => {
      router.push({
        path: '/home/energyProjectLibrary/editor',
        query: {
          versionType,
          hospitalId,
        },
      });
    };

    const deletePermission = ref<number>(0);
    // 查看历史版本
    const onViewHistoricalVersion = (type: string, id: number, permission: number) => {
      dialogTitle.value = '查看历史版本';
      dialogType.value = type;
      dialogWidth.value = 640;
      dialogId.value = id;
      deletePermission.value = permission;
      visible.value = true;
    };

    // 删除项目-单个
    const onSingleDel = (type: string, id: number) => {
      hospitalId.value = [id];
      dialogTitle.value = '删除项目';
      dialogType.value = type;
      dialogWidth.value = 480;
      visible.value = true;
    };

    // 删除项目-一到多个
    const onMultipleDel = (type: string) => {
      dialogTitle.value = '删除项目';
      dialogType.value = type;
      dialogWidth.value = 480;
      visible.value = true;
    };

    const onDelSubmit = async () => {
      visible.value = false;
      const param = {
        hospitalIds: dialogType.value === 'multipleDel' ? hospitalIdList.value : hospitalId.value,
      };
      try {
        const res = await Service.deleteProject(param);
        if (res.data && res.code === 200) {
          hospitalIdList.value = [];
          hospitalId.value = [];
          const lastPage = Math.ceil(total.value / pageSize.value);
          if (page.value === lastPage && total.value % pageSize.value === 1) {
            page.value--; //页码-1
          }
          if (page.value === 0) {
            page.value = 1;
          }
          queryTableList();
          message.success(res.message ?? '删除成功');
        } else {
          message.error(res.message ?? '操作失败');
        }
      } catch (error) {
        message.error('操作失败');
        console.log(error);
      }
    };

    const onCancel = () => {
      visible.value = false;
      timer(233).subscribe(() => {
        dialogType.value = '';
      });
    };

    const importTemplateRef = ref();
    //#region
    const page = ref<number>(1);
    const pageSize = ref<number>(pageSizesArray[0]);
    const total = ref<number>(10);
    // 查询表格数据列表
    // 关键词
    const keyword = ref<string | null>(null);
    const hospitalIdBlur = (val: any) => {
      keyword.value = null;
      keyword.value
        ? (EnergyProjectLibraryFormData.value.hospitalId = null)
        : (EnergyProjectLibraryFormData.value.hospitalId = val.target.value);
      keyword.value = val.target.value;
    };

    const hospitalIdFocus = (val: any) => {
      nextTick(() => {
        if (keyword.value) {
          val.target.placeholder = '';
        }
      });
    };

    const hospitalIdChange = (val: any) => {
      if (typeof val === 'string') {
        keyword.value = val;
      } else {
        EnergyProjectLibraryFormData.value.hospitalId = val;
        keyword.value = null;
      }
    };

    const queryTableList = async () => {
      try {
        loading.value = true;
        const params = {
          pageNum: page.value,
          pageSize: pageSize.value,
          keyword: keyword.value ? keyword.value : null,
          id: keyword.value ? null : EnergyProjectLibraryFormData.value.hospitalId,
          provinceCode: EnergyProjectLibraryFormData.value.provinceCode,
          hospitalLevel: EnergyProjectLibraryFormData.value.hospitalLevel,
        };
        const res = await Service.queryEnergeBenchmarkLibraryList(params);
        if (res && res.code == 200 && res.success) {
          loading.value = false;
          EnergyProjectLibraryTableData.value =
            res.data.list.map((item: EnergyProjectLibrarySelectListData, index: number) => {
              return {
                id: item.id,
                createTime: item.createTime,
                updateTime: item.updateTime,
                hospitalName: item.hospitalName,
                hospitalExcelName: item.hospitalExcelName,
                provinceCode: item.provinceCode,
                benchmarkSimpleName: item.benchmarkSimpleName,
                hospitalSimpleName: item.hospitalSimpleName,
                provinceName: item.provinceName,
                city: item.city,
                hospitalLevel: item.hospitalLevel,
                hospitalType: item.hospitalType,
                climaticRegion: item.climaticRegion,
                operator: item.operator,
                realName: item.realName,
                deletePermission: item.deletePermission,
                bindHostingProjectName: item.bindHostingProjectName,
                index: (page.value - 1) * pageSize.value + index + 1,
              };
            }) || [];
          total.value = res.data.total;
        } else {
          EnergyProjectLibraryTableData.value = [];
        }
      } catch (error) {
        EnergyProjectLibraryTableData.value = [];
        // console.log('error------------', error);
      } finally {
        loading.value = false;
      }
    };
    //#endregion
    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      page.value = 1;
      queryTableList();
    };
    const onCurrentChange = (value: number) => {
      page.value = value;
      queryTableList();
    };

    const getHospitalLevel = (name: string) => {
      const str = name && name.substring(0, 2);
      switch (str) {
        case '一级':
          return 'primary';
        case '二级':
          return 'warning';
        case '三级':
          return 'danger';
        case '其他':
          return 'info';
      }
    };

    // 控制导入，导出按钮显隐
    const exportBtnPermission = ref<number | undefined>(CheckPermission.无权限);
    const uploadBtnPermission = ref<number | undefined>(CheckPermission.无权限);

    const checkPermissionList = ref<PermissionList>({});

    const onCheckPermission = async () => {
      const res = await EnergyProjectLibraryService.checkPermission();
      try {
        if (res?.data && res.code === 200) {
          exportBtnPermission.value = res.data.downloadPermission;
          uploadBtnPermission.value = res.data.uploadPermission;
        } else {
          checkPermissionList.value = {
            deletePermission: 0,
            downloadPermission: 0,
            editPermission: 0,
            hospitalId: null,
            uploadPermission: 2,
            viewPermission: 0,
          };
        }
      } catch (error) {
        console.log(error);
      }
    };
    onMounted(async () => {
      await initSearchBarService();
    });

    onUnmounted(() => {
      mitt.off('permission');
    });

    return {
      loading,
      visible,
      dialogType,
      dialogTitle,
      dialogWidth,
      dialogId,
      EDialogType,

      elTableRef,
      CheckPermission,
      uploadBtnPermission,
      exportBtnPermission,
      deletePermission,
      downLoadLoading,
      EnergyProjectLibraryFormData,
      EnergyProjectLibraryTableData,
      importTemplateRef,
      hospitalIdList,
      hospitalNameList,
      provinceList,
      hospitalLevelList,

      onImport,
      onPageNavTo,
      onViewHistoricalVersion,
      onDelSubmit,
      onCancel,
      onDownload,
      onExport,

      page,
      pageSize,
      total,
      pageSizesArray,

      selectable,
      hospitalIdChange,
      hospitalIdBlur,
      hospitalIdFocus,
      handleSelectionChange,
      handleSelectionAllChange,
      search,
      reset,
      onMultipleDel,
      onSingleDel,
      queryTableList,
      onPageSizeChange,
      onCurrentChange,

      getHospitalLevel,
      getHospitalNameList,
    };
  },
});
</script>

<style lang="less" scoped>
#ep-library-list {
  height: 100%;

  .el-select {
    width: 244px;
  }

  :deep(.tenant-pagecontainer__detail-content) {
    display: flex;
    flex-direction: column;
  }

  .ep-top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h5 {
      position: relative;
      height: 56px;
      line-height: 56px;
      font-size: 14px;
      color: var(--color-text-title);
      font-weight: 600;
      padding-left: 12px;

      &::before {
        content: '';
        width: 4px;
        height: 16px;
        background-color: var(--color-primary);
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  .ep-bottom {
    flex: 1 1 auto;
    :deep(.el-table th.el-table__cell) {
      padding: 0px !important;
    }
    :deep(.el-table) tbody tr {
      td.el-table__cell {
        position: relative;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        border-bottom: 1px solid var(--color-text-divider) !important;
      }

      td:last-child {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }
    }
    .hospital-level-btn {
      min-height: 24px !important;
      line-height: 24px !important;
      height: 24px;
      pointer-events: none;
    }

    .action-btn {
      min-height: 24px !important;
      line-height: 24px !important;
      padding: 0 0px !important;
    }
  }
}

:deep(.el-dialog-body) {
  padding: 4px 15px !important;
}

.el-divider--horizontal {
  margin: 8px 0px;
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
}

*:disabled,
*[disabled]:not([disabled='false']),
*[disabled]:not([disabled='false']) * {
  color: var(--color-text-border) !important;
  cursor: not-allowed !important;
  border-color: var(--color-text-border) !important;
}
</style>
