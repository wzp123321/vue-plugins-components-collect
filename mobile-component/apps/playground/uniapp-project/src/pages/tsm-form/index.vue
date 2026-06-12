<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Form 表单</text>
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">基本用例（验证规则）</text>
          <tsm-form ref="formRef" :model="formData" :rules="rules" scrollToFirstError="smooth">
            <tsm-form-item label="姓名" name="name">
              <tsm-input v-model="formData.name as string" placeholder="请输入姓名（必填）" />
            </tsm-form-item>

            <tsm-form-item label="邮箱" name="email" help="用于接收重要通知">
              <tsm-input v-model="formData.email as string" placeholder="blur时验证邮箱格式" />
            </tsm-form-item>

            <tsm-form-item label="手机号" name="phone" help="用于接收验证码">
              <tsm-input v-model="formData.phone as string" placeholder="change时验证手机号" />
            </tsm-form-item>

            <tsm-form-item label="城市" name="city" help="选择所在城市">
              <view class="picker-trigger" @click="pickerVisible.city = true">
                <text class="picker-value">{{ getCityLabel(formData.city) || '请选择城市' }}</text>
                <text class="picker-arrow">›</text>
              </view>
              <tsm-picker
                v-model:show="pickerVisible.city"
                v-model:value="formData.city as string"
                :options="cityOptions"
                title="选择城市"
              />
            </tsm-form-item>

            <tsm-form-item label="地区" name="region" help="选择省市区">
              <view class="picker-trigger" @click="pickerVisible.region = true">
                <text class="picker-value">{{ getRegionLabel(formData.region) || '请选择地区' }}</text>
                <text class="picker-arrow">›</text>
              </view>
              <tsm-cascader
                v-model:show="pickerVisible.region"
                v-model:value="formData.region as string"
                :options="regionOptions"
                title="选择地区"
              />
            </tsm-form-item>

            <tsm-form-item label="性别" name="gender" help="请选择性别">
              <tsm-radio-group v-model:value="formData.gender as string">
                <tsm-radio value="male">男</tsm-radio>
                <tsm-radio value="female">女</tsm-radio>
                <tsm-radio value="other">其他</tsm-radio>
              </tsm-radio-group>
            </tsm-form-item>

            <tsm-form-item label="密码" name="password" help="密码长度至少6位">
              <tsm-input v-model="formData.password as string" placeholder="请输入密码" />
            </tsm-form-item>

            <tsm-form-item label="确认密码" name="confirmPassword" help="需与密码一致">
              <tsm-input v-model="formData.confirmPassword as string" placeholder="请再次输入密码" />
            </tsm-form-item>

            <tsm-form-item label="验证码" name="verifyCode" help="6位数字验证码">
              <tsm-input v-model="formData.verifyCode as string" placeholder="change时验证6位数字" />
            </tsm-form-item>

            <tsm-form-item label="同意协议" name="agree" help="必须同意才能提交">
              <tsm-switch v-model:checked="formData.agree as boolean" checkedText="同意" unCheckedText="不同意" />
            </tsm-form-item>

            <tsm-form-item label="购买数量" name="quantity" help="最少购买1件">
              <tsm-stepper v-model="formData.quantity as number" :min="1" :max="99" />
            </tsm-form-item>

            <tsm-form-item label="附件上传" name="files">
              <tsm-upload
                type="file"
                v-model:fileList="formData.files"
                :httpRequest="mockUploadRequest"
                :maxCountFile="3"
                :maxSizeFile="10"
              />
            </tsm-form-item>
          </tsm-form>

          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="handleSubmit">提交验证</tsm-button>
            <tsm-button theme="default" size="s" @click="handleReset">重置</tsm-button>
            <tsm-button theme="default" size="s" @click="handleClearValidate">清除验证</tsm-button>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">只读模式</text>
          <tsm-form :model="readonlyFormData" readonly>
            <tsm-form-item label="姓名" name="readonlyName">
              <tsm-input v-model="readonlyFormData.readonlyName as string" />
            </tsm-form-item>

            <tsm-form-item label="邮箱" name="readonlyEmail">
              <tsm-input v-model="readonlyFormData.readonlyEmail as string" />
            </tsm-form-item>

            <tsm-form-item label="手机号" name="readonlyPhone">
              <tsm-input v-model="readonlyFormData.readonlyPhone as string" />
            </tsm-form-item>

            <tsm-form-item label="通知开关" name="readonlyNotify">
              <tsm-switch
                v-model:checked="readonlyFormData.readonlyNotify as boolean"
                checkedText="已开启"
                unCheckedText="已关闭"
              />
            </tsm-form-item>

            <tsm-form-item label="性别" name="readonlyGender">
              <tsm-radio-group v-model:value="readonlyFormData.readonlyGender as string">
                <tsm-radio value="male">男</tsm-radio>
                <tsm-radio value="female">女</tsm-radio>
              </tsm-radio-group>
            </tsm-form-item>

            <tsm-form-item label="购买数量" name="readonlyQuantity">
              <tsm-stepper v-model="readonlyFormData.readonlyQuantity as number" />
            </tsm-form-item>
          </tsm-form>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormRules } from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-form/uniapp/types';
import type { Trigger, CustomValidateResult } from '@/uni_modules/@tiansu/ts-mobile-ui/libs/uniapp/validators/types';
import type { PickerOption } from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-picker/uniapp/props';
import type { CascaderOption } from '@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-cascader/uniapp/props';

const formRef = ref();

const pickerVisible = reactive({
  city: false,
  region: false,
});

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  city: '',
  region: '',
  gender: '',
  password: '',
  confirmPassword: '',
  verifyCode: '',
  agree: false,
  quantity: 1,
  files: [] as { name: string; url: string; size?: number }[],
});

const cityOptions: PickerOption[] = [
  { label: '北京市', value: 'beijing' },
  { label: '上海市', value: 'shanghai' },
  { label: '广州市', value: 'guangzhou' },
  { label: '深圳市', value: 'shenzhen' },
  { label: '杭州市', value: 'hangzhou' },
  { label: '南京市', value: 'nanjing' },
  { label: '武汉市', value: 'wuhan' },
  { label: '成都市', value: 'chengdu' },
];

const regionOptions: CascaderOption[] = [
  {
    label: '广东省',
    value: 'guangdong',
    children: [
      {
        label: '广州市',
        value: 'guangzhou',
        children: [
          { label: '天河区', value: 'tianhe' },
          { label: '番禺区', value: 'panyu' },
          { label: '越秀区', value: 'yuexiu' },
        ],
      },
      {
        label: '深圳市',
        value: 'shenzhen',
        children: [
          { label: '南山区', value: 'nanshan' },
          { label: '福田区', value: 'futian' },
        ],
      },
    ],
  },
  {
    label: '江苏省',
    value: 'jiangsu',
    children: [
      {
        label: '南京市',
        value: 'nanjing',
        children: [
          { label: '玄武区', value: 'xuanwu' },
          { label: '鼓楼区', value: 'gulou' },
        ],
      },
    ],
  },
];

function getCityLabel(value: string): string {
  const option = cityOptions.find(opt => opt.value === value);
  return option?.label || '';
}

function getRegionLabel(value: string): string {
  if (!value) return '';
  function findLabel(options: CascaderOption[], targetValue: string, path: string[] = []): string[] | null {
    for (const opt of options) {
      if (opt.value === targetValue) {
        return [...path, opt.label];
      }
      if (opt.children) {
        const result = findLabel(opt.children, targetValue, [...path, opt.label]);
        if (result) return result;
      }
    }
    return null;
  }
  const labels = findLabel(regionOptions, value);
  return labels ? labels.join('-') : '';
}

function validatePasswordMatch(
  value: string,
  context?: { formData: Record<string, any>; name: string }
): CustomValidateResult {
  const password = context?.formData?.password || '';
  const result = value === password;
  return {
    result,
    message: result ? '' : '两次输入的密码不一致',
  };
}

const rules: FormRules = {
  name: [{ required: true, message: '姓名不能为空' }],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' as Trigger },
    { email: true, message: '请输入正确的邮箱格式', trigger: 'blur' as Trigger },
  ],
  phone: [
    { required: true, message: '手机号不能为空', trigger: 'change' as Trigger },
    { telnumber: true, message: '请输入正确的手机号', trigger: 'change' as Trigger },
  ],
  city: [{ required: true, message: '请选择城市' }],
  region: [{ required: true, message: '请选择地区' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' as Trigger }],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6位' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: ['blur', 'change'] as Trigger[] },
    { validator: validatePasswordMatch, message: '两次输入的密码不一致', trigger: ['blur', 'change'] as Trigger[] },
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'change' as Trigger },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'change' as Trigger },
  ],
  agree: [
    {
      validator: (value: boolean) => ({ result: value }),
      trigger: 'change' as Trigger,
      message: '请同意协议',
    },
  ],
  quantity: [
    { required: true, message: '请选择购买数量', trigger: 'change' as Trigger },
    {
      validator: (value: number) => ({ result: value >= 3, message: '最少购买3件' }),
      trigger: 'change' as Trigger,
    },
  ],
  files: [
    {
      validator: (value: any[]) => ({ result: value && value.length > 0 }),
      message: '请上传至少一个附件',
      trigger: 'change' as Trigger,
    },
  ],
};

// 模拟文件上传请求
async function mockUploadRequest(file: any): Promise<{ name: string; url: string; size?: number }> {
  // 模拟上传延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  // 返回模拟的文件信息
  return {
    name: file.name || 'uploaded-file',
    url: `https://mock-server.com/files/${Date.now()}`,
    size: file.size || 1024,
  };
}

const readonlyFormData = reactive({
  readonlyName: '张三',
  readonlyEmail: 'zhangsan@example.com',
  readonlyPhone: '13800138000',
  readonlyNotify: true,
  readonlyQuantity: 5,
  readonlyGender: 'male',
});

async function handleSubmit() {
  const result = await formRef.value?.submit();
  if (result === true) {
    console.log('验证通过 ✅');
    console.log('表单数据:', formData);
  } else {
    console.log('验证失败 ❌', result);
  }
}

function handleReset() {
  formRef.value?.reset();
  console.log('已重置表单');
}

function handleClearValidate() {
  formRef.value?.clearValidate();
  console.log('已清除验证结果');
}
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 12px;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
  display: block;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: block;
}

.demo-actions {
  display: flex;
  gap: 12px;
}

.picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
}

.picker-value {
  font-size: 16px;
  color: #333;
}

.picker-arrow {
  font-size: 20px;
  color: #999;
  margin-left: 8px;
}
</style>
