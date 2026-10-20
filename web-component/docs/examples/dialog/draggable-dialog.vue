<template>
  <te-button text @click="dialogVisible = true">
    Click to open Dialog
  </te-button>

  <te-dialog v-model="dialogVisible" title="Tips" width="30%" draggable>
    <span>It's a draggable Dialog</span>
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

const dialogVisible = ref(false)
</script>
