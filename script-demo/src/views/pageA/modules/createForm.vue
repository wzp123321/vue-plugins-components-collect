<template>
  <div class="page-a-create-form">
    <te-form ref="ruleFormRef" :model="formData" label-width="100px">
      <te-row :gutter="10">
        <te-col :span="12">
          <te-form-item label="示例字段">
            <te-row style="width: 100%">
              <te-col :span="10">
                <select-area
                  style="padding-right: 10px"
                  v-model="formData.id"
                  :level="4"
                ></select-area>
              </te-col>
            </te-row>
          </te-form-item>
        </te-col>
      </te-row>
    </te-form>
  </div>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es';
import { ref } from 'vue';
import { DEFAULT_FORM_DATA } from '../constant';

const formData = ref(cloneDeep(DEFAULT_FORM_DATA));
</script>

<style lang="scss" scoped>
.xxx-container {
  width: 100%;
  height: 100%;
}
</style>
