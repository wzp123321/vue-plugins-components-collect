<template>
  <te-button text @click="dialogVisible = true">
    click to open the Dialog
  </te-button>

  <div>
    <p>Close dialog and the input will be focused</p>
    <te-input ref="inputRef" placeholder="Please input" />
  </div>

  <te-dialog
    v-model="dialogVisible"
    destroy-on-close
    title="Tips"
    width="30%"
    @close-auto-focus="handleCloseAutoFocus"
  >
    <span>This is a message</span>
    <te-divider />
    <te-input placeholder="Initially focused" />
    <template #footer>
      <span class="dialog-footer">
        <te-button @click="dialogVisible = false">Cancel</te-button>
        <te-button type="primary" @click="dialogVisible = false">
          Confirm
        </te-button>
      </span>
    </template>
  </te-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { TeInput } from '@tiansu/element-plus'

const dialogVisible = ref(false)
const inputRef = ref<InstanceType<typeof TeInput>>()

const handleCloseAutoFocus = () => {
  inputRef.value?.focus()
}
</script>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
