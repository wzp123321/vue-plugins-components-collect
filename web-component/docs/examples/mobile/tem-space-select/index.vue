<template>
  <view class="container">
    <uni-section title="单选" type="line" padding>
      <div @click="spaceRef.open()">点击打开</div>
      <tem-space-select
        ref="spaceRef"
        v-model="value"
        :http="http"
        tenant-id="700"
        hide-from-level="room"
      />
    </uni-section>

    <uni-section title="多选" type="line" padding>
      <div @click="spaceRef2.open()">点击打开</div>
      <tem-space-select
        ref="spaceRef2"
        v-model="multipleValue"
        multiple
        :http="http"
        tenant-id="700"
        :allow-select-all-levels="{
          floor: true,
          floorPart: true,
          room: true,
          roomPart: true,
        }"
      />
    </uni-section>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import { TemSpaceSelect } from '@tiansu/ts-mobile-package';
// import UniSection from '@tiansu/ts-mobile-package/uni-section/components/uni-section/uni-section.vue';
// import Request from 'luch-request';

const http = new Request({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
const spaceRef = ref<InstanceType<typeof TemSpaceSelect>>();
const spaceRef2 = ref<InstanceType<typeof TemSpaceSelect>>();
const value = ref<{ id: string; name?: string }[]>();
const multipleValue = ref<{ id: string; name?: string }[]>([]);
</script>

<style lang="scss"></style>
