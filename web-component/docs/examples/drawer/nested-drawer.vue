<template>
  <te-button type="primary" style="margin-left: 16px" @click="drawer = true">
    open
  </te-button>

  <te-drawer v-model="drawer" title="I'm outer Drawer" size="50%">
    <div>
      <te-button @click="innerDrawer = true">Click me!</te-button>
      <te-drawer
        v-model="innerDrawer"
        title="I'm inner Drawer"
        :append-to-body="true"
        :before-close="handleClose"
      >
        <p>_(:зゝ∠)_</p>
      </te-drawer>
    </div>
  </te-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { TeMessageBox } from '@tiansu/element-plus'

const drawer = ref(false)
const innerDrawer = ref(false)

const handleClose = (done: () => void) => {
  TeMessageBox.confirm('You still have unsaved data, proceed?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}
</script>
