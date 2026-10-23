<!-- 表单控件项 -->
<template>
  <template v-if="!isView">
    <te-input
      v-if="item.componentType === FormComponentTypeEnum.INPUT"
      class="wf-item-value-noborder"
      v-model="item.value"
      :placeholder="item.input?.placeholder"
      :disabled="item.permission === FormFieldPermissionEnum.READ_ONLY"
      :maxlength="200"
      :show-word-limit="true"
    >
    </el-input>
    <te-input
      v-else-if="item.componentType === FormComponentTypeEnum.TEXT_AREA"
      class="wf-item-value-noborder"
      type="textarea"
      v-model="item.value"
      :placeholder="item.textarea?.placeholder"
      :disabled="item.permission === FormFieldPermissionEnum.READ_ONLY"
      :maxlength="200"
      :show-word-limit="true"
    >
    </el-input>
    <!-- 数字输入框 -->
    <te-input-number
      v-else-if="item.componentType === FormComponentTypeEnum.NUMBER"
      v-model="item.value"
      :min="-999999999999999"
      :max="999999999999999"
      :placeholder="item.number?.placeholder"
      :disabled="item.permission === FormFieldPermissionEnum.READ_ONLY"
    ></el-input-number>
    <!-- 单选框 -->
    <te-select
      v-else-if="item.componentType === FormComponentTypeEnum.SELECT"
      v-model="item.value"
      value-key="value"
      :placeholder="item.select?.placeholder"
      :clearable="true"
      :disabled="item.permission === FormFieldPermissionEnum.READ_ONLY"
    >
      <te-option v-for="option in item.select?.items" :label="option.label" :value="option.value || ''"></el-option>
    </el-select>
    <!-- 多选框 -->
    <te-select
      v-else-if="item.componentType === FormComponentTypeEnum.MULTI_SELECT"
      :model-value="(item.valueConver as string[])"
      value-key="value"
      :placeholder="item.multiSelect?.placeholder"
      :multiple="true"
      :collapse-tags="true"
      :collapse-tags-tooltip="true"
      :max-collapse-tags="5"
      :clearable="true"
      :disabled="item.permission === FormFieldPermissionEnum.READ_ONLY"
      @update:model-value="multipleChange($event)"
    >
      <te-option
        v-for="option in item.multiSelect?.items"
        :label="option.label"
        :value="option.value || ''"
      ></el-option>
    </el-select>
    <!-- 日期选择 -->
    <te-date-picker
      v-else-if="item.componentType === FormComponentTypeEnum.DATE_TIME"
      :type="item.dateTime?.timeFormat === TimeFormatTypeEnum.DATE ? 'date' : 'datetime'"
      :format="
        item.dateTime?.timeFormat === TimeFormatTypeEnum.AM_OR_PM
          ? 'YYYY-MM-DD a'
          : item.dateTime?.timeFormat === TimeFormatTypeEnum.DATE
          ? 'YYYY-MM-DD'
          : 'YYYY-MM-DD HH:mm'
      "
      :placeholder="item.dateTime?.placeholder"
      :model-value="(item.valueConver as number)"
      :disabled="item.permission === FormFieldPermissionEnum.READ_ONLY"
      @update:model-value="dateTimeChange($event, item)"
    ></el-date-picker>
    <!-- 日期范围选择 -->
    <te-date-picker
      v-else-if="item.componentType === FormComponentTypeEnum.DATE_TIME_RANGE"
      :type="item.dateTimeRange?.timeFormat === TimeFormatTypeEnum.DATE ? 'daterange' : 'datetimerange'"
      :format="
        item.dateTimeRange?.timeFormat === TimeFormatTypeEnum.AM_OR_PM
          ? 'YYYY-MM-DD a'
          : item.dateTimeRange?.timeFormat === TimeFormatTypeEnum.DATE
          ? 'YYYY-MM-DD'
          : 'YYYY-MM-DD HH:mm'
      "
      :model-value="(item.valueConver as Date)"
      :disabled="item.permission === FormFieldPermissionEnum.READ_ONLY"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      @update:model-value="dateTimeRangeChange($event, item)"
    ></el-date-picker>
    <!-- 人员选择/部门选择 -->
    <form-subject-select
      v-else-if="
        item.componentType === FormComponentTypeEnum.EMPLOYEE || item.componentType === FormComponentTypeEnum.DEPARTMENT
      "
      :axios="axios"
      :tenantId="tenantId"
      :item="item"
      :is-view="isView"
    >
    </form-subject-select>
    <!-- 附件 -->
    <form-upload
      v-else-if="
        item.componentType === FormComponentTypeEnum.FILE ||
        item.componentType === FormComponentTypeEnum.VIDEO ||
        item.componentType === FormComponentTypeEnum.IMAGE
      "
      :item="item"
      :axios="axios"
      :tenantId="tenantId"
      :is-view="isView"
    ></form-upload>
  </template>
  <template v-else>
    <div class="wf-item-value-textarea" v-if="item.componentType === FormComponentTypeEnum.TEXT_AREA">
      {{ item.value }}
    </div>
    <div class="wf-item-value-view" v-else-if="item.componentType === FormComponentTypeEnum.SELECT">
      {{ getSelectLabel() }}
    </div>
    <div
      class="wf-item-value-view"
      v-else-if="item.componentType === FormComponentTypeEnum.MULTI_SELECT"
      :title="getMultiSelectLabel()"
    >
      {{ getMultiSelectLabel() }}
    </div>
    <div
      class="wf-item-value-view"
      v-else-if="item.componentType === FormComponentTypeEnum.DATE_TIME_RANGE && item.value"
    >
      <span
        >{{
          (item.valueConver as number[])[0] &&
          moment((item.valueConver as number[])[0]).format(
            item.dateTimeRange?.timeFormat === TimeFormatTypeEnum.DATE_TIME
              ? 'YYYY-MM-DD HH:mm'
              : item.dateTimeRange?.timeFormat === TimeFormatTypeEnum.DATE
              ? 'YYYY-MM-DD'
              : 'YYYY-MM-DD a'
          )
        }}
      </span>
      ~
      <span>{{
        (item.valueConver as number[])[1] &&
        moment((item.valueConver as number[])[1]).format(
          item.dateTimeRange?.timeFormat === TimeFormatTypeEnum.DATE_TIME
            ? 'YYYY-MM-DD HH:mm'
            : item.dateTimeRange?.timeFormat === TimeFormatTypeEnum.DATE
            ? 'YYYY-MM-DD'
            : 'YYYY-MM-DD a'
        )
      }}</span>
    </div>
    <div class="wf-item-value-view" v-else-if="item.componentType === FormComponentTypeEnum.DATE_TIME && item.value">
      {{
        moment(item.valueConver as number).format(
          item.dateTime?.timeFormat === TimeFormatTypeEnum.DATE_TIME
            ? 'YYYY-MM-DD HH:mm'
            : item.dateTime?.timeFormat === TimeFormatTypeEnum.DATE
            ? 'YYYY-MM-DD'
            : 'YYYY-MM-DD a'
        )
      }}
    </div>
    <form-upload
      v-else-if="
        item.componentType === FormComponentTypeEnum.FILE ||
        item.componentType === FormComponentTypeEnum.VIDEO ||
        item.componentType === FormComponentTypeEnum.IMAGE
      "
      :item="item"
      :axios="axios"
      :tenantId="tenantId"
      :is-view="isView"
    ></form-upload>
    <form-subject-select
      v-else-if="
        item.componentType === FormComponentTypeEnum.EMPLOYEE || item.componentType === FormComponentTypeEnum.DEPARTMENT
      "
      :axios="axios"
      :tenantId="tenantId"
      :item="item"
      :is-view="isView"
    >
    </form-subject-select>
    <div class="wf-item-value-view" v-else :title="item.value">
      {{ item.value }}
    </div>
  </template>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { ElInput, ElInputNumber, ElSelect, ElOption, ElDatePicker } from 'element-plus';
import FormWidgetInstance from '../models/FormWidgetInstance_local';
import { FormComponentTypeEnum } from '../../../models/FormComponentTypeEnum';
import FormSubjectSelect from './form-subject-select.vue';
import FormUpload from './form-upload.vue';
import moment from 'moment';
import { TimeFormatTypeEnum } from '../../../models/TimeFormatTypeEnum';
import { FormFieldPermissionEnum } from '../../../models/FormFieldPermissionEnum';
const props = defineProps<{
  item: FormWidgetInstance;
  tenantId: string;
  axios: any;
  //是否是查看模式
  isView?: boolean;
}>();
onMounted(() => {});
/*****************************日期选择 start******************************** */
/**
 * 日期选择绑定值转换
 * @param $event 选中的值
 * @param item 表单的控件项
 */
const dateTimeChange = ($event: Date, item: FormWidgetInstance) => {
  if ($event) {
    item.valueConver = $event;
    item.value = $event.getTime() + '';
  } else {
    item.valueConver = null;
    item.value = '';
  }
};
/**
 * 日期范围选择绑定值转换
 * @param $event 选中的值
 * @param item 表单的控件项
 */
const dateTimeRangeChange = ($event: Date[], item: FormWidgetInstance) => {
  if ($event) {
    item.valueConver = $event;
    item.valueConverTime =
      Math.round(
        moment($event[1].getTime()).diff(
          moment($event[0].getTime()),
          item.dateTimeRange?.timeFormat === TimeFormatTypeEnum.DATE_TIME ? 'hours' : 'days',
          true
        ) * 100
      ) / 100;
    item.value = $event[0].getTime() + ',' + $event[1].getTime() + ',' + item.valueConverTime;
  } else {
    item.valueConver = null;
    item.valueConverTime = null;
    item.value = '';
  }
};
/*****************************日期选择 end******************************** */

/*****************************多选框 start******************************** */
const getSelectLabel = () => {
  return props.item.select?.items?.find((it) => it.value === props.item.value)?.label || '';
};
const getMultiSelectLabel = () => {
  let labs = (props.item.valueConver as string[]).map((val) => {
    return props.item.multiSelect?.items?.find((it) => it.value === val)?.label || '';
  });
  return labs.join(',');
};
/**
 * 下拉多选框绑定值的转换
 * @param value 选中的值
 */
const multipleChange = (value: string[]) => {
  props.item.valueConver = value;
  props.item.value = value.join(',');
};
/*****************************多选框 end******************************** */
</script>
<style scoped lang="less">
.wf-item-value-noborder {
  :deep {
    .te-input__wrapper,
    .te-textarea__inner {
      box-shadow: none;
    }
  }
}
.wf-item-value-view {
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-height: 18px;
  overflow: hidden;
  word-break: break-all;
}
.wf-item-value-textarea {
  max-height: 200px;
  overflow: auto;
  word-break: break-all;
}
</style>
