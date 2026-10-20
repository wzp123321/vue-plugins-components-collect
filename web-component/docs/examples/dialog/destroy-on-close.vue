<template>
  <te-button text @click="centerDialogVisible = true">
    Click to open Dialog
  </te-button>

  <te-dialog
    v-model="centerDialogVisible"
    title="Notice"
    width="30%"
    destroy-on-close
    center
  >
    <span>
      Notice: before dialog gets opened for the first time this node and the one
      bellow will not be rendered
    </span>
    <div>
      <strong>Extra content (Not rendered)</strong>
    </div>
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
