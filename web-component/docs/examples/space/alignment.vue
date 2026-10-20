<template>
  <div class="alignment-container">
    <te-space>
      string
      <te-button> button </te-button>
      <te-card>
        <template #header> header </template>
        body
      </te-card>
    </te-space>
  </div>
  <div class="alignment-container">
    <te-space alignment="flex-start">
      string
      <te-button> button </te-button>
      <te-card>
        <template #header> header </template>
        body
      </te-card>
    </te-space>
  </div>
  <div class="alignment-container">
    <te-space alignment="flex-end">
      string
      <te-button> button </te-button>
      <te-card>
        <template #header> header </template>
        body
      </te-card>
    </te-space>
  </div>
</template>

<style>
.alignment-container {
  width: 240px;
  margin-bottom: 20px;
  padding: 8px;
  border: 1px solid var(--te-border-color);
}
</style>
