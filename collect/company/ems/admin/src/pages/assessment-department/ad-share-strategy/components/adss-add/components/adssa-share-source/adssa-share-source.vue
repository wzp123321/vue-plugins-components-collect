<template>
  <div class="adssa-share-source">
    <div class="adssass-radio-select">
      <span class="adssass-radio-prop">分摊源类型</span>
      <el-radio-group v-model="shareSourceInfo.apportionedSourceType" :disabled="sourceTypeDisabled">
        <el-radio label="0">点位</el-radio>
        <el-radio label="1">变量</el-radio>
      </el-radio-group>
    </div>
    <!-- 点位内容展示 -->
    <div class="adssass-point-select">
      <point-select
        @selectedPoint="getSelectedPoint"
        :energyCode="props.energyCode"
        :initData="initPointData"
      ></point-select>
    </div>
    <!-- 变量公式 -->
    <div class="adssass-variable-content" v-if="shareSourceInfo.apportionedSourceType === sourceType.变量">
      <div class="adssass-variable-content-left">
        <div class="adssass-title-name">赋值变量</div>
        <div class="adssass-use-explain">使用说明：赋予实际意义的变量“V0”、“V1”用于右侧公式编辑</div>
        <ul v-show="shareSourceInfo.apportionedSourceVarList?.length !== 0">
          <li v-for="(item, index) in shareSourceInfo.apportionedSourceVarList">
            <div class="adssass-tag-img"></div>
            <div class="adssass-var-name">V{{ index }}</div>
            <div
              class="adssass-point-info"
              :title="`${item.concentratorName || '--'}-${item.deviceName || '--'}-${item.pointNumberName || '--'}`"
            >
              {{ `${item.concentratorName || '--'}-${item.deviceName || '--'}-${item.pointNumberName || '--'}` }}
            </div>
            <div class="adssass-delete" @click="deleteVar(index)"></div>
          </li>
        </ul>
        <div class="adssass-no-data-container" v-show="shareSourceInfo.apportionedSourceVarList?.length === 0">
          <no-data :width="100" :height="100"></no-data>
        </div>
      </div>
      <div class="adssass-variable-content-right">
        <div class="adssass-title-name">公式编辑框</div>
        <div class="adssass-use-explain">使用说明：在下面输入框中输入公式，且只能使用下列计算符号、和左侧变量名</div>
        <div class="adssass-compute-symbol">
          <div class="adssass-symbol-item">+</div>
          <div class="adssass-symbol-item">-</div>
          <div class="adssass-symbol-item">*</div>
          <div class="adssass-symbol-item">/</div>
          <div class="adssass-symbol-item">(</div>
          <div class="adssass-symbol-item">)</div>
        </div>
        <div class="adssass-input-container" :class="{ wrongful: !isLegal }">
          <el-input
            spellcheck="false"
            v-model="shareSourceInfo.apportionedSourceFormula"
            v-inputFilter:search
            type="textarea"
            resize="none"
            placeholder="请输入"
            @focus="isLegal = true"
          ></el-input>
        </div>
      </div>
    </div>
    <div class="adssass-dialog-footer">
      <el-button @click="cancelDialog">取消</el-button>
      <el-button type="primary" @click="sureDialog">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import PointSelect from '../adssa-point-select/adssa-point-select.vue';
import { SelectedPoint } from '../adssa-point-select/adssa-point-select-api';
import { cloneDeep } from 'lodash';
import { PropType, reactive, ref } from 'vue';
import message from '@/utils/message';
import { SourceItem, sourceType } from '../../adss-add.api';

const props = defineProps({
  energyCode: String,
  sourceInit: Object as PropType<SourceItem | null>,
});
const emit = defineEmits(['cancel', 'sure']);
const shareSourceInfo = reactive<SourceItem>({
  apportionedSourceType: sourceType.点位,
  apportionedSourceFormula: '',
  apportionedSourceVarList: [],
});
const isLegal = ref(true);
const initPointData = ref<SelectedPoint | null>(null);
const sourceTypeDisabled = ref(false);

if (props.sourceInit) {
  shareSourceInfo.apportionedSourceFormula = props.sourceInit.apportionedSourceFormula;
  if (props.sourceInit.apportionedSourceType) {
    shareSourceInfo.apportionedSourceType = props.sourceInit.apportionedSourceType;
    sourceTypeDisabled.value = true;
  } else {
    sourceTypeDisabled.value = false;
  }
  shareSourceInfo.apportionedSourceVarList = cloneDeep(props.sourceInit.apportionedSourceVarList);

  if (props.sourceInit.apportionedSourceType === sourceType.点位) {
    initPointData.value = props.sourceInit.apportionedSourceVarList[0];
  }
}

function getSelectedPoint(data: SelectedPoint) {
  const obj = {
    concentratorId: data?.concentratorId ?? '',
    concentratorName: data?.concentratorName ?? '',
    deviceId: data?.deviceId ?? '',
    deviceName: data?.deviceName ?? '',
    pointNumber: data?.pointNumber ?? '',
    pointNumberName: data?.pointNumberName ?? '',
    standardPointCode: data?.standardPointCode ?? '',
  };
  if (shareSourceInfo.apportionedSourceType === sourceType.点位) {
    shareSourceInfo.apportionedSourceVarList = [];
    if (obj.pointNumber !== '') {
      shareSourceInfo.apportionedSourceVarList?.push(obj);
      shareSourceInfo.apportionedSourceFormula = 'V0';
    }
  } else {
    // 判断点位是否已经存在
    let isExist = false;
    shareSourceInfo.apportionedSourceVarList?.forEach((item) => {
      if (
        item.concentratorId === data.concentratorId &&
        item.deviceId === data.deviceId &&
        item.pointNumber === data.pointNumber
      ) {
        isExist = true;
      }
    });
    if (isExist) {
      message.warning('变量不能存在重复点位');
      return;
    }
    if (obj.pointNumber !== '') {
      shareSourceInfo.apportionedSourceVarList?.push(obj);
    }
  }
}

function cancelDialog() {
  emit('cancel');
}
function sureDialog() {
  if (shareSourceInfo.apportionedSourceVarList.length === 0) {
    message.warning('请先选择点位');
    return;
  }
  if (shareSourceInfo.apportionedSourceType === sourceType.点位) {
    emit('sure', cloneDeep(shareSourceInfo));
    emit('cancel');
  } else if (shareSourceInfo.apportionedSourceType === sourceType.变量) {
    isLegal.value = checkFormula();
    if (isLegal.value) {
      emit('sure', cloneDeep(shareSourceInfo));
      emit('cancel');
    } else {
      message.warning(formulaTip);
    }
  }
}

let formulaTip = '公式或计算符号无法识别，请重新输入';
const checkFormula = () => {
  let flag = true;
  let newFormula = shareSourceInfo.apportionedSourceFormula;
  let formulaCodes = shareSourceInfo.apportionedSourceVarList?.map((item, index) => {
    return `V${index}`;
  });
  // 排除除V,0-9,+-*/(),其他字符，且不允许连续运算符出现
  if (
    newFormula &&
    (/!/.test(newFormula) || /[\+\-\*\/]{2,}/.test(newFormula) || /[^\+\-\*\/()V0-9]/.test(newFormula))
  ) {
    flag = false;
    formulaTip = '公式或计算符号无法识别，请重新输入';
    return flag;
  }
  // 排除除以0不规范的公式
  if (newFormula.includes('/0')) {
    flag = false;
    formulaTip = '公式或计算符号无法识别，请重新输入';
    return flag;
  }
  // 不能*/开头
  if (newFormula.startsWith('*') || newFormula.startsWith('/')) {
    flag = false;
    formulaTip = '公式或计算符号无法识别，请重新输入';
    return flag;
  }
  // 禁止纯数字
  let newFormulaCopy = newFormula.replace(/(?<=V)[0-9]+/g, '');
  if (/(?<!V)[0-9]/.test(newFormulaCopy)) {
    flag = false;
    formulaTip = '公式禁止输入数字';
    return flag;
  }
  // 按运算符分割字符串 校验所有符号都在公式内
  // 通过+ - * ( )分割 得到的数组 去除空字符串去除非V符号 去重后与原数组进行比较看是否多了 少了
  // 这里可以判断元素是否有.开头的 这也是不合法的
  let codeResult = newFormula.split(/[-+*()/]/);
  codeResult = codeResult.filter((item) => {
    // 特殊情况 数字以./开头 数字为0.000这种无效数字
    if (item.startsWith('.') || item.replaceAll('0', '') === '.') {
      flag = false;
      formulaTip = '公式或计算符号无法识别，请重新输入';
    }
    return item && item.indexOf('V') !== -1;
  });
  codeResult = Array.from(new Set(codeResult));
  if (codeResult?.length !== formulaCodes?.length) {
    flag = false;
    if (codeResult?.length > formulaCodes?.length) {
      formulaTip = '存在未定义的变量，无法生成';
    } else if (codeResult?.length < formulaCodes?.length) {
      formulaTip = '存在未使用的变量，无法生成';
    }
    return flag;
  } else {
    codeResult = codeResult.filter((item) => {
      return !formulaCodes.includes(item);
    });
    if (codeResult?.length !== 0) {
      flag = false;
      formulaTip = '存在未定义的变量，无法生成';
      return flag;
    }
  }
  if (/[V\d]\\1/.test(newFormula)) {
    flag = false;
    formulaTip = '公式或计算符号无法识别，请重新输入';
    return flag;
  }
  formulaCodes = formulaCodes.reverse(); // 对每个v进行替换
  formulaCodes.forEach((item: any) => {
    newFormula = newFormula.replaceAll(item, `${item.replace('V', '')}`);
  });
  try {
    eval(newFormula);
  } catch (error) {
    flag = false;
    formulaTip = '公式或计算符号无法识别，请重新输入';
  }
  return flag;
};

function deleteVar(index: number) {
  shareSourceInfo.apportionedSourceVarList?.splice(index, 1);
}
</script>

<style lang="less" scoped>
.adssa-share-source {
  .adssass-radio-select {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 15px;
    height: 22px;
    .el-radio {
      height: 22px;
      margin-right: 48px;
    }
    .adssass-radio-prop {
      margin-right: 16px;
    }
  }
  .adssass-variable-content {
    display: flex;
    margin-top: 16px;
    &-left {
      width: 436px;
      padding: 0 10px 10px 15px;
      border-right: 1px solid #ececec;
      .adssass-title-name {
        height: 18px;
        margin-bottom: 8px;
      }
      .adssass-use-explain {
        opacity: 0.5;
        color: rgba(16, 16, 16, 100);
        font-size: 12px;
        margin-bottom: 8px;
      }
      ul {
        padding-right: 10px;
        height: 120px;
        overflow-y: scroll;
        overflow-x: hidden;
        &::-webkit-scrollbar {
          width: 4px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: rgba(223, 223, 223, 1);
        }
        li {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          height: 32px;
          position: relative;
          div {
            line-height: 32px;
          }
          .adssass-tag-img {
            width: 14px;
            height: 14px;
            background: url('@/assets/img/assessment-department/ad-list-item.svg');
            background-size: 14px 14px;
            margin-right: 10px;
          }
          .adssass-var-name {
            width: 17px;
            margin-right: 10px;
          }
          .adssass-point-info {
            flex: 1;
            margin-right: 10px;
            padding: 0 15px;
            background-color: rgba(235, 235, 235, 100);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .adssass-delete {
            width: 14px;
            height: 14px;
            cursor: pointer;
            position: absolute;
            top: 50%;
            right: -10px;
            transform: translateY(-50%);
            background: url('@/assets/img/assessment-department/ad-delete-noactive.svg');
          }
        }
      }
      .adssass-no-data-container {
        height: 120px;
      }
    }
    &-right {
      flex: 1;
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      .adssass-title-name {
        height: 18px;
        margin-bottom: 8px;
      }
      .adssass-use-explain {
        opacity: 0.5;
        height: 18px;
        color: rgba(16, 16, 16, 100);
        font-size: 12px;
        margin-bottom: 8px;
      }
      .adssass-compute-symbol {
        width: 215px;
        height: 20px;
        display: flex;
        .adssass-symbol-item {
          width: 20px;
          height: 20px;
          line-height: 20px;
          text-align: center;
          background-color: rgba(215, 215, 215, 0.5);
          color: rgba(16, 16, 16, 1);
          margin-right: 8px;
        }
      }
      .adssass-input-container {
        flex: 1;
        margin-top: 10px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        :deep(.el-textarea) {
          height: 100%;
          .el-textarea__inner {
            height: 100%;
            border: none !important;
          }
        }
      }
      .wrongful {
        border: 1px solid #f56c6c;
      }
    }
  }
  .adssass-dialog-footer {
    text-align: right;
    margin-top: 20px;
  }
}
</style>
