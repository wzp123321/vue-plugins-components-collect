<template>
  <te-alert title="unclosable alert" type="success" :closable="false" />
  <te-alert title="customized close-text" type="info" close-text="Gotcha" />
  <te-alert title="alert with callback" type="warning" @close="hello" />
</template>

<script lang="ts" setup>
const hello = () => {
  // eslint-disable-next-line no-alert
  alert('Hello World!')
}
</script>
<style scoped>
.te-alert {
  margin: 20px 0 0;
}
.te-alert:first-child {
  margin: 0;
}
</style>
