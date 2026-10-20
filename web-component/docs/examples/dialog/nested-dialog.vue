<template>
  <te-button text @click="outerVisible = true">
    open the outer Dialog
  </te-button>

  <te-dialog v-model="outerVisible" title="Outer Dialog">
    <template #default>
      <te-dialog
        v-model="innerVisible"
        width="30%"
        title="Inner Dialog"
        append-to-body
      />
    </template>
    <template #footer>
      <div class="dialog-footer">
        <te-button @click="outerVisible = false">Cancel</te-button>
        <te-button type="primary" @click="innerVisible = true">
          open the inner Dialog
        </te-button>
      </div>
    </template>
  </te-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const outerVisible = ref(false)
const innerVisible = ref(false)
</script>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
