<!--
 * @Author: yut
 * @Date: 2023-08-14 19:17:44
 * @LastEditors: yut
 * @LastEditTime: 2023-12-21 16:28:18
 * @Descripttion: 
-->
<template>
  <div class="hnm-list-update">
    <te-dialog
      :title="hlUpdate.title"
      v-model="hlUpdate.visible"
      width="560px"
      :close-on-click-modal="false"
      @closed="closed"
    >
      <te-form :model="hlUpdate.formObj" :rules="rules" ref="ruleForm" label-position="right">
        <te-form-item label="户号" :label-width="formLabelWidth" prop="houseNumber">
          <te-input
            placeholder="请输入户号"
            v-model.trim="hlUpdate.formObj.houseNumber"
            v-filterHouseholdNumber="hlUpdate.formObj.houseNumber"
            maxlength="32"
          ></te-input>
        </te-form-item>
        <te-form-item label="能源类型" :label-width="formLabelWidth" prop="energyType">
          <te-select v-model="hlUpdate.formObj.energyType" @change="energyTypeChange">
            <te-option
              v-for="item in hlTable.energyCodeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
              style="white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis"
              :title="item.name"
            >
            </te-option>
          </te-select>
        </te-form-item>
        <te-form-item label="关联节点" :label-width="formLabelWidth" prop="associatedNode">
          <te-tree-select
            :placeholder="'请选择节点'"
            v-model="hlUpdate.formObj.associatedNode"
            :nodeKey="'treeId'"
            :treeData="hlUpdate.associatedNodeList"
            :showSearch="true"
            :autoWidth="true"
            :defaultProps="{ children: 'childTree', label: 'treeName' }"
            v-model:radioValue="hlUpdate.formObj.radioValue"
            :radioData="treeTypeList"
            :expandedKeys="hlUpdate.expandedKeys"
            @tree-radio-change="treeRaidoChange"
          >
          </te-tree-select>
        </te-form-item>
        <te-form-item
          v-if="hlUpdate.hostingAreaList.length > 0"
          label="所属托管区域"
          :label-width="formLabelWidth"
          prop="hostingArea"
        >
          <te-select v-model="hlUpdate.formObj.hostingAreaName" clearable @change="hostingAreaChange">
            <te-option
              v-for="item in hlUpdate.hostingAreaList"
              :key="item.areaId"
              :label="item.areaName"
              :value="item.areaId"
              style="white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis; width: 374px"
              :title="item.areaName"
            >
            </te-option>
          </te-select>
        </te-form-item>
        <!-- 是否平托 -->
        <te-form-item v-if="props.configureHostFlag" label="是否平托" :label-width="formLabelWidth" prop="hostingFlag">
          <te-select v-model="hlUpdate.formObj.hostingFlag" clearable>
            <te-option
              v-for="item in hostingTypes"
              :key="item.code"
              :label="item.name"
              :value="item.code"
              :title="item.name"
            >
            </te-option>
          </te-select>
        </te-form-item>
      </te-form>
      <template #footer>
        <span class="dialog-footer">
          <te-button @click="cancel">取消</te-button>
          <te-button type="primary" @click="onSubmit(ruleForm)">确定</te-button>
        </span>
      </template>
    </te-dialog>
  </div>
</template>
<script lang="ts" setup>
import hlUpdate from './hnm-list-update.service';
import hlTable from '../hnm-list-table/hnm-list-table.service';
import { EType, treeTypeList, EPath, HLU_EHostingType } from './hnm-list-update.api';
import { reactive, ref } from 'vue';
import { CommonICodeName } from '@/service/api';
import { cloneDeep } from 'lodash';

// props
const props = defineProps({
  configureHostFlag: {
    type: Boolean,
    default: false,
  },
});
const ruleForm = ref();

// 表单校验
const rules = reactive<any>({
  houseNumber: [{ required: true, message: '请输入户号', trigger: 'blur' }],
  energyType: [{ required: true, message: '请选择能源类型', trigger: 'change' }],
});

const formLabelWidth = '100px';
// 调整方式
const hostingTypes: CommonICodeName<string>[] = Object.entries(HLU_EHostingType)?.map(([k, v]) => {
  return {
    code: v,
    name: k,
  };
});
/**
 * 取消
 */
const cancel = () => {
  hlUpdate.visible = false;
};

// 关闭结束后
const closed = () => {
  hlUpdate.formObj.radioValue = '1';
  ruleForm.value?.resetFields();
};

/**
 * 确定提交
 * @param formEl
 */
const onSubmit = (formEl: any) => {
  if (!formEl) return;
  formEl.validate((valid: boolean) => {
    if (valid) {
      if (hlUpdate.type === EType.新增) {
        hlUpdate.addHouseholdNumber(props.configureHostFlag).then(() => {
          hlTable.queryTableData();
        });
      } else {
        hlUpdate.updateHouseholdNumber(props.configureHostFlag).then(() => {
          hlTable.queryTableData();
        });
      }
      hlUpdate.visible = false;
    }
  });
};

// 区域、业态切换事件
const treeRaidoChange = () => {
  hlUpdate.queryAssociatedNodeList(hlUpdate.formObj.energyType, hlUpdate.formObj.radioValue);
};

/**
 * 能源类型下拉
 * @param val
 */
const energyTypeChange = (val: string) => {
  hlUpdate.formObj.energyType = val;
  hlUpdate.formObj.hostingArea = null;
  hlUpdate.queryAssociatedNodeList(val, hlUpdate.formObj.radioValue);
  hlUpdate.formObj.associatedNode = [];
  hlUpdate.queryHostingAreaList(val);
};

const hostingAreaChange = (val: string) => {
  hlUpdate.formObj.hostingArea = val;
};

let time = 0;
const vFilterHouseholdNumber = {
  mounted(el: HTMLElement) {
    const ele: any = el.tagName === 'INPUT' ? el : el.querySelector('input');
    const handleInput = (e: InputEvent) => {
      if (Math.abs(time - new Date().getTime()) < 1) {
        return;
      }
      time = new Date().getTime();
      // 是否在剪切板
      if (e.isComposing) {
        return;
      }
      const characters: string = '';
      const defaultStr = String.raw`\`\\;\'\"<>`;
      const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
      ele.value = ele.value.replace(reg, '');
      ele.value = ele.value.replace(/\s+/g, '');
      // 过滤中文
      ele.value = ele.value.replace(/[^\x00-\xff]/g, '');

      ele.dispatchEvent(new Event('input'));
    };
    ele.oninput = handleInput;
    ele.onblur = handleInput;
    // 解决输入中文的问题
    ele.addEventListener('compositionend', (e: InputEvent) => {
      // 过滤中文
      ele.value = ele.value.replace(/[^\x00-\xff]/g, '');
      handleInput(e);
    });
  },
};
const vAutoFocus = {
  mounted: (el: HTMLInputElement) => {},
};
</script>
<style lang="less" scoped>
.hnm-list-update {
  width: 100%;
  height: 100%;

  :deep(.te-select, ) {
    width: 100%;
  }
  :deep(.tree-select) {
    width: 100%;
  }

  :deep(.te-date-editor--date) {
    width: 100%;
  }

  :deep(.te-date-editor--month) {
    width: 100%;
  }

  :deep(.te-dialog__footer) {
    text-align: right !important;
  }

  .te-form-item {
    margin-right: 16px !important;
    margin-bottom: 14px !important;
  }

  // select下拉框 清空按钮大小
  :deep(.te-select .te-input .te-select__caret.te-icon) {
    font-size: 17px;
  }
}
</style>
