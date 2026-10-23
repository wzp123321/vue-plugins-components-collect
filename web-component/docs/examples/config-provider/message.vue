<template>
  <div>
    <te-config-provider :message="config">
      <te-button @click="open">OPEN</el-button>
    </el-config-provider>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
const config = reactive({
  max: 3,
})
const open = () => {
  ElMessage('This is a message.')
}
</script>
