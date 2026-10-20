<template>
  <te-button text @click="open">Click to open Message Box</te-button>
</template>

<script lang="ts" setup>
import { TeMessage, TeMessageBox } from '@tiansu/element-plus'
import type { Action } from '@tiansu/element-plus'
const open = () => {
  TeMessageBox.confirm(
    'You have unsaved changes, save and proceed?',
    'Confirm',
    {
      distinguishCancelAndClose: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Discard Changes',
    }
  )
    .then(() => {
      TeMessage({
        type: 'info',
        message: 'Changes saved. Proceeding to a new route.',
      })
    })
    .catch((action: Action) => {
      TeMessage({
        type: 'info',
        message:
          action === 'cancel'
            ? 'Changes discarded. Proceeding to a new route.'
            : 'Stay in the current route',
      })
    })
}
</script>
