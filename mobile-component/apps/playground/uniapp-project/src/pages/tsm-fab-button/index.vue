<template>
  <tsm-theme-provider>
    <view class="container">
      <tsm-fab-button
        :title="title"
        :shape="shape"
        :state="state"
        :type="type"
        @click="uni.showToast({ title: 'fab button clicked' })"
      >
        <template v-if="showIcon" #icon>
          <svg
            v-if="type === 'secondary'"
            t="1776665672365"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5629"
            width="12"
            height="12"
          >
            <path
              d="M980.918297 554.852994 43.079656 554.852994c-23.657816 0-42.856064-19.197224-42.856064-42.8489 0-23.657816 19.198248-42.857087 42.856064-42.857087l937.838641 0c23.697725 0 42.859134 19.199271 42.859134 42.857087C1023.775384 535.655769 1004.616022 554.852994 980.918297 554.852994L980.918297 554.852994z"
              fill="#515151"
              p-id="5630"
            ></path>
            <path
              d="M469.147518 980.917786 469.147518 43.079144c0-23.657816 19.197224-42.856064 42.8489-42.856064 23.657816 0 42.856064 19.198248 42.856064 42.856064l0 937.838641c0 23.697725-19.199271 42.859134-42.856064 42.859134C488.344742 1023.774873 469.147518 1004.615511 469.147518 980.917786L469.147518 980.917786z"
              fill="#515151"
              p-id="5631"
            ></path>
          </svg>
          <svg
            v-else
            template="icon"
            t="1776665672365"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5629"
            width="12"
            height="12"
          >
            <path
              d="M980.918297 554.852994 43.079656 554.852994c-23.657816 0-42.856064-19.197224-42.856064-42.8489 0-23.657816 19.198248-42.857087 42.856064-42.857087l937.838641 0c23.697725 0 42.859134 19.199271 42.859134 42.857087C1023.775384 535.655769 1004.616022 554.852994 980.918297 554.852994L980.918297 554.852994z"
              fill="#ffffff"
              p-id="5630"
            ></path>
            <path
              d="M469.147518 980.917786 469.147518 43.079144c0-23.657816 19.197224-42.856064 42.8489-42.856064 23.657816 0 42.856064 19.198248 42.856064 42.856064l0 937.838641c0 23.697725-19.199271 42.859134-42.856064 42.859134C488.344742 1023.774873 469.147518 1004.615511 469.147518 980.917786L469.147518 980.917786z"
              fill="#ffffff"
              p-id="5631"
            ></path>
          </svg>
        </template>
      </tsm-fab-button>
      <text>Title</text>
      <view class="general">
        <button @click="onSetTitle">set title</button>
        <button @click="onResetTitle">reset title</button>
      </view>
      <text>Type</text>
      <view class="general">
        <button @click="onTypeToPrimary">primary</button>
        <button @click="onTypeTosecondary">secondary</button>
      </view>
      <text>State</text>
      <view class="general">
        <button @click="onStateToDefault">default</button>
        <button @click="onStateToDisabled">disabled</button>
      </view>
      <text>Shape</text>
      <view class="general">
        <button @click="onShapeToRectangle">rectangle</button>
        <button @click="onShapeToCircle">circle</button>
      </view>
      <text>slot icon</text>
      <view class="general">
        <button @click="onIconSlotAdd">add</button>
        <button @click="onIconSlotReset">reset</button>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const shape = ref();
const state = ref();
const type = ref();
const title = ref();

const onSetTitle = () => {
  title.value = '添加';
};

const onResetTitle = () => {
  title.value = null;
};

const onTypeToPrimary = () => {
  type.value = 'primary';
};

const onTypeTosecondary = () => {
  type.value = 'secondary';
};

const onStateToDefault = () => {
  state.value = 'default';
};

const onStateToDisabled = () => {
  state.value = 'disabled';
};

const onShapeToRectangle = () => {
  shape.value = 'rectangle';
};

const onShapeToCircle = () => {
  shape.value = 'circle';
};

const showIcon = ref(false);
const onIconSlotAdd = () => {
  showIcon.value = true;
};

const onIconSlotReset = () => {
  showIcon.value = false;
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.general {
  display: flex;
  flex-direction: row;
  gap: 5px;
}
</style>
