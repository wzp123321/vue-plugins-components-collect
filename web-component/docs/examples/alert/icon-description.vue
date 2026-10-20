<template>
  <te-alert
    title="success alert"
    type="success"
    description="more text description"
    show-icon
  />
  <te-alert
    title="info alert"
    type="info"
    description="more text description"
    show-icon
  />
  <te-alert
    title="warning alert"
    type="warning"
    description="more text description"
    show-icon
  />
  <te-alert
    title="error alert"
    type="error"
    description="more text description"
    show-icon
  />
</template>
<style scoped>
.te-alert {
  margin: 20px 0 0;
}
.te-alert:first-child {
  margin: 0;
}
</style>
