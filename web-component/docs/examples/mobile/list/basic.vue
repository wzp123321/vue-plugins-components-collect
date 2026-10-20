<template>
  <view class="container">
    <uni-card :is-shadow="false" is-full>
      <text class="uni-h6"
        >列表组件可以在其中使用图标、略缩图或放置任何你想放的元素，使用场景如：导航菜单、列表、设置中心排版等</text
      >
    </uni-card>
    <uni-section title="基础用法" type="line">
      <tem-list>
        <tem-list-item title="列表文字" />
        <tem-list-item title="列表文字" rightText="右侧文字" />
        <tem-list-item
          title="列表文字"
          note="列表描述信息"
          rightText="右侧文字"
        />
      </tem-list>
    </uni-section>
    <uni-section title="禁用列表" type="line">
      <tem-list>
        <tem-list-item
          :disabled="true"
          title="列表禁用状态"
          rightText="右侧文字"
        />
        <tem-list-item
          :disabled="true"
          title="列表禁用状态"
          rightText="右侧文字"
        />
      </tem-list>
    </uni-section>
    <uni-section title="显示右侧箭头" type="line">
      <tem-list>
        <tem-list-item showArrow title="列表文字" />
        <tem-list-item showArrow title="列表文字" rightText="右侧文字" />
      </tem-list>
    </uni-section>
    <uni-section title="开启点击反馈" type="line">
      <tem-list>
        <tem-list-item title="弹窗提示" clickable @click="onClick" />
        <tem-list-item title="页面跳转" :to="`./chat`" @click="onClick" />
        <tem-list-item
          title="关闭当前页面打开新页面"
          showArrow
          link="redirectTo"
          to="./chat"
          @click="onClick"
        />
        <tem-list-item
          title="打开错误页面(查看控制台)"
          showArrow
          link="redirectTo"
          to="./chats"
          @click="onClick"
        />
      </tem-list>
    </uni-section>

    <uni-section title="不显示分隔线" type="line">
      <tem-list :border="false">
        <tem-list-item title="列表文字" />
        <tem-list-item
          :border="false"
          title="列表文字"
          note="列表描述信息"
          rightText="右侧文字"
        />
        <tem-list-item
          :border="false"
          title="列表文字"
          note="列表描述信息"
          rightText="右侧文字"
        />
      </tem-list>
    </uni-section>

    <uni-section title="分隔线通栏" type="line">
      <tem-list border-full>
        <tem-list-item title="列表文字" />
        <tem-list-item
          title="列表文字"
          note="列表描述信息"
          rightText="右侧文字"
        />
        <tem-list-item
          title="列表文字"
          note="列表描述信息"
          rightText="右侧文字"
        />
      </tem-list>
    </uni-section>

    <uni-section title="文字溢出隐藏" type="line">
      <tem-list>
        <tem-list-item
          ellipsis="1"
          title="超长文字显示一行,以下是测试文字以下是测试文字以下是测试文字以下是测试文字以下是测试文字以下是测试文字"
        />
        <tem-list-item
          ellipsis="2"
          title="超长文字显示二行,以下是测试文字以下是测试文字以下是测试文字以下是测试文字以下是测试文字以下是测试文字"
          rightText="二行显示"
        />
        <tem-list-item
          ellipsis="1"
          title="全部显示,以下是测试文字以下是测试文字以下是测试文字以下是测试文字以下是测试文字以下是测试文字"
          note="列表描述信息,下是测试文字,下是测试文字,下是测试文字,下是测试文字,下是测试文字,下是测试文字,下是测试文字"
          showArrow
          rightText="一行显示"
        />
        <tem-list-item
          title="全部显示,以下是测试文字以下是测试文字以下是测试文字以下是测试文字以下是测试文字以下是测试文字"
          showArrow
          rightText="全部"
        />
      </tem-list>
    </uni-section>

    <uni-section title="显示图标或图片" type="line">
      <tem-list>
        <tem-list-item
          :show-extra-icon="true"
          showArrow
          :extra-icon="extraIcon"
          title="列表左侧带扩展图标"
        />
        <tem-list-item
          title="列表左侧带略缩图"
          note="列表描述信息"
          showArrow
          thumb="/static/c1.png"
          thumb-size="sm"
          rightText="小图"
        />

        <tem-list-item
          title="列表左侧带略缩图"
          note="列表描述信息"
          showArrow
          thumb="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png"
          thumb-size="base"
          rightText="默认"
        />
        <tem-list-item
          title="列表左侧带略缩图"
          note="列表描述信息"
          showArrow
          thumb="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png"
          thumb-size="lg"
          rightText="大图"
        />
      </tem-list>
    </uni-section>

    <uni-section title="使用插槽" type="line">
      <tem-list>
        <tem-list-item>
          <template v-slot:body>
            <view class="slot-box">
              <text class="slot-text">使用 body 插槽</text>
            </view>
          </template>
        </tem-list-item>
        <tem-list-item title="自定义右侧插槽" note="列表描述信息" link>
          <template v-slot:footer>
            <image
              class="slot-image"
              src="/static/logo.png"
              mode="widthFix"
            ></image>
          </template>
        </tem-list-item>
        <tem-list-item>
          <template v-slot:header>
            <view class="slot-box">
              <image
                class="slot-image"
                src="/static/logo.png"
                mode="widthFix"
              ></image>
            </view>
          </template>
          <template v-slot:body>
            <text class="slot-box slot-text">自定义两侧插槽</text>
          </template>
          <template v-slot:footer>
            <image
              class="slot-image"
              src="/static/logo.png"
              mode="widthFix"
            ></image>
          </template>
        </tem-list-item>
      </tem-list>
    </uni-section>
  </view>
</template>

<script setup lang="ts">
// import { TemList, TemListItem } from '@tiansu/ts-mobile-package';
// import UniSection from '@tiansu/ts-mobile-package/uni-section/components/uni-section/uni-section.vue';
// import UniCard from '@tiansu/ts-mobile-package/uni-card/components/uni-card/uni-card.vue';

const extraIcon = {
  color: '#4cd964',
  size: '22',
  type: 'gear-filled',
};
const onClick = (e) => {
  console.log('执行click事件', e.data);
  uni.showToast({
    title: '点击反馈',
  });
};
const switchChange = (e) => {
  uni.showToast({
    title: 'change:' + e.value,
    icon: 'none',
  });
};
</script>

<style lang="scss">
.slot-box {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  align-items: center;
}

.slot-image {
  /* #ifndef APP-NVUE */
  display: block;
  /* #endif */
  margin-right: 10px;
  width: 30px;
  height: 30px;
}

.slot-text {
  flex: 1;
  font-size: 14px;
  color: #4cd964;
  margin-right: 10px;
}
</style>
