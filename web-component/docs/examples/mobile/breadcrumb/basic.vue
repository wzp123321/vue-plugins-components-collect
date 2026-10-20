<template>
  <tem-cell titleText="基础用法" layout="vertical" showContent>
    <template #content>
      <tem-breadcrumb
        separator="/"
        :options="routes"
        @onBreadcrumbItemClickEvent="
          (item) => {
            messageText = item.text;
            toastRef.showToast();
          }
        "
      >
      </tem-breadcrumb>
    </template>
  </tem-cell>
  <tem-cell titleText="自定义选项" layout="vertical" showContent>
    <template #content>
      <tem-breadcrumb separator="/" :options="routes">
        <template #default="{ scope }">
          <text style="margin-right: 10px">{{ scope.text }}</text>
        </template>
      </tem-breadcrumb>
    </template>
  </tem-cell>
  <tem-popup-toast ref="toastRef">{{ messageText }}</tem-popup-toast>
</template>

<script setup lang="ts">
// import {
//   TemBreadcrumb,
//   TemCell,
//   TemPopupToast,
// } from '@tiansu/ts-mobile-package';
import { ref } from 'vue';

const toastRef = ref();
const messageText = ref('');

const routes = [
  {
    to: '/A',
    text: 'A页面',
  },
  {
    to: '/B',
    text: 'B页面',
  },
  {
    to: '/C',
    text: 'C页面',
  },
];
</script>

<style lang="scss"></style>
