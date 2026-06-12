<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="title">Upload 上传组件测试</view>
      <view class="section">
        <view class="section-title">media类型上传</view>
        <tsm-upload
          type="media"
          v-model:fileList="mediaFileList"
          :maxCountImage="5"
          :maxCountVideo="1"
          :mediaTypes="['image', 'video']"
          :imageSourceType="['album', 'camera']"
          :videoSourceType="['camera']"
          :beforeUpload="beforeUpload"
          :httpRequest="httpRequest"
          @success="handleSuccess"
          @error="handleError"
          @remove="handleRemove"
        />
      </view>
      <view class="section">
        <view class="section-title">media只读态</view>
        <tsm-upload type="media" readonly v-model:fileList="mediaFileList" />
      </view>
      <view class="section">
        <view class="section-title">禁用状态</view>
        <tsm-upload type="media" v-model:fileList="mediaFileList2" :mediaTypes="['image', 'video']" :disabled="true" />
      </view>

      <view class="section">
        <view class="section-title">file类型上传</view>
        <tsm-upload
          type="file"
          v-model:fileList="fileFileList"
          :maxCountFile="4"
          :beforeUpload="beforeUpload"
          :httpRequest="httpRequest"
          @success="handleSuccess"
          @error="handleError"
          @remove="handleRemove"
        />
      </view>
      <view class="section">
        <view class="section-title">file类型只读</view>
        <tsm-upload type="file" readonly v-model:fileList="fileFileList" />
      </view>
      <view class="section">
        <view class="section-title">file类型禁用</view>
        <tsm-upload type="file" disabled v-model:fileList="fileFileList" />
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TsmUpload from '../../../../../../packages/components/ui/components/tsm-upload/uniapp/tsm-upload.vue';
const beforeUpload = (file: any) => {
  return new Promise<boolean>((resolve, reject) => {
    resolve(true);
  });
};
// 上传请求函数
const httpRequest = async (file: any) => {
  //模拟上传请求
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        url: file.url,
        name: file.name,
        size: file.size,
      });
      // reject({ errMsg: '上传失败1111' });
    }, 1000);
  });
};

// 媒体文件列表
const mediaFileList = ref([
  {
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    name: 'mov_bbb.mp4',
  },
  {
    url: '/src/static/1.mp4',
    name: '1.mp4',
  },
  {
    url: '/src/static/ge.jpeg',
    name: '3.mp4',
  },
  {
    url: 'https://picsum.photos/200/200?random=2&.png',
    name: '1.png',
  },
  {
    url: 'https://picsum.photos/200/200?random=3',
    name: '2.png',
  },
]);
const mediaFileList2 = ref([
  {
    url: 'https://picsum.photos/200/200?random=4',
    name: '3.png',
  },
  {
    url: 'https://picsum.photos/200/200?random=5',
    name: '4.png',
  },
  {
    url: 'https://picsum.photos/200/200?random=6',
    name: '5.png',
  },
  {
    url: 'https://picsum.photos/200/200?random=7',
    name: '6.png',
  },
]);

// 文件类型文件列表
const fileFileList = ref([
  {
    url: '',
    name: '4bjpHQ8j6kd1Su.pdf',
    size: 162176,
  },
  {
    url: '',
    name: '4bjpHQ8j6kd1Su.word',
    size: 162176,
  },
  {
    url: '',
    name: '4bjpHQ8j6kd1Su.csv',
  },
]);

// 处理上传成功
const handleSuccess = (res: any) => {
  console.log('上传成功:', res);
};

// 处理上传失败
const handleError = (err: any) => {
  console.log('上传失败:', err);
};

// 处理删除文件
const handleRemove = (index: number) => {
  console.log('删除文件:', index);
};
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  text-align: center;
}

.section {
  margin-bottom: 40rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
</style>
