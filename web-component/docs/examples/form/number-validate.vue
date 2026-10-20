<template>
  <te-form
    ref="formRef"
    :model="numberValidateForm"
    label-width="100px"
    class="demo-ruleForm"
  >
    <te-form-item
      label="age"
      prop="age"
      :rules="[
        { required: true, message: 'age is required' },
        { type: 'number', message: 'age must be a number' },
      ]"
    >
      <te-input
        v-model.number="numberValidateForm.age"
        type="text"
        autocomplete="off"
      />
    </te-form-item>
    <te-form-item>
      <te-button type="primary" @click="submitForm(formRef)">Submit</te-button>
      <te-button @click="resetForm(formRef)">Reset</te-button>
    </te-form-item>
  </te-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance } from '@tiansu/element-plus'

const formRef = ref<FormInstance>()

const numberValidateForm = reactive({
  age: '',
})

const submitForm = (formTe: FormInstance | undefined) => {
  if (!formTe) return
  formTe.validate((valid) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!')
      return false
    }
  })
}

const resetForm = (formTe: FormInstance | undefined) => {
  if (!formTe) return
  formTe.resetFields()
}
</script>
