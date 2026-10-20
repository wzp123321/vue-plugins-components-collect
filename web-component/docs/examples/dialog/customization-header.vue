<template>
  <te-button @click="visible = true">
    Open Dialog with customized header
  </te-button>
  <te-dialog v-model="visible" :show-close="false">
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header">
        <h4 :id="titleId" :class="titleClass">This is a custom header!</h4>
        <te-button type="danger" @click="close">
          <te-icon class="te-icon--left"><CircleCloseFilled /></te-icon>
          Close
        </te-button>
      </div>
    </template>
    This is dialog content.
  </te-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { TeButton, TeDialog } from '@tiansu/element-plus'
import { CircleCloseFilled } from '@element-plus/icons-vue'

const visible = ref(false)
</script>

<style scoped>
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
