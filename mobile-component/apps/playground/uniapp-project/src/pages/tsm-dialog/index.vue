<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Dialog 对话框</text>
        <text class="subtitle">用于消息提示、确认等场景，支持多种类型</text>
      </view>

      <view class="demo-card">
        <text class="section-title">类型</text>
        <view class="demo-list">
          <view class="demo-row" @click="openDialog('default')">
            <view class="demo-row-content">
              <view class="demo-row-icon default">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">默认提示</text>
                <text class="demo-row-subtitle">用于一般性消息提示</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="openDialog('success')">
            <view class="demo-row-content">
              <view class="demo-row-icon success">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">成功提示</text>
                <text class="demo-row-subtitle">操作成功完成后的反馈</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="openDialog('warning')">
            <view class="demo-row-content">
              <view class="demo-row-icon warning">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">警告提示</text>
                <text class="demo-row-subtitle">需要用户特别注意的信息</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="openDialog('danger')">
            <view class="demo-row-content">
              <view class="demo-row-icon danger">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">危险操作</text>
                <text class="demo-row-subtitle">不可逆操作，需谨慎确认</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">场景</text>
        <view class="demo-list">
          <view class="demo-row" @click="showSingleBtn">
            <view class="demo-row-content">
              <view class="demo-row-icon info">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">单个按钮</text>
                <text class="demo-row-subtitle">仅需确认的提示</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showCustomize">
            <view class="demo-row-content">
              <view class="demo-row-icon primary">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">完全自定义</text>
                <text class="demo-row-subtitle">自定义内容区域</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showSlotContent">
            <view class="demo-row-content">
              <view class="demo-row-icon success">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">插槽内容</text>
                <text class="demo-row-subtitle">使用具名插槽自定义内容</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">方法调用</text>
        <view class="demo-list">
          <view class="demo-row" @click="showViaRef">
            <view class="demo-row-content">
              <view class="demo-row-icon primary">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">show() 调用</text>
                <text class="demo-row-subtitle">配合 v-model:visible 控制开关</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
        </view>
      </view>

      <tsm-dialog v-model:visible="dialogVisible" ref="dialogRef" @confirm="onConfirm" @cancel="onCancel">
        <template v-if="dialogState.type === 'customize'" #header-content>
          <view class="customize-content">
            <icon-box class="customize-icon" />
            <text class="customize-title">自定义内容</text>
            <text class="customize-desc">通过 header-content 插槽完全自定义内容区域</text>
            <view class="customize-form">
              <view class="customize-form-item">
                <text class="customize-form-label">姓名</text>
                <view class="customize-form-input">请输入</view>
              </view>
            </view>
          </view>
        </template>
        <template v-if="dialogState.useSlot" #content>
          <view class="slot-content">
            <icon-box class="slot-icon" />
            <text class="slot-title">积分兑换成功</text>
            <view class="slot-cards">
              <view class="slot-card">
                <text class="slot-card-label">消耗积分</text>
                <text class="slot-card-value">-500</text>
              </view>
              <view class="slot-card">
                <text class="slot-card-label">兑换商品</text>
                <text class="slot-card-value">马克杯 x1</text>
              </view>
            </view>
          </view>
        </template>
      </tsm-dialog>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

interface DialogState {
  type: 'default' | 'success' | 'danger' | 'warning' | 'customize';
  title: string;
  content: string;
  confirmText: string;
  cancelText: string;
  showConfirmButton: boolean;
  showCancelButton: boolean;
  useSlot?: boolean;
}

const dialogRef = ref<any>(null);
const dialogVisible = ref(false);

const dialogState = reactive<DialogState>({
  type: 'default',
  title: '',
  content: '',
  confirmText: '确认',
  cancelText: '取消',
  showConfirmButton: true,
  showCancelButton: true,
});

const dialogConfig = {
  default: { title: '提示', content: '您确定要继续此操作吗？' },
  success: { title: '操作成功', content: '您的请求已成功处理，数据已更新。' },
  warning: { title: '安全警告', content: '此操作可能存在风险，请仔细核对信息。' },
  danger: { title: '危险操作', content: '删除后数据将无法恢复，请确认是否继续？' },
};

const openDialog = (type: 'default' | 'success' | 'danger' | 'warning') => {
  dialogState.type = type;
  dialogRef.value.show({
    type,
    ...dialogConfig[type],
    confirmText: '确认',
    cancelText: '取消',
  });
};

const showSingleBtn = () => {
  dialogState.type = 'default';
  dialogRef.value.show({
    type: 'default',
    title: '温馨提示',
    content: '您的会员已于今日到期，续费可继续享受专属权益。',
    confirmText: '立即续费',
    showCancelButton: false,
  });
};

const showCustomize = () => {
  dialogState.type = 'customize';
  dialogState.useSlot = false;
  dialogRef.value.show({
    type: 'customize',
  });
};

const showSlotContent = () => {
  dialogState.type = 'default';
  dialogState.useSlot = true;
  dialogRef.value.show({
    type: 'default',
    title: '积分兑换',
    confirmText: '确定',
  });
};

const showViaRef = () => {
  dialogRef.value.show({
    type: 'success',
    title: '方法调用成功',
    content: '通过 ref.show() 方法直接传入配置打开对话框',
    confirmText: '知道了',
    showCancelButton: false,
  });
};

const onConfirm = () => {
  uni.showToast({ title: '已确认', icon: 'success' });
};

const onCancel = () => {
  console.log('已取消');
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 16px;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  padding: 12px 12px 6px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.subtitle {
  margin-top: 10px;
  font-size: 22px;
  color: #6b7280;
  text-align: center;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 18px 16px 14px;
  margin-bottom: 14px;
  overflow: hidden;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 14px;
  color: #111827;
}

.demo-list {
  border-radius: 12px;
  overflow: hidden;
}

.demo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
  border-bottom: 1px solid #eef2f7;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f7f8fa;
  }

  .demo-row-content {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .demo-row-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: var(--tsm-radius-l);
    margin-right: var(--tsm-spacing-m);

    :deep(.icon) {
      font-size: 28px;
    }

    &.default {
      background: var(--tsm-color-primary-light);
      :deep(.icon) {
        color: var(--tsm-color-primary);
      }
    }

    &.success {
      background: var(--tsm-color-success-light);
      :deep(.icon) {
        color: var(--tsm-color-success);
      }
    }

    &.warning {
      background: var(--tsm-color-warning-light);
      :deep(.icon) {
        color: var(--tsm-color-warning);
      }
    }

    &.danger {
      background: var(--tsm-color-danger-light);
      :deep(.icon) {
        color: var(--tsm-color-danger);
      }
    }

    &.info {
      background: var(--tsm-color-primary-light);
      :deep(.icon) {
        color: var(--tsm-color-primary);
      }
    }

    &.primary {
      background: var(--tsm-color-primary-light);
      :deep(.icon) {
        color: var(--tsm-color-primary);
      }
    }
  }

  .demo-row-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .demo-row-title {
    font-size: var(--tsm-font-size-text-l);
    font-weight: var(--tsm-font-weight-medium);
    color: var(--tsm-color-text-primary);
    margin-bottom: 4px;
  }

  .demo-row-subtitle {
    font-size: var(--tsm-font-size-text-s);
    color: var(--tsm-color-text-secondary);
  }

  .demo-row-arrow {
    font-size: 28px;
    color: var(--tsm-color-text-placeholder);
    margin-left: var(--tsm-spacing-m);
  }
}

.customize-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--tsm-spacing-2xl) var(--tsm-spacing-xl) var(--tsm-spacing-xl);

  .customize-icon {
    font-size: 80px;
    color: var(--tsm-color-success);
    margin-bottom: var(--tsm-spacing-m);
  }

  .customize-title {
    font-size: var(--tsm-font-size-text-xl);
    font-weight: var(--tsm-font-weight-bold);
    color: var(--tsm-color-text-primary);
    margin-bottom: var(--tsm-spacing-xs);
  }

  .customize-desc {
    font-size: var(--tsm-font-size-text-m);
    color: var(--tsm-color-text-secondary);
    text-align: center;
    margin-bottom: var(--tsm-spacing-xl);
  }

  .customize-form {
    width: 100%;

    .customize-form-item {
      display: flex;
      align-items: center;
      padding: var(--tsm-spacing-m) 0;
      border-bottom: 1px solid var(--tsm-color-border-light);

      .customize-form-label {
        width: 80px;
        font-size: var(--tsm-font-size-text-m);
        color: var(--tsm-color-text-secondary);
      }

      .customize-form-input {
        flex: 1;
        font-size: var(--tsm-font-size-text-m);
        color: var(--tsm-color-text-placeholder);
      }
    }
  }
}

.slot-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--tsm-spacing-xl) var(--tsm-spacing-xl) var(--tsm-spacing-l);

  .slot-icon {
    font-size: 64px;
    color: var(--tsm-color-success);
    margin-bottom: var(--tsm-spacing-m);
  }

  .slot-title {
    font-size: var(--tsm-font-size-text-xl);
    font-weight: var(--tsm-font-weight-bold);
    color: var(--tsm-color-text-primary);
    margin-bottom: var(--tsm-spacing-l);
  }

  .slot-cards {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--tsm-spacing-m);
  }

  .slot-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--tsm-spacing-m);
    background: var(--tsm-color-bg-page);
    border-radius: var(--tsm-radius-m);

    .slot-card-label {
      font-size: var(--tsm-font-size-text-m);
      color: var(--tsm-color-text-secondary);
    }

    .slot-card-value {
      font-size: var(--tsm-font-size-text-m);
      font-weight: var(--tsm-font-weight-medium);
      color: var(--tsm-color-text-primary);
    }
  }
}
</style>
