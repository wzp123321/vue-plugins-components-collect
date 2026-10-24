<template>
  <view class="container">
    <uni-section title="使用在任务详情页" type="line" padding>
      <tem-workflow-button
        :task-instance-id="123"
        :process-instance-id="123"
        :identity-type="['TODO']"
        :tenant-id="700"
        :http="http"
      />
    </uni-section>
    <uni-section title="使用在列表页面" type="line" padding>
      <tem-workflow-button
        :task-instance-id="123"
        :process-instance-id="123"
        :identity-type="['TODO']"
        :tenant-id="700"
        :http="http"
        use-scene="list"
      />
    </uni-section>
    <uni-section title="非流程按钮需要渲染（比如查看、编辑、删除）" type="line" padding>
      <tem-workflow-button
        :task-instance-id="123"
        :process-instance-id="123"
        :identity-type="['TODO']"
        :tenant-id="700"
        :http="http"
        use-scene="list"
        :extra-buttons="[
          { name: '查看', code: 'view', style: 'primary' },
        ]"
        :back-extra-buttons="[
          { name: '投诉', code: 'tousu', style: 'primary' },
          { name: '删除', code: 'delet', style: 'primary' },
        ]"
      />
    </uni-section>
    
  </view>
</template>

<script setup lang="ts">
// import { TemWorkflowButton } from '@zpackage/mobile-package';
// import UniSection from '@zpackage/mobile-package/uni-section/components/uni-section/uni-section.vue';
// import Request from 'luch-request';
const http = new Request({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
</script>