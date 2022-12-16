<template>
  <div class="vueuse-useimage" id="vueuse-useimage">
    <span v-if="isLoading">Loading</span>
    <img v-else :src="avatarUrl" />
  </div>
</template>

<script lang="ts" setup>
import { useImage } from '@vueuse/core';

const avatarUrl = 'https://place.dog/300/200';
const { isLoading } = useImage({ src: avatarUrl });
</script>

<style scoped lang="less">
#vueuse-useimage {
  width: 100%;
  height: 100px;
}
</style>
