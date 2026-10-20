<template>
  <div :class="[isMobile() ? 'example-showcase-mobile' : 'example-showcase']">
    <ClientOnly>
      <div v-if="iframeComponentName?.length > 0" class="phone-frame">
        <iframe
          ref="iframeRef"
          scrolling="auto"
          frameborder="0"
          :src="exampleUrl()"
          border="0"
        >
        </iframe>
      </div>
      <component :is="demo" v-else-if="demo" v-bind="$attrs" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { isMobile } from '../../composables/lang';
import { ref } from 'vue';

const iframeRef = ref();
const props = defineProps({
  file: {
    type: String,
    required: true,
  },
  demo: {
    type: Object,
    required: false,
  },
  iframeComponentName: {
    type: String,
    required: false,
  },
});

const exampleUrl = () => {
  return `${
    process.env.NODE_ENV !== 'production'
      ? 'http://localhost:5173'
      : 'http://192.168.50.174:8080'
  }/pages/docs/${props.iframeComponentName}/index`;
};

onMounted(() => {
  // if (props.iframeComponentName) {
  //   // 创建一个新的请求头
  //   const userAgent =
  //     'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
  //   // 模拟移动端请求
  //   iframeRef.value.onload = () => {
  //     const iframeDoc = iframeRef.value.contentWindow.document;
  //     iframeDoc.open();
  //     iframeDoc.write(`
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <style>
  //         body {
  //           margin: 0;
  //           padding: 0;
  //           width: 100%;
  //           height: 100%;
  //         }
  //       </style>
  //     `);
  //     iframeDoc.close();
  //     iframeRef.value.contentWindow.navigator.__defineGetter__(
  //       'userAgent',
  //       () => userAgent,
  //     );
  //   };
  // }
});
</script>

<style lang="scss" scoped>
.example-showcase {
  padding: 1.5rem;
  margin: 0.5px;
  background-color: var(--bg-color);
}

.example-showcase-mobile {
  // background-image: url(/images/iPhone13.png);
  // width: 375px;
  // height: 667px;
  // background-size: 100%;
  // padding: 48px 25px 25px;
  // margin: auto;

  div {
    height: 100%;
    overflow: hidden;
  }

  .phone-frame {
    margin: auto;
    width: 375px;
    height: 667px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
  }
  .phone-frame::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 5px;
    background-color: #ccc;
    border-radius: 10px;
  }
  .phone-frame::after {
    content: '';
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 5px;
    background-color: #ccc;
    border-radius: 10px;
  }

  iframe {
    // width: calc(100% + 15px);
  }
}
</style>
