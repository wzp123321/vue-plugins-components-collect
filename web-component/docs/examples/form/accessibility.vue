<template>
  <te-form label-position="left" label-width="150px" style="max-width: 460px">
    <te-space fill>
      <te-alert type="info" show-icon :closable="false">
        <p>"Full Name" label is automatically attached to the input:</p>
      </el-alert>
      <te-form-item label="Full Name">
        <te-input v-model="formAccessibility.fullName" />
      </el-form-item>
    </te-space>
    <te-space fill>
      <te-alert type="info" show-icon :closable="false">
        <p>
          "Your Information" serves as a label for the group of inputs. <br />
          You must specify labels on the individal inputs. Placeholders are not
          replacements for using the "label" attribute.
        </p>
      </el-alert>
      <te-form-item label="Your Information">
        <te-row :gutter="20">
          <te-col :span="12">
            <te-input
              v-model="formAccessibility.firstName"
              label="First Name"
              placeholder="First Name"
            />
          </el-col>
          <te-col :span="12">
            <te-input
              v-model="formAccessibility.lastName"
              label="Last Name"
              placeholder="Last Name"
            />
          </el-col>
        </el-row>
      </el-form-item>
    </te-space>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const formAccessibility = reactive({
  fullName: '',
  firstName: '',
  lastName: '',
})
</script>
