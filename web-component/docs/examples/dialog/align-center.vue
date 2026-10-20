<template>
  <te-button text @click="centerDialogVisible = true">
    Click to open the Dialog
  </te-button>

  <te-dialog
    v-model="centerDialogVisible"
    title="Warning"
    width="30%"
    align-center
  >
    <span>Open the dialog from the center from the screen</span>
    <template #footer>
      <span class="dialog-footer">
        <te-button @click="centerDialogVisible = false">Cancel</te-button>
        <te-button type="primary" @click="centerDialogVisible = false">
          Confirm
        </te-button>
      </span>
    </template>
  </te-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const centerDialogVisible = ref(false)
</script>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
