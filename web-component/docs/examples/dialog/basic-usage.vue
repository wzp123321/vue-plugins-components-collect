<template>
  <te-button text @click="dialogVisible = true">
    click to open the Dialog
  </te-button>

  <te-dialog
    v-model="dialogVisible"
    title="Tips"
    width="30%"
    :before-close="handleClose"
  >
    <span>This is a message</span>
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
import { TeMessageBox } from '@tiansu/element-plus'

const dialogVisible = ref(false)

const handleClose = (done: () => void) => {
  TeMessageBox.confirm('Are you sure to close this dialog?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}
</script>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
