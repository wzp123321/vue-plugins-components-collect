<template>
  <div class="affix-container">
    <te-affix target=".affix-container" :offset="80">
      <te-button type="primary">Target container</el-button>
    </te-affix>
  </div>
</template>
<style scoped>
.affix-container {
  text-align: center;
  height: 400px;
  border-radius: 4px;
  background: var(--te-color-primary-light-9);
}
</style>
