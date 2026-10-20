<template>
  <te-popover
    placement="top-start"
    title="Title"
    :width="200"
    trigger="hover"
    content="this is content, this is content, this is content"
  >
    <template #reference>
      <te-button class="m-2">Hover to activate</te-button>
    </template>
  </te-popover>

  <te-popover
    placement="bottom"
    title="Title"
    :width="200"
    trigger="click"
    content="this is content, this is content, this is content"
  >
    <template #reference>
      <te-button class="m-2">Click to activate</te-button>
    </template>
  </te-popover>

  <te-popover
    ref="popover"
    placement="right"
    title="Title"
    :width="200"
    trigger="focus"
    content="this is content, this is content, this is content"
  >
    <template #reference>
      <te-button class="m-2">Focus to activate</te-button>
    </template>
  </te-popover>

  <te-popover
    ref="popover"
    title="Title"
    :width="200"
    trigger="contextmenu"
    content="this is content, this is content, this is content"
  >
    <template #reference>
      <te-button class="m-2">contextmenu to activate</te-button>
    </template>
  </te-popover>

  <te-popover
    :visible="visible"
    placement="bottom"
    title="Title"
    :width="200"
    content="this is content, this is content, this is content"
  >
    <template #reference>
      <te-button class="m-2" @click="visible = !visible"
        >Manual to activate</te-button
      >
    </template>
  </te-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
</script>

<style scoped>
.te-button + .te-button {
  margin-left: 8px;
}
</style>
