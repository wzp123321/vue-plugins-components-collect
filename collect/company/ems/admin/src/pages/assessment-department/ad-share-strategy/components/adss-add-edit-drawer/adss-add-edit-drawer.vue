<template>
  <div class="adss-add-edit-drawer">
    <te-drawer v-model="visible" :title="mapDialogTitle()" direction="rtl" :before-close="close">
      <template #default>
        <AdssSubTitle title="基本信息"></AdssSubTitle>
        <te-form label-width="76px">
          <te-form-item label="策略名称">
            <te-input v-model="addEditForm.apportionedName" placeholder="请输入策略名称" />
          </te-form-item>
          <te-form-item label="能源类型">
            <te-select v-model="addEditForm.energyCode" placeholder="请选择或搜索关联指标">
              <te-option v-for="item in energyList" :key="item.id" :label="item.name" :value="item.code" />
            </te-select>
          </te-form-item>
          <te-form-item label="分摊周期">
            <template v-for="(item, index) in addEditForm.apportionDates">
              <te-date-picker
                v-model="addEditForm.apportionDates[index]"
                :disabledDate="mapDateDisabled"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </template>

            <te-button @click="handleDateAdd"><icon-plus />新增周期</te-button>
          </te-form-item>
        </te-form>
        <AdssSubTitle title="规则信息" class="avd-sub"></AdssSubTitle>
        <te-form label-width="76px">
          <te-form-item label="分摊源">
            <div class="aaed-share-source" @click.stop="openSourceDialog">
              <template v-if="addEditForm.apportionedSources && addEditForm.apportionedSources.length > 0">
                <el-tag
                  v-for="(item, index) in addEditForm.apportionedSources"
                  :title="transSourceName(item)"
                  @click.stop="toShowSourceInfo(item, index)"
                  closable
                  type="info"
                  size="small"
                  @close="deleteSourceVar(index)"
                >
                  {{ transSourceName(item) }}
                </el-tag>
              </template>
              <span v-else class="aaed-share-source-placeholder">请选择分摊源</span>
            </div>
          </te-form-item>
          <te-form-item label="分摊规则">
            <te-select v-model="addEditForm.apportionedRule" placeholder="请选择分摊规则">
              <te-option v-for="item in ruleList" :key="item.id" :label="item.name" :value="item.id" />
            </te-select>
          </te-form-item>
          <te-form-item label="分摊对象">
            <el-popover
              popper-class="adssa-popover"
              placement="top-start"
              :width="464"
              :show-arrow="false"
              trigger="click"
              v-model:visible="apportionObjectVisible"
            >
              <AdssApportionShareObject
                v-if="apportionObjectVisible"
                @cancel="cancelObject"
                @sure="sureObject"
                :initObjectIds="initObjectItem"
                :init-object-type="addEditForm.apportionedObjectType"
              ></AdssApportionShareObject>
              <template #reference>
                <div class="aaed-share-source" @click.stop="showObject">
                  <template v-if="addEditForm.apportionedObjectList && addEditForm.apportionedObjectList.length > 0">
                    <el-tag
                      v-for="(item, index) in addEditForm.apportionedObjectList"
                      closable
                      type="info"
                      size="small"
                      @close="deleteObject(index)"
                    >
                      {{ item.name }}
                    </el-tag>
                  </template>
                  <span v-else class="aaed-share-source-placeholder">请选择分摊源</span>
                </div>
              </template>
            </el-popover>
          </te-form-item>
        </te-form>
        <!-- 分摊源选择 -->
        <el-dialog
          title="分摊源选择"
          width="928px"
          :zIndex="1000"
          :close-on-click-modal="false"
          v-model="apportionSourceVisible"
          custom-class="adssa-inner-dialog"
          destroy-on-close
        >
          <AdssApportionSource
            @cancel="cancelSource"
            @sure="sureSource"
            :sourceInit="sourceInit"
            :energyCode="addEditForm.energyCode"
          ></AdssApportionSource>
        </el-dialog>
      </template>
      <template #footer>
        <div style="flex: auto">
          <te-button @click="close">取消</te-button>
          <te-button type="primary" @click="handleSubmit">确定</te-button>
        </div>
      </template>
    </te-drawer>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue';
// 服务
import { At_ITableItem } from '../adss-table/adss-table.api';
import { EnergyTypeItem, RuleItemVO, SourceItem, StrategyService, sourceType } from '../adss-add/adss-add.api';
import { SelectedItem } from '../adss-add/components/adssa-share-object/adssa-share-object-service';
import { Aaed_IForm } from './adss-add-edit-drawer.api';
// 组件
import AdssSubTitle from '../adss-sub-title/adss-sub-title.vue';
import AdssApportionSource from '../adss-apportion-source/adss-apportion-source.vue';
import AdssApportionShareObject from '../adss-apportion-object/adss-apportion-object.vue';
import { IconPlus } from '@arco-iconbox/vue-te';
import { TeMessage } from '@tiansu/element-plus';
import { postRequest } from '@/services/request';
import { Ass_EPath } from '../../ad-share-strategy.api';
import { FResHandler } from '@/utils/token';

// emit
const emit = defineEmits(['addEditSuccess']);

// 开关
const visible = ref<boolean>(false);
// 数据
const addEditForm = reactive<Aaed_IForm>({
  apportionedName: '',
  apportionedObject: '',
  apportionedObjectList: [],
  apportionedObjectName: '',
  apportionedObjectType: '',
  apportionedRule: '',
  apportionedRuleId: '',
  apportionedSource: '',
  apportionedSources: [],
  energyCode: '',
  energyName: '',
  id: null,
  apportionDates: [],
});

// 打开
const show = async (data?: At_ITableItem) => {
  await queryEnergyList();
  queryRuleList();

  visible.value = true;
  addEditForm.apportionDates = [];
  if (data && data?.apportionedEndTime && data?.apportionedStartTime) {
    addEditForm.apportionDates.push([new Date(data.apportionedStartTime), new Date(data.apportionedEndTime)]);
  } else {
    addEditForm.apportionDates.push([]);
  }
  addEditForm.apportionedName = data && data.apportionedName ? data.apportionedName : '';
  addEditForm.apportionedObject = data && data.apportionedObject ? data.apportionedObject : '';
  addEditForm.apportionedObjectList = data && data.apportionedObjectList ? data.apportionedObjectList : [];
  addEditForm.apportionedObjectName = data && data.apportionedObjectName ? data.apportionedObjectName : '';
  addEditForm.apportionedObjectType = data && data.apportionedObjectType ? data.apportionedObjectType : '';
  addEditForm.apportionedRule = data && data.apportionedRule ? data.apportionedRule : '';
  addEditForm.apportionedRuleId = data && data.apportionedRuleId ? data.apportionedRuleId : '';
  addEditForm.apportionedSource = data && data.apportionedSource ? data.apportionedSource : '';
  addEditForm.apportionedSources = data && data.apportionedSources ? data.apportionedSources : [];
  // 能源类型默认选中第一个
  addEditForm.energyCode = data && data.energyCode ? data.energyCode : energyList.value?.[0]?.code;
  addEditForm.energyName = data && data.energyName ? data.energyName : '';
  addEditForm.id = data && data.id ? data.id : null;
};
// 关闭
const close = () => {
  visible.value = false;
};
// 标题
const mapDialogTitle = () => {
  return !addEditForm.id ? '新增分摊策略' : '编辑分摊策略';
};
/**
 * 日期禁用,未来时间不可选，已选择的区间不可选
 * @param date
 */
const mapDateDisabled = (date: Date) => {
  return (
    date.getTime() > new Date().getTime() ||
    addEditForm.apportionDates.some((item) => {
      return item.length > 0 && date.getTime() >= item[0].getTime() && date.getTime() <= item[1].getTime();
    })
  );
};

// 能源类型列表
const energyList = ref<EnergyTypeItem[]>([]);
/**
 * 查询能源类型
 */
const queryEnergyList = async () => {
  try {
    const res = await StrategyService.getEnergyType();
    energyList.value = res?.data ?? [];
  } catch (error) {
    energyList.value = [];
  }
};
// 分摊规则
const ruleList = ref<RuleItemVO[]>([]);
/**
 * 查询规则列表
 */
const queryRuleList = async () => {
  try {
    const res = await StrategyService.getShareRule();
    ruleList.value = res.data ?? [];
  } catch (error) {
    console.warn(error);
  }
};
/**
 * 新增周期
 * @returns {void}
 */
const handleDateAdd = (): void => {
  if (addEditForm.apportionDates && addEditForm.apportionDates.length >= 10) {
    TeMessage.error('分摊周期最多可增加十组');
  } else {
    addEditForm.apportionDates.push([]);
  }
};
// 分摊源
// 分摊源开关
const apportionSourceVisible = ref<boolean>(false);
// 用来记录当前点击的是哪个分摊源
let currentSource = -1;
const sourceInit = ref<SourceItem | null>(null);
/**
 * 打开弹框
 */
const openSourceDialog = () => {
  apportionSourceVisible.value = true;
  sourceInit.value = {
    apportionedSourceFormula: '',
    apportionedSourceType: addEditForm.apportionedSources[0]?.apportionedSourceType,
    apportionedSourceVarList: [],
  };
  currentSource = -1;
};
/**
 * 关闭弹框
 */
const cancelSource = () => {
  apportionSourceVisible.value = false;
};
/**
 * 勾选分摊源
 * @param data
 */
const sureSource = (data: SourceItem) => {
  // 判断点位是否已经存在
  if (data.apportionedSourceType === sourceType.点位) {
    let isExist = addEditForm.apportionedSources?.some((item) => {
      return (
        item.apportionedSourceVarList[0].concentratorId === data.apportionedSourceVarList[0].concentratorId &&
        item.apportionedSourceVarList[0].deviceId === data.apportionedSourceVarList[0].deviceId &&
        item.apportionedSourceVarList[0].pointNumber === data.apportionedSourceVarList[0].pointNumber
      );
    });
    if (isExist) {
      TeMessage.warning('分摊源不能存在重复点位');
      return;
    }
  }
  // 如果是-1则说明是新增，不是则为修改
  if (currentSource === -1) {
    if (
      addEditForm.apportionedSources?.at(-1)?.apportionedSourceType === sourceType.点位 &&
      data.apportionedSourceType === sourceType.变量
    ) {
      TeMessage.warning('分摊源不能同时存在点位和变量');
      return;
    }
    if (addEditForm.apportionedSources?.at(-1)?.apportionedSourceType === sourceType.变量) {
      TeMessage.warning('分摊源只能存在一个变量');
      return;
    }
    addEditForm.apportionedSources.push(data);
  } else {
    addEditForm.apportionedSources[currentSource] = data;
  }
};
/**
 * 转换
 * @param item
 */
const transSourceName = (item: SourceItem) => {
  let res = '';
  if (item.apportionedSourceType === sourceType.点位) {
    item.apportionedSourceVarList.forEach((item) => {
      res = `${item.deviceName}：${item.pointNumberName}`;
    });
  } else {
    res = item.apportionedSourceFormula;
    item.apportionedSourceVarList.forEach((item, index) => {
      let re = new RegExp(String.raw`V${index}(?![0-9])`, 'g');
      res = res.replace(re, `${item.deviceName}：${item.pointNumberName}`);
    });
  }
  return res;
};
/**
 * 定位分摊源
 * @param item
 * @param index
 */
const toShowSourceInfo = (item: SourceItem, index: number) => {
  apportionSourceVisible.value = true;
  sourceInit.value = item;
  currentSource = index;
};
/**
 * 单个删除
 * @param index
 */
const deleteSourceVar = (index: number) => {
  console.log(index);
  addEditForm.apportionedSources.splice(index, 1);
};

// 分摊对象
const initObjectItem = ref<string[]>([]);
// 分摊对象开关
const apportionObjectVisible = ref<boolean>(false);
/**
 * 关闭弹框
 */
const cancelObject = () => {
  apportionObjectVisible.value = false;
};
/**
 *
 * @param data
 */
const sureObject = (data: SelectedItem[]) => {
  addEditForm.apportionedObjectList = [];
  data?.forEach((item) => {
    addEditForm.apportionedObjectList.push({ id: item.id, name: item.name });
  });
  addEditForm.apportionedObjectType = data?.[0]?.type;
};
/**
 *
 */
const showObject = () => {
  apportionObjectVisible.value = true;
  initObjectItem.value = [];
  addEditForm.apportionedObjectList?.forEach((item) => {
    initObjectItem.value.push(item.id);
  });
};
/**
 *
 * @param index
 */
const deleteObject = (index: number) => {
  addEditForm.apportionedObjectList.splice(index, 1);
};

/**
 * 提交
 */
const handleSubmit = async () => {
  if (!submitting) {
    if (addEditForm.apportionedName === '') {
      TeMessage.error('策略名称不能为空');
      return;
    }
    if (!addEditForm.apportionDates || addEditForm.apportionDates.length === 0) {
      TeMessage.error('分摊周期日期不能为空');
      return;
    }
    // 填写不完整
    const incompleteFlag = addEditForm.apportionDates?.some((item) => {
      return !item || item.length === 0;
    });
    if (incompleteFlag) {
      TeMessage.error('分摊周期日期填写不完整');
      return;
    }
    if (mapDatesCross(addEditForm.apportionDates)) {
      TeMessage.error('分摊源周期不能交叉');
      return;
    }
    if (addEditForm.apportionedSources.length === 0) {
      TeMessage.error('分摊源不能为空');
      return;
    }
    if (addEditForm.apportionedRuleId === '') {
      TeMessage.error('分摊规则不能为空');
      return;
    }
    if (addEditForm.apportionedObjectList.length === 0) {
      TeMessage.error('分摊对象不能为空');
      return;
    }
    const res = await handleRequest();
    if (res) {
      visible.value = false;
      emit('addEditSuccess');
    }
  }
};
// 是否请求中
const submitting = ref<boolean>(false);
/**
 * 新增请求
 */
const handleRequest = () => {
  return new Promise(async (resolve) => {
    submitting.value = true;
    try {
      const path = !addEditForm.id ? Ass_EPath.新增分摊策略 : Ass_EPath.编辑分摊策略;
      const res = await postRequest(path, addEditForm);
      const result = FResHandler<boolean>(res);
      if (result) {
        TeMessage.success(res?.message);
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      console.warn(error);
      resolve(false);
    } finally {
      submitting.value = false;
    }
  });
};

/**
 * 判断分摊周期是否有交叉
 * @returns {boolean}
 */
const mapDatesCross = (timeSegments: Date[][]) => {
  for (let i = 0; i < timeSegments.length - 1; i++) {
    for (let j = i + 1; j < timeSegments.length; j++) {
      if (timeSegments[i][0] < timeSegments[j][1] && timeSegments[i][1] > timeSegments[j][0]) {
        return true; // 存在交集
      }
    }
  }
  return false; // 不存在交集
};

// 对外暴露
defineExpose({
  show,
});
</script>
<style lang="less" scoped>
.adss-add-edit-drawer {
  .avd-sub {
    margin-top: 40px;
  }

  :deep(.te-form) {
    .te-form-item__label {
      color: rgb(48, 49, 51);
      font-weight: 600;
    }

    .te-form-item__content {
      color: var(--te-text-color-regular);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 6px;

      .te-input,
      .te-select,
      .te-date-editor--daterange {
        width: 100%;
      }

      .aaed-share-source {
        width: 100%;
        min-height: 36px;
        max-height: 96px;
        border: 1px solid rgb(220, 223, 230);
        border-radius: 4px;
        padding: 6px;
        cursor: pointer;
        transition: all 0.3s;
        overflow: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;

        &:hover {
          border-color: rgb(24, 144, 255);
        }

        .aaed-share-source-placeholder {
          color: var(--te-text-color-placeholder);
          padding-left: 6px;
        }
      }
    }
  }
}
</style>
