<template>
  <te-badge :value="200" :max="99" class="item">
    <te-button>comments</te-button>
  </te-badge>
  <te-badge :value="100" :max="10" class="item">
    <te-button>replies</te-button>
  </te-badge>
</template>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 40px;
}
</style>
