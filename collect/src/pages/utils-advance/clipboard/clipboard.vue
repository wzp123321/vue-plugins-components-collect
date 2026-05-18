<template>
  <div class="clipboard-page">
    <h5>剪贴板操作</h5>
    <p class="page-desc">
      浏览器提供了 <code>Clipboard API</code> 用于读写剪贴板，需要 HTTPS 环境或 localhost。
      旧版兼容方式使用 <code>document.execCommand('copy')</code>。
    </p>

    <!-- 复制演示 -->
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>📋 复制到剪贴板</span>
              <el-tag :type="copySupported ? 'success' : 'danger'" size="small">
                {{ copySupported ? '✅ Clipboard API 可用' : '⚠️ 降级为 execCommand' }}
              </el-tag>
            </div>
          </template>

          <!-- 文本复制 -->
          <div class="demo-section">
            <div class="section-title">1. 文本复制</div>
            <el-input v-model="copyText" placeholder="输入要复制的文本" type="textarea" :rows="3" />
            <el-button type="primary" style="margin-top:8px;width:100%" @click="copyTextToClipboard">
              📋 复制文本
            </el-button>
          </div>

          <!-- 带格式复制 -->
          <div class="demo-section">
            <div class="section-title">2. 一键复制代码块</div>
            <div class="code-snippet">
              <div class="snippet-header">
                <span>JavaScript</span>
                <el-button size="small" type="success" @click="copyCodeSnippet">复制代码</el-button>
              </div>
              <pre class="snippet-body">{{ codeSnippet }}</pre>
            </div>
          </div>

          <!-- 快捷复制 -->
          <div class="demo-section">
            <div class="section-title">3. 常用内容快速复制</div>
            <div class="quick-copy-list">
              <div
                v-for="item in quickItems"
                :key="item.label"
                class="quick-item"
                @click="quickCopy(item.value, item.label)"
              >
                <span class="qi-icon">{{ item.icon }}</span>
                <div class="qi-info">
                  <div class="qi-label">{{ item.label }}</div>
                  <div class="qi-value">{{ item.value }}</div>
                </div>
                <el-icon class="qi-copy"><DocumentCopy /></el-icon>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>📖 读取剪贴板</span>
              <el-tag type="warning" size="small">需用户授权</el-tag>
            </div>
          </template>

          <!-- 粘贴文本 -->
          <div class="demo-section">
            <div class="section-title">1. 读取文本（需授权）</div>
            <el-button type="primary" @click="readFromClipboard" style="width:100%;margin-bottom:10px">
              📖 读取剪贴板内容
            </el-button>
            <el-input
              v-model="pastedText"
              type="textarea"
              :rows="4"
              placeholder="点击上方按钮读取剪贴板内容..."
              readonly
            />
          </div>

          <!-- paste 事件监听 -->
          <div class="demo-section">
            <div class="section-title">2. 粘贴事件监听（Ctrl+V）</div>
            <div
              class="paste-zone"
              tabindex="0"
              @paste="handlePasteEvent"
              @focus="pasteZoneFocused = true"
              @blur="pasteZoneFocused = false"
              :class="{ focused: pasteZoneFocused }"
            >
              <div v-if="!pasteEventContent">
                🎯 点击此区域，然后 Ctrl+V 粘贴
              </div>
              <div v-else class="paste-result">
                <div class="paste-type">{{ pasteEventType }}</div>
                <div class="paste-content">{{ pasteEventContent }}</div>
              </div>
            </div>
          </div>

          <!-- 操作历史 -->
          <div class="demo-section">
            <div class="section-title">3. 操作日志</div>
            <div class="op-log">
              <div v-for="(op, i) in opLogs" :key="i" class="op-item">
                <el-tag :type="op.type" size="small">{{ op.action }}</el-tag>
                <span class="op-detail">{{ op.detail }}</span>
                <span class="op-time">{{ op.time }}</span>
              </div>
              <div v-if="!opLogs.length" class="empty-log">暂无操作记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 源码实现 -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header><span>🔧 完整工具函数实现</span></template>
          <pre class="code-block">{{ clipboardUtilCode }}</pre>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>📊 兼容性 & 注意事项</span></template>
          <el-table :data="compatData" border size="small">
            <el-table-column prop="item" label="方法" width="180" />
            <el-table-column prop="support" label="支持情况" />
            <el-table-column prop="note" label="注意事项" />
          </el-table>
          <div class="tips-box">
            <div class="tip" v-for="tip in tips" :key="tip">⚠️ {{ tip }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { DocumentCopy } from '@element-plus/icons-vue';

defineOptions({ name: 'ClipboardDemo' });

const copySupported = ref(false);
const copyText = ref('这是要复制的文本内容，支持多行文本。\n可以包含代码、链接等任何文本。');
const pastedText = ref('');
const pasteZoneFocused = ref(false);
const pasteEventContent = ref('');
const pasteEventType = ref('');
const opLogs = ref<{ action: string; detail: string; time: string; type: 'success' | 'warning' | 'danger' | 'info' }[]>([]);

function getTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

function addLog(action: string, detail: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info') {
  opLogs.value.unshift({ action, detail, time: getTime(), type });
  if (opLogs.value.length > 10) opLogs.value.pop();
}

onMounted(() => {
  copySupported.value = !!navigator.clipboard;
});

// 核心复制函数（兼容版）
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // 降级：execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

async function copyTextToClipboard() {
  if (!copyText.value.trim()) return;
  const ok = await copyToClipboard(copyText.value);
  if (ok) {
    ElMessage.success('✅ 已复制到剪贴板');
    addLog('复制', `文本（${copyText.value.slice(0, 20)}...）`, 'success');
  } else {
    ElMessage.error('复制失败');
    addLog('复制', '失败', 'danger');
  }
}

const codeSnippet = `const arr = [1, [2, [3, [4]]]];
const flat = arr.flat(Infinity);
console.log(flat); // [1, 2, 3, 4]`;

async function copyCodeSnippet() {
  const ok = await copyToClipboard(codeSnippet);
  if (ok) {
    ElMessage.success('✅ 代码已复制');
    addLog('复制代码', 'flat 示例', 'success');
  }
}

const quickItems = [
  { icon: '🔗', label: 'GitHub 主页', value: 'https://github.com' },
  { icon: '📧', label: '示例邮箱', value: 'example@email.com' },
  { icon: '📱', label: '示例手机号', value: '138 0000 0000' },
  { icon: '🔑', label: 'UUID 示例', value: '550e8400-e29b-41d4-a716-446655440000' },
];

async function quickCopy(value: string, label: string) {
  const ok = await copyToClipboard(value);
  if (ok) {
    ElMessage.success(`✅ 已复制「${label}」`);
    addLog('快速复制', label, 'success');
  }
}

async function readFromClipboard() {
  try {
    if (!navigator.clipboard) {
      ElMessage.warning('当前环境不支持读取剪贴板');
      return;
    }
    const text = await navigator.clipboard.readText();
    pastedText.value = text;
    addLog('读取', `成功（${text.length} 字符）`, 'success');
    ElMessage.success('✅ 读取成功');
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    ElMessage.error('读取失败：' + msg);
    addLog('读取', `失败: ${msg}`, 'danger');
  }
}

function handlePasteEvent(e: ClipboardEvent) {
  e.preventDefault();
  const items = e.clipboardData?.items;
  if (!items) return;

  let text = '';
  let type = '';

  for (const item of items) {
    if (item.type === 'text/plain') {
      item.getAsString(str => {
        pasteEventContent.value = str;
        pasteEventType.value = '📝 纯文本';
        addLog('粘贴', `文本（${str.slice(0, 20)}）`, 'info');
      });
      return;
    }
    if (item.type.startsWith('image/')) {
      type = `🖼 图片 (${item.type})`;
      text = '[图片内容，需用 FileReader 处理]';
    }
  }

  if (type) {
    pasteEventContent.value = text;
    pasteEventType.value = type;
    addLog('粘贴', type, 'warning');
  }
}

const clipboardUtilCode = `// utils/clipboard.ts
/**
 * 复制文本到剪贴板（兼容版）
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // 降级方案
    const el = Object.assign(document.createElement('textarea'), {
      value: text,
      style: 'position:fixed;opacity:0'
    });
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/**
 * 读取剪贴板文本
 */
export async function readText(): Promise<string> {
  if (!navigator.clipboard?.readText) {
    throw new Error('不支持读取剪贴板');
  }
  return navigator.clipboard.readText();
}

/**
 * 复制 HTML 格式
 */
export async function copyHtml(html: string, plain: string) {
  const item = new ClipboardItem({
    'text/html': new Blob([html], { type: 'text/html' }),
    'text/plain': new Blob([plain], { type: 'text/plain' }),
  });
  await navigator.clipboard.write([item]);
}

// Vue Composable 版本
export function useClipboard() {
  const copied = ref(false);
  
  async function copy(text: string) {
    const ok = await copyText(text);
    if (ok) {
      copied.value = true;
      setTimeout(() => copied.value = false, 2000);
    }
    return ok;
  }
  
  return { copied, copy };
}`;

const compatData = [
  { item: 'navigator.clipboard.writeText', support: 'Chrome 66+，需 HTTPS', note: '最推荐，异步，安全' },
  { item: 'navigator.clipboard.readText', support: 'Chrome 66+，需用户授权', note: '读取需显式权限' },
  { item: 'navigator.clipboard.write()', support: 'Chrome 76+，需 HTTPS', note: '支持复制图片等富内容' },
  { item: 'document.execCommand("copy")', support: '广泛支持，已废弃', note: '需选中文本元素，降级方案' },
  { item: 'ClipboardItem', support: 'Chrome 76+，需 HTTPS', note: '用于复制多种格式' },
];

const tips = [
  'Clipboard API 需要 HTTPS 或 localhost，HTTP 下不可用',
  'readText() 会触发浏览器权限弹窗，用户可以拒绝',
  'Safari 对 ClipboardItem 支持有限，需特殊处理',
  '在用户手势（click/keydown）中调用才能成功，不可在定时器中使用',
];
</script>

<style lang="less" scoped>
.clipboard-page {
  padding: 20px;
  h5 { margin: 0 0 8px; font-size: 20px; }
  .page-desc { color: #666; font-size: 13px; margin-bottom: 20px; line-height: 1.7; code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; } }
}
.card-header { display: flex; align-items: center; justify-content: space-between; }
.demo-section { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f5f5f5; &:last-child { border-bottom: none; margin-bottom: 0; } }
.section-title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 10px; }
.code-snippet {
  border: 1px solid #ddd; border-radius: 6px; overflow: hidden;
  .snippet-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #f5f5f5; font-size: 12px; color: #666; }
  .snippet-body { margin: 0; padding: 12px; background: #1e1e1e; color: #cdd; font-size: 12px; font-family: monospace; line-height: 1.6; }
}
.quick-copy-list { display: flex; flex-direction: column; gap: 8px; }
.quick-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  border: 1px solid #eee; border-radius: 8px; cursor: pointer; transition: all 0.2s;
  &:hover { border-color: #409eff; background: #ecf5ff; .qi-copy { opacity: 1; } }
  .qi-icon { font-size: 20px; }
  .qi-info { flex: 1; min-width: 0; }
  .qi-label { font-size: 12px; color: #666; }
  .qi-value { font-size: 13px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .qi-copy { color: #409eff; opacity: 0; transition: opacity 0.2s; }
}
.paste-zone {
  border: 2px dashed #ddd; border-radius: 8px; padding: 20px; text-align: center;
  font-size: 13px; color: #999; cursor: pointer; min-height: 80px; outline: none;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  &:hover, &.focused { border-color: #409eff; background: #ecf5ff; color: #409eff; }
  .paste-result { text-align: left; width: 100%; }
  .paste-type { font-size: 12px; color: #409eff; margin-bottom: 6px; }
  .paste-content { font-size: 13px; color: #333; word-break: break-all; }
}
.op-log { max-height: 140px; overflow-y: auto; }
.op-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid #f5f5f5; font-size: 12px; }
.op-detail { flex: 1; color: #555; }
.op-time { color: #bbb; font-family: monospace; }
.empty-log { color: #ccc; text-align: center; padding: 12px 0; font-size: 12px; }
.code-block {
  background: #1e1e1e; color: #cdd; border-radius: 6px; padding: 14px;
  font-size: 12px; font-family: monospace; line-height: 1.7;
  overflow-x: auto; white-space: pre; margin: 0;
}
.tips-box { margin-top: 12px; }
.tip { font-size: 12px; color: #e6a23c; padding: 4px 0; }
</style>
