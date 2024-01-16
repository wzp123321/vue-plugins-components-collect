<template>
  <!-- 新增/编辑 -->
  <te-dialog
    :close-on-click-modal="false"
    class="hnm-data-modal"
    v-model="heForm.visible"
    :title="heForm.type === FORM_STATUS.ADD ? '新增数据' : heForm.type === FORM_STATUS.EDITOR ? '编辑数据' : '查看数据'"
    width="540px"
    :before-close="heForm.close"
  >
    <te-form :model="heForm.formModel" :ref="heForm.formRef" :rules="rules" @submit.native.prevent label-width="90px">
      <te-form-item label="能源类型" prop="energyCode">
        <te-select
          v-model="heForm.formModel.energyCode"
          placeholder="请选择能源类型"
          @change="heForm.onEnergyCodeChange"
        >
          <te-option
            v-for="(item, index) in heTable.energyCodeList"
            :key="'code' + index"
            :label="item.name"
            :value="item.code"
          />
        </te-select>
      </te-form-item>
      <te-form-item label="户号" prop="accountNumber">
        <te-select
          :fit-input-width="true"
          filterable
          v-model="heForm.formModel.accountNumber"
          placeholder="请选择户号"
          @change="heForm.clearFormValidate('accountNumber')"
        >
          <te-option
            :title="item"
            v-for="(item, index) in heForm.accountNumberList"
            :key="'code' + index"
            :label="item"
            :value="item"
          />
        </te-select>
      </te-form-item>
      <te-form-item label="数据时间" prop="date">
        <te-date-picker
          popper-class="data-date"
          :editable="false"
          :disabled-date="heForm.disabledDataDate"
          @change="heForm.queryBillTime"
          v-model="heForm.formModel.date"
          type="month"
          placeholder="请选择时间"
        />
      </te-form-item>
      <te-form-item label="用量" prop="amount">
        <te-input
          type="text"
          v-model="heForm.formModel.amount"
          v-inputFilter:number
          placeholder="请输入用量"
          @input="heForm.clearFormValidate('amount')"
        >
          <template #suffix>
            <span class="suffix">{{ heForm.unit }}</span>
          </template>
        </te-input>
      </te-form-item>
      <te-form-item label="实际缴费" prop="actualPayment">
        <te-input
          v-model="heForm.formModel.actualPayment"
          v-inputFilter:number
          placeholder="请输入实际缴费"
          @input="heForm.clearFormValidate('actualPayment')"
        >
          <template #suffix>
            <span class="suffix">元</span>
          </template>
        </te-input>
      </te-form-item>
      <te-form-item label="账期" prop="billDate">
        <te-date-picker
          :editable="false"
          v-model="heForm.formModel.billDate"
          type="daterange"
          range-separator="~"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="heForm.clearFormValidate('billDate')"
        />
      </te-form-item>
      <te-form-item label="附件" prop="fileList" class="hnm-data-file">
        <div class="flex-row-start-center">
          <button primary @click="heForm.chooseFile()">选择文件</button>
          <te-tooltip effect="dark" placement="right">
            <template v-slot:content>
              <div style="word-break: break-all; white-space: normal">
                支持上传xls、xlsx、xlsm、pdf、doc、docx、pptx、png、jpg、jpeg格式文件；图片最多支持上传6个，单个文件大小不超过10MB，总文件大小不超过100MB
              </div>
            </template>
            <i class="toc-iconfont icon-toc-wenhao"></i>
          </te-tooltip>
        </div>
        <div class="file-container" v-show="heForm.formModel.fileList?.length">
          <div
            v-for="(item, index) in heForm.formModel.fileList"
            :key="'file_' + index"
            class="file-item flex-row-start-center"
          >
            <img :src="heForm.mapFileTypeIcon(item.name)" alt="" />
            <span :title="item.name" class="file-name">{{ item.name }}</span>
            <i class="toc-iconfont icon-toc-qingkong" @click="heForm.fileDelete(index)"></i>
          </div>
        </div>
      </te-form-item>
    </te-form>
    <template #footer>
      <te-button @click="heForm.close">取消</te-button>
      <te-button primary @click="onSubmit">确认</te-button>
    </template>
  </te-dialog>

  <!-- 查看附件 -->
  <te-dialog
    :close-on-click-modal="false"
    class="file-dialog"
    v-model="heTable.visible"
    title="查看附件"
    width="600px"
    :before-close="heTable.beforeClose"
  >
    <template v-if="heTable.fileList?.length">
      <div v-for="(item, index) in heTable.fileList" :key="'file_' + index" class="file-item flex-row-start-center">
        <img class="mr10" :src="heForm.mapFileTypeIcon(item.fileName)" alt="" />
        <span :title="item.fileName" class="text-overflow file-name">{{ item.fileName }}</span>
        <i
          title="预览"
          v-if="
            heTable.useType(item.fileName) === FILE_TYPE.PNG ||
            heTable.useType(item.fileName) === FILE_TYPE.JPG ||
            heTable.useType(item.fileName) === FILE_TYPE.JPEG
          "
          class="toc-iconfont icon-toc-15tupianyulan"
          @click="heTable.preview(item.fileId)"
        ></i>
        <i v-else class="toc-iconfont icon-toc-xiazai" title="下载" @click="heTable.download(item.fileId)"></i>
      </div>
    </template>
    <no-data :title="'暂无附件'" v-else></no-data>
  </te-dialog>

  <!-- 图片预览 -->
  <preview
    v-if="heTable.previewVisible"
    :urlList="heTable.imageList"
    :initialIndex="heTable.initialIndex"
    v-model="heTable.previewVisible"
  ></preview>
</template>
<script lang="ts" setup>
import { FILE_TYPE } from '@/config/enum';
import { FORM_STATUS, rules } from '../constant';
import heForm from '../services/hnm-data-form.service';
import heTable from '../services/hnm-data-table.service';
import preview from 'vue3-preview';

const onSubmit = async () => {
  const res = await heForm.submit();
  if (res) {
    heForm.close();
    heTable.query();
  }
};
</script>
<style lang="less">
.hnm-data-modal.te-dialog {
  .te-dialog__body {
    max-height: 540px;
    overflow: auto;
  }
  .te-select,
  .te-date-editor,
  .te-input {
    width: 100% !important;
  }

  .file-container {
    padding: 0 10px;
    margin-top: 12px;
    background-color: var(--color-text-background);
    width: 100%;
    .file-item {
      height: 48px;
      line-height: 48px;
      font-size: 14px;
      border-bottom: 1px solid var(--color-text-divider);
      img {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }
      .file-name {
        flex: 1 1 auto;
        height: 20px;
        line-height: 20px;
        color: var(--color-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .toc-iconfont.icon-toc-qingkong {
        cursor: pointer;
        font-size: 24px;
        color: var(--color-error);
        &:hover {
          opacity: 0.8;
        }
      }
    }
    .file-item:last-child {
      border: none;
    }
  }

  .hnm-data-file {
    .te-form-item__content {
      flex-direction: column;
      align-items: start;
    }
  }

  .te-form {
    &-item.is-error {
      input {
        border-color: var(--color-error);
      }
    }
    .te-form-item__content {
      position: relative;
      i.toc-iconfont.icon-toc-wenhao {
        font-size: 20px;
        padding-left: 11px;
        color: var(--color-text-secondary);
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }
}
.te-picker__popper.data-date.te-popper {
  width: 380px;

  .te-picker-panel.te-date-picker {
    width: 100%;
  }

  .te-picker-panel__content {
    width: calc(100% - 30px);
  }
}
.te-dialog.file-dialog {
  .te-dialog__body {
    min-height: 180px !important;
  }
  .file-item {
    width: 100%;
    height: 48px;
    line-height: 48px;
    padding: 0 16px;
    .file-name {
      flex: 1 1 auto;
      height: 20px;
      line-height: 22px;
    }
    img {
      width: 20px;
      height: 20px;
    }
    i {
      color: var(--color-primary-hover);
      margin-left: 24px;
    }
    &:hover {
      background-color: var(--color-text-background);
    }
  }
}
</style>
