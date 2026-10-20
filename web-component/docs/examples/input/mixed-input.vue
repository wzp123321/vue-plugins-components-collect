<template>
  <div>
    <te-input v-model="input1" placeholder="Please input">
      <template #prepend>Http://</template>
    </te-input>
  </div>
  <div class="mt-4">
    <te-input v-model="input2" placeholder="Please input">
      <template #append>.com</template>
    </te-input>
  </div>
  <div class="mt-4">
    <te-input
      v-model="input3"
      placeholder="Please input"
      class="input-with-select"
    >
      <template #prepend>
        <te-select v-model="select" placeholder="Select" style="width: 115px">
          <te-option label="Restaurant" value="1" />
          <te-option label="Order No." value="2" />
          <te-option label="Tel" value="3" />
        </te-select>
      </template>
      <template #append>
        <te-button :icon="Search" />
      </template>
    </te-input>
  </div>
  <div class="mt-4">
    <te-input
      v-model="input3"
      placeholder="Please input"
      class="input-with-select"
    >
      <template #prepend>
        <te-button :icon="Search" />
      </template>
      <template #append>
        <te-select v-model="select" placeholder="Select" style="width: 115px">
          <te-option label="Restaurant" value="1" />
          <te-option label="Order No." value="2" />
          <te-option label="Tel" value="3" />
        </te-select>
      </template>
    </te-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
const input1 = ref('')
const input2 = ref('')
const input3 = ref('')
const select = ref('')
</script>

<style>
.input-with-select .te-input-group__prepend {
  background-color: var(--te-fill-color-blank);
}
</style>
