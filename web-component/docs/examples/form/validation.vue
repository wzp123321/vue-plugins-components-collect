<template>
  <te-form
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="rules"
    label-width="120px"
    class="demo-ruleForm"
    :size="formSize"
    status-icon
  >
    <te-form-item label="Activity name" prop="name">
      <te-input v-model="ruleForm.name" />
    </te-form-item>
    <te-form-item label="Activity zone" prop="region">
      <te-select v-model="ruleForm.region" placeholder="Activity zone">
        <te-option label="Zone one" value="shanghai" />
        <te-option label="Zone two" value="beijing" />
      </te-select>
    </te-form-item>
    <te-form-item label="Activity count" prop="count">
      <te-select-v2
        v-model="ruleForm.count"
        placeholder="Activity count"
        :options="options"
      />
    </te-form-item>
    <te-form-item label="Activity time" required>
      <te-col :span="11">
        <te-form-item prop="date1">
          <te-date-picker
            v-model="ruleForm.date1"
            type="date"
            label="Pick a date"
            placeholder="Pick a date"
            style="width: 100%"
          />
        </te-form-item>
      </te-col>
      <te-col class="text-center" :span="2">
        <span class="text-gray-500">-</span>
      </te-col>
      <te-col :span="11">
        <te-form-item prop="date2">
          <te-time-picker
            v-model="ruleForm.date2"
            label="Pick a time"
            placeholder="Pick a time"
            style="width: 100%"
          />
        </te-form-item>
      </te-col>
    </te-form-item>
    <te-form-item label="Instant delivery" prop="delivery">
      <te-switch v-model="ruleForm.delivery" />
    </te-form-item>
    <te-form-item label="Activity type" prop="type">
      <te-checkbox-group v-model="ruleForm.type">
        <te-checkbox label="Online activities" name="type" />
        <te-checkbox label="Promotion activities" name="type" />
        <te-checkbox label="Offline activities" name="type" />
        <te-checkbox label="Simple brand exposure" name="type" />
      </te-checkbox-group>
    </te-form-item>
    <te-form-item label="Resources" prop="resource">
      <te-radio-group v-model="ruleForm.resource">
        <te-radio label="Sponsorship" />
        <te-radio label="Venue" />
      </te-radio-group>
    </te-form-item>
    <te-form-item label="Activity form" prop="desc">
      <te-input v-model="ruleForm.desc" type="textarea" />
    </te-form-item>
    <te-form-item>
      <te-button type="primary" @click="submitForm(ruleFormRef)">
        Create
      </te-button>
      <te-button @click="resetForm(ruleFormRef)">Reset</te-button>
    </te-form-item>
  </te-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from '@tiansu/element-plus'

const formSize = ref('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive({
  name: 'Hello',
  region: '',
  count: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

const rules = reactive<FormRules>({
  name: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
  region: [
    {
      required: true,
      message: 'Please select Activity zone',
      trigger: 'change',
    },
  ],
  count: [
    {
      required: true,
      message: 'Please select Activity count',
      trigger: 'change',
    },
  ],
  date1: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a date',
      trigger: 'change',
    },
  ],
  date2: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a time',
      trigger: 'change',
    },
  ],
  type: [
    {
      type: 'array',
      required: true,
      message: 'Please select at least one activity type',
      trigger: 'change',
    },
  ],
  resource: [
    {
      required: true,
      message: 'Please select activity resource',
      trigger: 'change',
    },
  ],
  desc: [
    { required: true, message: 'Please input activity form', trigger: 'blur' },
  ],
})

const submitForm = async (formTe: FormInstance | undefined) => {
  if (!formTe) return
  await formTe.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formTe: FormInstance | undefined) => {
  if (!formTe) return
  formTe.resetFields()
}

const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`,
}))
</script>
