<template>
  <div class="demo-input-suffix">
    <te-row :gutter="20">
      <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
        >Using attributes</span
      >
      <te-input
        v-model="input1"
        class="w-50 m-2"
        placeholder="Pick a date"
        :suffix-icon="Calendar"
      />
      <te-input
        v-model="input2"
        class="w-50 m-2"
        placeholder="Type something"
        :prefix-icon="Search"
      />
    </te-row>
  </div>
  <div class="demo-input-suffix">
    <te-row :gutter="20">
      <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
        >Using slots</span
      >
      <te-input v-model="input3" class="w-50 m-2" placeholder="Pick a date">
        <template #suffix>
          <te-icon class="te-input__icon"><calendar /></te-icon>
        </template>
      </te-input>
      <te-input v-model="input4" class="w-50 m-2" placeholder="Type something">
        <template #prefix>
          <te-icon class="te-input__icon"><search /></te-icon>
        </template>
      </te-input>
    </te-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Calendar, Search } from '@element-plus/icons-vue'
const input1 = ref('')
const input2 = ref('')
const input3 = ref('')
const input4 = ref('')
</script>
