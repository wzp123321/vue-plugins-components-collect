<template>
  <div class="adsr-add-dialog">
    <el-form
      ref="ruleFormRef"
      class="adsrad-form"
      :model="addDialogService.resInfo"
      :rules="rules"
      label-width="56px"
      @submit.prevent
    >
      <el-form-item :label="props.title + '名称'" prop="name" class="adsrad-form-name-item">
        <el-input
          placeholder="请输入名称"
          class="adsrad-form-name"
          maxlength="20"
          v-model="addDialogService.resInfo.name"
          v-inputFilter:search="{ allowSpace: false }"
          @change="changeInfo"
        ></el-input>
      </el-form-item>
      <el-form-item :label="props.title + '说明'" class="adsrad-form-description-item">
        <textarea
          rows="2"
          :placeholder="props.title + '说明'"
          class="adsrad-form-description"
          maxlength="100"
          v-model="addDialogService.resInfo.description"
          v-inputFilter:search="{ allowSpace: false }"
          @change="changeInfo"
        ></textarea>
      </el-form-item>
    </el-form>
    <!-- 指标 -->
    <div class="adsrad-item-common">
      <div class="adsrad-label">指标</div>
      <div class="adsrad-content adsrad-params">
        <draggable
          v-model="addDialogService.indicatorList"
          class="adsrad-indicator-drag"
          item-key="serialNumber"
          :group="{ name: 'people', put: false, pull: 'clone' }"
          :sort="false"
          animation="300"
          @start="startDrag"
        >
          <template #header>
            <el-input
              class="adsrad-input"
              :class="{ 'adsrad-min-input': inputWidth === '34' }"
              :style="{ width: inputWidth + 'px' }"
              maxlength="20"
              :placeholder="indicatorPh"
              v-show="isShowSearch"
              v-model="addDialogService.indicatorParams.keyWord"
              @input="searchIndicator"
            >
              <template #suffix>
                <el-icon v-show="addDialogService.indicatorParams.keyWord === ''" @click="shrinkSearch">
                  <search />
                </el-icon>
                <el-icon
                  v-show="addDialogService.indicatorParams.keyWord !== ''"
                  class="adsrad-input-close"
                  @click="clearIndicatorSearch"
                >
                  <Close />
                </el-icon>
              </template>
            </el-input>
            <div class="adsrad-min-input" v-show="!isShowSearch">
              <el-icon @click="shrinkSearch"><search /></el-icon>
            </div>
          </template>
          <template #item="{ element }">
            <div
              class="adsrad-indicator-drag-item"
              :style="{ backgroundColor: ColorType[element.indexType], color: FontColorType[element.indexType] }"
            >
              {{ element.name }}
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <!-- 运算符 -->
    <div class="adsrad-item-common">
      <div class="adsrad-label">运算符</div>
      <div class="adsrad-content adsrad-operator">
        <draggable
          v-model="addDialogService.operatorList"
          class="adsrad-operator-drag"
          item-key="serialNumber"
          :group="{ name: 'people', pull: 'clone', put: false }"
          :sort="false"
          animation="300"
          @start="startDrag"
        >
          <template #item="{ element }">
            <div class="adsrad-operator-drag-item">
              {{ element.name }}
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <!-- 关联范围 -->
    <div class="adsrad-item-common">
      <div class="adsrad-label">关联范围</div>
      <div class="adsrad-content adsrad-params">
        <draggable
          v-model="addDialogService.scopeList"
          class="adsrad-indicator-drag"
          item-key="serialNumber"
          :group="{ name: 'people', put: false, pull: 'clone' }"
          :sort="false"
          animation="300"
          @start="startDrag"
        >
          <template #header>
            <el-input
              class="adsrad-input"
              :class="{ 'adsrad-min-input': scopeInputWidth === '34' }"
              :style="{ width: scopeInputWidth + 'px' }"
              maxlength="20"
              :placeholder="scopePh"
              v-show="isShowScopeSearch"
              v-model="addDialogService.scopeParams.keyWord"
              @input="searchScope"
            >
              <template #suffix>
                <el-icon v-show="addDialogService.scopeParams.keyWord === ''" @click="shrinkScopeSearch">
                  <search />
                </el-icon>
                <el-icon
                  v-show="addDialogService.scopeParams.keyWord !== ''"
                  class="adsrad-input-close"
                  @click="clearScopeSearch"
                >
                  <Close />
                </el-icon>
              </template>
            </el-input>
            <div class="adsrad-min-input" v-show="!isShowScopeSearch">
              <el-icon @click="shrinkScopeSearch"><search /></el-icon>
            </div>
          </template>
          <template #item="{ element }">
            <div
              class="adsrad-indicator-drag-item"
              :style="{ backgroundColor: ColorType[element.indexType], color: FontColorType[element.indexType] }"
            >
              {{ element.name }}
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <!-- 分摊规则/计算指标-->
    <div class="adsrad-item-common adsrad-item-required">
      <div class="adsrad-label">{{ props.name }}</div>
      <div class="adsrad-content adsrad-text">
        {{ addDialogService.resInfo.name ? addDialogService.resInfo.name + '=' : '--' }}
      </div>
    </div>
    <!-- 公式 -->
    <div class="adsrad-item-common adsrad-item-formula">
      <div class="adsrad-label"></div>
      <div class="adsrad-content adsrad-formula">
        <div class="adsrad-formula-area" @click="clickFormulaArea">
          <draggable
            v-show="isShowDrag"
            :ghostClass="!isDragOperator ? 'adsrad-formula-drop-param' : ''"
            class="adsrad-formula-drop"
            v-model="addDialogService.resInfo.formulaComponentList"
            item-key="id"
            :group="{ name: 'people', put: true }"
            @add="addFormula"
            @change="changeInfo"
          >
            <template #item="{ element, index }">
              <div
                class="adsrad-formula-drop-common"
                :style="{
                  backgroundColor: isOperator(element) ? 'white' : ColorType[element.indexType],
                  color: FontColorType[element.indexType],
                  padding: isOperator(element) ? '0px' : '0 12px',
                }"
              >
                {{ element.serialNumber.includes('R') ? 'Σ' + element.name : element.name }}
                <el-icon :class="{ 'adsrad-formula-operator': isOperator(element) }" @click.stop="removeFormula(index)">
                  <Close />
                </el-icon>
              </div>
            </template>
            <template #footer>
              <el-tooltip
                placement="top"
                trigger="click"
                v-model="addDialogService.showTooltip.value"
                :show-after="300"
              >
                <template #content>
                  <span
                    class="adsrad-complete-button"
                    style="cursor: pointer"
                    @click.stop="addDialogService.addIndicator(ruleFormRef, 'formula')"
                  >
                    完成并新建
                  </span>
                </template>
                <div
                  class="adsrad-complete-icon"
                  @click.stop
                  v-show="
                    addDialogService.resInfo.formulaComponentList.length > 0 && props.title === '指标' && props.isAdd
                  "
                >
                  <img src="@/assets/img/assessment-department/ad-duigou.svg" alt="确认" />
                </div>
              </el-tooltip>
            </template>
          </draggable>
          <div class="adsrad-formula-text-container">
            <div id="adsrad-formula-number">
              {{ addDialogService.numFormula.value }}
              <el-tooltip
                placement="top"
                trigger="click"
                v-model="addDialogService.showTooltipNumber.value"
                :show-after="300"
              >
                <template #content>
                  <span
                    class="adsrad-complete-button"
                    style="cursor: pointer"
                    @click.stop="addDialogService.addIndicator(ruleFormRef, 'number')"
                  >
                    完成并新建
                  </span>
                </template>
                <div
                  class="adsrad-complete-icon"
                  @click.stop
                  v-show="addDialogService.numFormula.value !== '' && props.title === '指标' && props.isAdd"
                >
                  <img src="@/assets/img/assessment-department/ad-duigou.svg" alt="duigou" />
                </div>
              </el-tooltip>
            </div>
            <el-input
              ref="formulaText"
              v-show="!isShowDrag"
              type="textarea"
              class="adsrad-formula-text"
              v-model="addDialogService.numFormula.value"
              v-inputFilter:number="{ decimal: 2 }"
              @change="changeInfo"
            ></el-input>
          </div>
        </div>
      </div>
    </div>
    <div class="adsrad-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" :disabled="addDialogService.isDisabled.value" @click="sure">确定</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AddDialogService } from './adsr-add-dialog.service';
import { Search, Close } from '@element-plus/icons-vue';
import { nextTick, ref } from 'vue';
import draggable from 'vuedraggable';
import { ColorType, FontColorType, CalculationIndicatoItem, FormulaItem } from './adsr-add-dialog-api';
import { debounce, cloneDeep } from 'lodash';
import message from '@/utils/message';

interface Props {
  title: string;
  name: string;
  isAdd: boolean;
  editItem: CalculationIndicatoItem | null;
}
const props = withDefaults(defineProps<Props>(), {
  title: '',
  name: '',
  isAdd: true, // 是否是新增
  editItem: null,
});
const emit = defineEmits(['sure', 'cancel']);

const ruleFormRef = ref();
const formulaText = ref();
const rules = {
  name: [{ required: true, message: '名称不能为空！', trigger: 'blur' }],
};
const isShowDrag = ref(true);
const isDragOperator = ref(false);
let isChange = false;

const addDialogService = new AddDialogService();
if (props.editItem) {
  addDialogService.resInfo.description = props.editItem.description;
  addDialogService.resInfo.formulaComponentList = props.editItem.formulaComponentList;
  addDialogService.resInfo.id = props.editItem.id;
  addDialogService.resInfo.name = props.editItem.name;
  addDialogService.resInfo.serialNumber = props.editItem.serialNumber;
  addDialogService.resInfo.updateFlag = props.editItem.updateFlag;
  if (props.editItem.formulaComponentList[0]?.indexType === 'number') {
    isShowDrag.value = false;
    addDialogService.numFormula.value = props.editItem.formulaComponentList[0]?.serialNumber;
  }
  if (props.name === '计算指标') {
    addDialogService.indicatorParams.id = props.editItem.id;
  }
}
addDialogService.queryIndicatorList();

if (props.isAdd) {
  addDialogService.resInfo.updateFlag = '0';
} else {
  addDialogService.resInfo.updateFlag = '1';
}

// 指标输入框
const inputWidth = ref('34');
const indicatorPh = ref('');
const isShowSearch = ref(false);
function shrinkSearch() {
  addDialogService.indicatorParams.keyWord = '';
  if (inputWidth.value === '156') {
    indicatorPh.value = '';
    inputWidth.value = '34';
    setTimeout(() => {
      isShowSearch.value = false;
    }, 300);
  } else {
    isShowSearch.value = true;
    setTimeout(() => {
      inputWidth.value = '156';
      indicatorPh.value = '请输入搜索内容';
    }, 150);
  }
}
function clearIndicatorSearch() {
  addDialogService.indicatorParams.keyWord = '';
  addDialogService.queryIndicatorList();
}
const searchIndicator = debounce(() => {
  addDialogService.queryIndicatorList();
}, 300);

// 关联范围输入框
const scopeInputWidth = ref('34');
const scopePh = ref('');
const isShowScopeSearch = ref(false);
function shrinkScopeSearch() {
  addDialogService.scopeParams.keyWord = '';
  if (scopeInputWidth.value === '156') {
    scopePh.value = '';
    scopeInputWidth.value = '34';
    setTimeout(() => {
      isShowScopeSearch.value = false;
    }, 300);
  } else {
    isShowScopeSearch.value = true;
    setTimeout(() => {
      scopeInputWidth.value = '156';
      scopePh.value = '请输入搜索内容';
    }, 150);
  }
}
function clearScopeSearch() {
  addDialogService.scopeParams.keyWord = '';
  addDialogService.queryScopeList();
}
const searchScope = debounce(() => {
  addDialogService.queryScopeList();
}, 300);

function changeInfo() {
  isChange = true;
}

function cancel() {
  emit('cancel', isChange);
}
const sure = debounce(() => {
  if (!ruleFormRef.value) return;
  ruleFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (
        (isShowDrag.value && addDialogService.resInfo.formulaComponentList.length === 0) ||
        (!isShowDrag.value && addDialogService.numFormula.value === '')
      ) {
        message.error('公式不能为空');
        return;
      }
      if (addDialogService.numFormula.value) {
        addDialogService.resInfo.formulaComponentList = [];
        addDialogService.resInfo.formulaComponentList.push({
          id: 'number',
          indexType: 'number',
          name: addDialogService.numFormula.value,
          serialNumber: addDialogService.numFormula.value,
        });
      }
      emit('sure', addDialogService.resInfo);
    } else {
      return false;
    }
  });
}, 300);

function removeFormula(index: number) {
  addDialogService.resInfo.formulaComponentList.splice(index, 1);
}

function startDrag(event: any) {
  if (event.item.className.includes('operator')) {
    isDragOperator.value = true;
  } else {
    isDragOperator.value = false;
  }
  if (addDialogService.resInfo.formulaComponentList[0]?.indexType === 'number') {
    addDialogService.resInfo.formulaComponentList = [];
  }
  isShowDrag.value = true;
  addDialogService.numFormula.value = '';
}

function clickFormulaArea() {
  if (addDialogService.resInfo.formulaComponentList.length === 0) {
    isShowDrag.value = false;
    nextTick(() => {
      formulaText.value!.focus();
    });
  }
}

function addFormula() {
  // 重新给整个公式列表项赋值唯一的key，防止在拖拽排序时报错。
  addDialogService.resInfo.formulaComponentList = addDialogService.resInfo.formulaComponentList.map(
    (item, index): FormulaItem => {
      let res = cloneDeep(item);
      res.id = `front${index}`;
      return res;
    },
  );
}

function isOperator(ele: FormulaItem): boolean {
  const operators = ['+', '-', '*', '/', 'Σ', '(', ')'];
  return operators.includes(ele.serialNumber);
}
</script>

<style lang="less" scoped>
.adsr-add-dialog {
  .adsrad-form {
    padding-bottom: 22px;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(236, 236, 236);
    :deep(.el-form-item__label) {
      padding: 0px;
      margin-right: 8px;
      &::before {
        content: '';
        margin-right: 0px;
      }
    }
    :deep(.el-form-item__content) {
      line-height: normal;
    }
    .adsrad-form-name-item {
      margin-bottom: 26px !important;
      position: relative;
      &::before {
        content: '*';
        color: red;
        position: absolute;
        left: -7px;
      }
    }
    .adsrad-form-description-item {
      margin-bottom: 0px !important;

      :deep(.el-form-item__label) {
        height: 78px;
      }
    }
  }
  .adsrad-form-name {
    width: 300px;
  }
  .adsrad-form-description {
    width: 100%;
    resize: none;
  }
  .adsrad-item-common {
    display: flex;
    min-height: 34px;
    margin-bottom: 16px;
    .adsrad-label {
      width: 56px;
      line-height: 34px;
      text-align: right;
      margin-right: 8px;
    }
    .adsrad-content {
      flex: 1;
    }
    .adsrad-params {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      .adsrad-input {
        transition: all 0.3s;
        :deep(.el-input__inner) {
          padding-right: 30px;
          border-radius: 17px;
          height: 34px;
          line-height: 34px;
          background-color: rgba(230, 247, 255, 1) !important;
          border: none;
          &:focus {
            box-shadow: none;
          }
        }
        :deep(.el-input__suffix) {
          right: 10px;
        }
        :deep(.el-input__suffix-inner) {
          display: flex;
          align-items: center;
        }
        :deep(.el-icon) {
          color: #42a4ff;
          cursor: pointer;
        }
        .adsrad-input-close {
          display: inline-block;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
      }
      .adsrad-min-input {
        width: 34px;
        height: 34px;
        border-radius: 34px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(230, 247, 255, 1);

        :deep(.el-input__inner) {
          padding: 0px !important;
          border-radius: 17px;
          height: 34px;
          line-height: 34px;
          background-color: rgba(230, 247, 255, 1) !important;
        }
        :deep(.el-icon) {
          color: #42a4ff;
          cursor: pointer;
        }
      }
      .adsrad-indicator-drag {
        list-style-type: none;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        max-height: 128px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-bottom: 8px;
        &-item {
          box-sizing: border-box;
          height: 34px;
          line-height: 34px;
          padding: 0 12px;
          cursor: pointer;
          border-radius: 17px;
          color: #096dd9;
          background-color: #e6f7ff;
          &:hover {
            box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }
    .adsrad-operator {
      .adsrad-operator-drag {
        list-style-type: none;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        .adsrad-operator-drag-item {
          width: 34px;
          height: 34px;
          border-radius: 34px;
          line-height: 34px;
          cursor: pointer;
          text-align: center;
          background-color: rgba(250, 250, 250, 1);
          border: 0.5px solid rgba(151, 151, 151, 1);
          &:hover {
            background-color: rgba(230, 247, 255, 1);
            color: #1890ff;
            border: 0.5px solid #1890ff;
            box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }
    .adsrad-text {
      line-height: 34px;
      color: rgba(24, 144, 255, 1);
    }
  }
  .adsrad-item-required {
    position: relative;
    &::before {
      content: '*';
      color: red;
      position: absolute;
      left: -7px;
      top: 6px;
    }
  }
  .adsrad-formula {
    .adsrad-formula-area {
      border-radius: 3px;
      height: 120px;
      overflow-y: auto;
      border: 1px solid rgba(0, 0, 0, 0.15);
      .adsrad-formula-drop {
        min-height: 118px;
        border-radius: 17px;
        padding: 7px 9px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .adsrad-formula-drop-param {
        height: 34px;
        line-height: 34px;
        padding: 0 12px;
        cursor: pointer;
        border-radius: 17px;
        color: #096dd9;
        background-color: #e6f7ff;
      }
      .adsrad-formula-drop-common {
        height: 34px;
        line-height: 34px;
        padding: 0 12px;
        cursor: pointer;
        border-radius: 17px;
        color: #096dd9;
        background-color: #e6f7ff;
        position: relative;
        :deep(.el-icon) {
          display: none;
          width: 14px;
          height: 14px;
          border-radius: 14px;
          position: absolute;
          top: -5px;
          right: 0px;
          background-color: #f0f0f0;
          cursor: pointer;
          svg {
            width: 8px;
            height: 8px;
          }
          &:hover {
            background-color: #d9d9d9;
          }
        }
        .adsrad-formula-operator {
          right: -9px !important;
        }
        &:hover {
          :deep(.el-icon) {
            display: inline-block;
          }
        }
      }
      .adsrad-complete-button {
        cursor: pointer;
      }
    }
    .adsrad-complete-icon {
      display: flex;
      align-items: center;
      height: 34px;
    }
    &::after {
      content: '注:不同类型属性不能进行规则换算';
      display: inline-block;
      margin-top: 5px;
      color: rgba(0, 0, 0, 0.25);
      font-size: 12px;
    }
    .adsrad-formula-text-container {
      position: relative;
      #adsrad-formula-number {
        left: 9px;
        position: absolute;
        .adsrad-complete-icon {
          width: 16px;
          position: absolute;
          z-index: 5;
          top: 0px;
          right: -24px;
        }
      }
    }
    .adsrad-formula-text {
      :deep(textarea) {
        resize: none;
        border: none;
        padding: 0;
        width: 100%;
        height: 118px;
        padding: 7px 9px;
        &:focus {
          box-shadow: none;
        }
      }
    }
  }
  .adsrad-item-formula {
    margin-bottom: 6px !important;
  }
  .adsrad-footer {
    text-align: right;
  }
  textarea {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    font-family: PingFangSC-Regular;
  }
  textarea::placeholder {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.25);
    font-family: PingFangSC-Regular;
  }
  :deep(.el-button.is-disabled) {
    background-color: rgba(160, 207, 255, 1) !important;
    border-color: rgba(160, 207, 255, 1) !important;
  }
}
</style>
