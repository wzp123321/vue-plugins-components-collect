<!-- 人员，部门选择 -->
<template>
  <div
    class="wf-item-value-employee"
    :class="{ 'wf-item-value-employee-disabled': item.permission === FormFieldPermissionEnum.READ_ONLY && !isView }"
    @click="item.permission !== FormFieldPermissionEnum.READ_ONLY && !isView && (empVis = true)"
  >
    <te-tag
      class="wf-item-value-employee-tag"
      v-for="(subject, index) in item.selectedSubjects?.slice(0, 3)"
      :key="index"
      type="info"
      :closable="item.permission !== FormFieldPermissionEnum.READ_ONLY && !isView"
      :title="subject.name"
      v-if="item.selectedSubjects && item.selectedSubjects.length > 0"
      @close="() => removeSubject(item, subject)"
    >
      {{ subject.name }}
    </te-tag>
    <te-text type="info" v-else>请选择</te-text>
    <te-popover
      v-if="item.selectedSubjects && item.selectedSubjects.length > 3"
      placement="bottom"
      :width="850"
      trigger="hover"
      popper-class="wf-item-value-employee-popover"
    >
      <template #reference>
        <te-tag type="info">
          {{ '+ ' + (item.selectedSubjects.length - 3) }}
        </te-tag>
      </template>
      <template #default>
        <div class="wf-item-value-employee-popcontent">
          <te-tag
            class="wf-item-value-employee-poptag"
            v-for="(subject, index) in item.selectedSubjects?.slice(3)"
            :key="index"
            type="info"
            :closable="item.permission !== FormFieldPermissionEnum.READ_ONLY && !isView"
            @close="() => removeSubject(item, subject)"
            >{{ subject.name }}
          </te-tag>
        </div>
      </template>
    </te-popover>
  </div>
  <te-employee
    v-if="item.componentType === FormComponentTypeEnum.EMPLOYEE && !isView"
    v-model:visible="empVis"
    :selected="item.selectedSubjects"
    :axiosInstance="axios"
    :tenantId="tenantId"
    :multiple="true"
    :multiple-limit="item.employee?.maxNumber || 100"
    @update:selected="subjectSelectChange($event, item)"
  ></te-employee>
  <te-department
    v-if="item.componentType === FormComponentTypeEnum.DEPARTMENT && !isView"
    v-model:visible="empVis"
    :selected="item.selectedSubjects"
    :axiosInstance="axios"
    :tenantId="tenantId"
    :multiple="true"
    :multiple-limit="item.department?.maxNumber || 50"
    @update:selected="subjectSelectChange($event, item)"
  ></te-department>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TeTag, TeText, TePopover } from '@tiansu/element-plus';
import { TeEmployee } from '../../../te-employee';
import { TeDepartment } from '../../../te-department';
import FormWidgetInstance from '../models/FormWidgetInstance_local';
import { FormComponentTypeEnum } from '../../../models/FormComponentTypeEnum';
import { FormFieldPermissionEnum } from '../../../models/FormFieldPermissionEnum';
defineProps<{ item: FormWidgetInstance; tenantId: string; axios: any; isView?: boolean }>();
onMounted(() => {});
const empVis = ref(false);
/*****************************员工、部门选择 start******************************** */
/**
 * 选人组件选中人员点击确认按钮时触发
 * @param value 选中的人员
 */
const subjectSelectChange = (value: { id: string; name: string }[], item: FormWidgetInstance) => {
  item.selectedSubjects = value;
  item.value = value ? value.map((item) => item.id).join(',') : '';
};
/**
 * 移除选中的员工/部门
 * @param item 表单对象
 * @param subject 员工对象
 */
const removeSubject = (item: FormWidgetInstance, subject: { id: string; name: string }) => {
  item.selectedSubjects = item.selectedSubjects?.filter((tmp) => tmp.id !== subject.id);
  item.value = item.selectedSubjects ? item.selectedSubjects.map((item) => item.id).join(',') : '';
};
/*****************************员工、部门 end******************************** */
</script>
<style scoped lang="less">
.wf-item-value-employee {
  display: flex;
  align-items: center;
  overflow: hidden;
  height: 36px;
  &-tag {
    flex: 0 1 auto;
    overflow: hidden;
    margin-right: 5px;
    min-width: 72px;
    :deep(> span) {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  &-disabled {
    background-color: var(--te-disabled-bg-color);
  }
}

.wf-item-value-employee-poptag {
  margin-right: 5px;
  margin-bottom: 5px;
}
.wf-item-value-employee-popcontent {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
