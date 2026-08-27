<template>
  <el-card class="tts-card" shadow="hover">
    <template #header>
      <div class="tts-header">
        <span>Chrome TTS 文字语音播报</span>
        <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
      </div>
    </template>

    <el-input
      v-model="text"
      type="textarea"
      :autosize="{ minRows: 5, maxRows: 20 }"
      placeholder="请输入要播报的文本（点击下方「播放」按钮触发语音播报）"
      resize="none"
    />

    <el-form class="tts-form" label-width="80px" size="default">
      <el-form-item label="语音">
        <el-select v-model="voiceName" placeholder="选择中文语音" filterable style="width: 100%">
          <el-option v-for="v in voices" :key="v.voiceURI" :label="`${v.name}（${v.lang}）`" :value="v.name" />
        </el-select>
        <div v-if="voices.length === 0" class="tts-hint">未检测到中文语音，请确认系统已安装中文 TTS 引擎</div>
      </el-form-item>

      <el-form-item label="语速">
        <el-slider v-model="rate" :min="0.1" :max="10" :step="0.1" show-input />
      </el-form-item>

      <el-form-item label="音调">
        <el-slider v-model="pitch" :min="0" :max="2" :step="0.1" show-input />
      </el-form-item>

      <el-form-item label="音量">
        <el-slider v-model="volume" :min="0" :max="1" :step="0.05" show-input />
      </el-form-item>
    </el-form>

    <div class="tts-actions">
      <el-button type="primary" size="large" :disabled="!canPlay" @click="play">
        <el-icon style="margin-right: 4px; vertical-align: -2px"><VideoPlay /></el-icon>
        播放
      </el-button>
      <el-button size="large" :disabled="!canPause" @click="pause">
        <el-icon style="margin-right: 4px; vertical-align: -2px"><VideoPause /></el-icon>
        暂停
      </el-button>
      <el-button size="large" :disabled="!canResume" @click="resume">
        <el-icon style="margin-right: 4px; vertical-align: -2px"><VideoPlay /></el-icon>
        继续
      </el-button>
      <el-button size="large" :disabled="!canStop" @click="stop">
        <el-icon style="margin-right: 4px; vertical-align: -2px"><VideoCameraFilled /></el-icon>
        停止
      </el-button>
    </div>

    <div v-if="status !== 'idle' && totalChunks > 0" class="tts-progress">
      <el-progress :percentage="progressPercent" :stroke-width="12" :show-text="false" />
      <div class="tts-progress-text">正在播报第 {{ chunkIndex + 1 }} / {{ totalChunks }} 段</div>
    </div>

    <div v-if="lastError" class="tts-error">错误：{{ lastError }}</div>
  </el-card>

  <el-button ref="triggerComp" class="tts-trigger" @mouseenter="onTriggerEnter" @mouseleave="onTriggerLeave">
    悬浮我
  </el-button>

  <el-tooltip
    ref="tooltipRef"
    v-model:visible="visible"
    virtual-triggering
    :virtual-ref="virtualRef"
    placement="top"
    :fallback-placements="[]"
    :enterable="true"
    popper-class="keep-hover-tooltip"
    :popper-options="popperOptions"
  >
    <template #content>
      <div style="max-width: 240px">Tooltip 内容区域（鼠标移入不关闭）</div>
    </template>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { ElTooltip } from 'element-plus';
import { VideoCameraFilled, VideoPause, VideoPlay } from '@element-plus/icons-vue';

const visible = ref(false);
const isOverTrigger = ref(false);
const isOverPopper = ref(false);

let closeTimer: number | null = null;
const clearCloseTimer = () => {
  if (closeTimer != null) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }
};
const scheduleClose = () => {
  clearCloseTimer();
  closeTimer = window.setTimeout(() => {
    if (!isOverTrigger.value && !isOverPopper.value) visible.value = false;
  }, 80);
};

const triggerComp = ref<ComponentPublicInstance | null>(null);
const triggerEl = computed(() => triggerComp.value?.$el as HTMLElement | undefined);
const virtualRef = computed(() => triggerEl.value);

const tooltipRef = ref<InstanceType<typeof ElTooltip> | null>(null);
let popperEl: HTMLElement | null = null;

const isInPopper = (t: EventTarget | null) => !!(t instanceof Node && popperEl?.contains(t));
const isInTrigger = (t: EventTarget | null) => !!(t instanceof Node && triggerEl.value?.contains(t));

const onTriggerEnter = async () => {
  isOverTrigger.value = true;
  visible.value = true;
  await nextTick();
  tooltipRef.value?.updatePopper?.();
};

const onTriggerLeave = (e: MouseEvent) => {
  isOverTrigger.value = false;
  if (isInPopper(e.relatedTarget)) return;
  scheduleClose();
};

const onPopperEnter = () => {
  isOverPopper.value = true;
  clearCloseTimer();
};

const onPopperLeave = (e: MouseEvent) => {
  isOverPopper.value = false;
  if (isInTrigger(e.relatedTarget)) return;
  scheduleClose();
};

const bindPopperHover = () => {
  popperEl?.removeEventListener('mouseenter', onPopperEnter);
  popperEl?.removeEventListener('mouseleave', onPopperLeave);

  popperEl = document.querySelector('.keep-hover-tooltip') as HTMLElement | null;
  if (!popperEl) return;

  popperEl.addEventListener('mouseenter', onPopperEnter);
  popperEl.addEventListener('mouseleave', onPopperLeave);
};

watch(visible, async (v) => {
  clearCloseTimer();
  if (!v) {
    isOverPopper.value = false;
    return;
  }
  await nextTick();
  bindPopperHover();
});

const onGlobalReposition = () => {
  if (!visible.value) return;
  tooltipRef.value?.updatePopper?.();
};

window.addEventListener('scroll', onGlobalReposition, true);
window.addEventListener('resize', onGlobalReposition);

const popperOptions: Partial<Record<string, unknown>> = {
  strategy: 'fixed',
  modifiers: [
    { name: 'flip', enabled: false },
    { name: 'offset', options: { offset: [0, 8] } },
  ],
};

// ===== Chrome TTS（Web Speech API / SpeechSynthesis） =====
type TtsStatus = 'idle' | 'playing' | 'paused';

const text = ref(
  '在产品经理的日常工作中，需求文档撰写是基础且核心的环节。一份优秀的文档不仅需要清晰描述功能细节，还应包含业务背景、用户画像、流程图示以及异常处理方案。借助语音播报技术，可以将冗长的文字内容转化为听觉信息，方便在通勤、运动等场景下进行内容审阅与团队评审，从而大幅提升协作效率与沟通质量，让产品迭代更顺畅。\n\n传统的文档评审需要所有相关方同时集中在会议室，花费数小时围绕一份几十页的方案逐条讨论。引入语音播报后，团队成员可以随时随地听取文档内容，预先消化信息，再到评审会上聚焦关键决策。这种异步预读模式已被多家头部互联网公司验证，能够将会议时长压缩百分之四十以上，让团队从低效的逐字朗读中解放出来，把宝贵的时间投入到真正的价值判断与方案权衡上。\n\n对于视觉障碍用户而言，语音播报更是无障碍体验的重要一环。它让信息获取不再依赖屏幕阅读，让产品真正服务每一位用户。我们在产品设计之初就将无障碍能力纳入需求清单，确保每个新功能发布时都自带语音支持，而不是事后补齐。这种前置于开发周期的考量，能够从源头上避免信息鸿沟，让产品在诞生之初就具备包容性，也更符合企业社会责任与长期品牌建设的要求。\n\n在实际使用中，只需在文本框中粘贴或输入要播报的内容，选择合适的中文语音，调整语速、音调与音量，然后点击播放按钮即可。系统会自动按句末标点把长文本切分成若干不超过八十个字符的短句，依次排队朗读，既避免了浏览器对单条语音的时长限制，又保证了自然的断句节奏。切分算法优先尊重标点边界，只有在单句过长时才会从中间断开，最大程度还原人类朗读时的呼吸感与韵律。\n\n用户也可以随时暂停、继续或停止播报，并通过下方的进度条与段数提示实时掌握当前播报位置。整套方案基于浏览器原生的 Web Speech API 实现，无需安装任何插件，开箱即用，跨平台兼容主流桌面与移动浏览器。开发者还可以基于本示例快速扩展为组件库，集成到企业内部的知识库、客服系统、电子阅读器等场景中，让文字信息真正流动起来。后续也可以接入云端高质量 TTS 服务，进一步提升发音的自然度与情感表现力。\n\n需要提醒的是，浏览器对单条语音存在约十五秒的时长限制，超过则可能被自动中断。这也是本示例将长文本切片播放的原因之一，配合逐段排队的策略，可以稳定朗读任意长度的内容。\n\n掌握以上要点，你就可以把语音播报能力无缝嵌入自己的产品中，让信息以更丰富、更包容的方式触达每一位用户。',
);
const voices = ref<SpeechSynthesisVoice[]>([]);
const voiceName = ref<string>('');
const rate = ref(1);
const pitch = ref(1);
const volume = ref(1);
const status = ref<TtsStatus>('idle');
const lastError = ref('');
const chunks = ref<string[]>([]);
const chunkIndex = ref(0);
const totalChunks = computed(() => chunks.value.length);
const progressPercent = computed(() => {
  if (!chunks.value.length) return 0;
  return Math.min(100, Math.round(((chunkIndex.value + 1) / chunks.value.length) * 100));
});
// 持有当前 utterance 引用，避免被 GC（Chrome 已知行为）
// @ts-expect-error TS6133 - 通过闭包副作用保留引用，TS 无法识别
let currentUtter: SpeechSynthesisUtterance | null = null;
// 用户主动停止后，阻止 onend / onerror 继续自动播放下一段
let userStopped = false;

const statusText = computed(() => {
  if (status.value === 'playing') return '播放中';
  if (status.value === 'paused') return '已暂停';
  return '空闲';
});
const statusTagType = computed<'success' | 'warning' | 'info'>(() => {
  if (status.value === 'playing') return 'success';
  if (status.value === 'paused') return 'warning';
  return 'info';
});

const canPlay = computed(() => !!text.value.trim() && !!voiceName.value && status.value !== 'playing');
const canPause = computed(() => status.value === 'playing');
const canResume = computed(() => status.value === 'paused');
const canStop = computed(() => status.value !== 'idle');

// 仅普通话：zh-CN / zh-Hans，剔除粤语、繁体等
const isZhVoice = (v: SpeechSynthesisVoice) => /^(zh-CN|zh-Hans)([-_]|$)/i.test(v.lang);

const loadVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const list = (window.speechSynthesis.getVoices() || []).filter(isZhVoice);
  voices.value = list;
  if (voiceName.value && !list.some((v) => v.name === voiceName.value)) {
    voiceName.value = '';
  }
  if (!voiceName.value) {
    const preferred = list.find((v) => v.default) || list[0];
    if (preferred) voiceName.value = preferred.name;
  }
};

const getSelectedVoice = () => voices.value.find((v) => v.name === voiceName.value) || null;

// 把长文本按句末标点切分，单段不超过 maxLen，避免 Chrome 单条 utterance 15s 限制导致 interrupted
const splitText = (raw: string, maxLen = 80): string[] => {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const parts = trimmed.match(/[^。！？.!?\n]+[。！？.!?\n]?/g) || [trimmed];
  const result: string[] = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + p).length > maxLen && cur) {
      result.push(cur);
      cur = p;
    } else {
      cur += p;
    }
  }
  if (cur) result.push(cur);
  return result;
};

const setUtterance = (u: SpeechSynthesisUtterance, idx: number) => {
  const voice = getSelectedVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang || 'zh-CN';
  u.rate = rate.value;
  u.pitch = pitch.value;
  u.volume = volume.value;
  u.onstart = () => {
    if (userStopped) return;
    status.value = 'playing';
    lastError.value = '';
  };
  u.onpause = () => {
    if (userStopped) return;
    status.value = 'paused';
  };
  u.onresume = () => {
    if (userStopped) return;
    status.value = 'playing';
  };
  u.onend = () => {
    if (userStopped) return;
    speakChunkAt(idx + 1);
  };
  u.onerror = (e) => {
    if (userStopped) return;
    if (e.error && e.error !== 'canceled' && e.error !== 'interrupted') {
      lastError.value = `${e.error || '未知错误'}`;
    }
    if (e.error === 'canceled' || e.error === 'interrupted') return;
    speakChunkAt(idx + 1);
  };
};

const speakChunkAt = (idx: number) => {
  if (idx >= chunks.value.length) {
    status.value = 'idle';
    chunkIndex.value = 0;
    currentUtter = null;
    return;
  }
  chunkIndex.value = idx;
  const u = new SpeechSynthesisUtterance(chunks.value[idx]);
  setUtterance(u, idx);
  currentUtter = u;
  window.speechSynthesis.speak(u);
};

const play = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    lastError.value = '当前浏览器不支持 Web Speech API';
    return;
  }
  if (!voiceName.value) {
    lastError.value = '暂无可用的中文语音，请先安装中文 TTS 引擎';
    return;
  }
  userStopped = false;
  window.speechSynthesis.cancel();
  chunks.value = splitText(text.value);
  if (!chunks.value.length) return;
  status.value = 'playing';
  speakChunkAt(0);
};

const pause = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (status.value === 'playing') {
    window.speechSynthesis.pause();
    status.value = 'paused';
  }
};

const resume = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (status.value === 'paused') {
    window.speechSynthesis.resume();
    status.value = 'playing';
  }
};

const stop = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  userStopped = true;
  window.speechSynthesis.cancel();
  status.value = 'idle';
  chunkIndex.value = 0;
  chunks.value = [];
  currentUtter = null;
};

let voicesHandler: (() => void) | null = null;

onMounted(() => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    lastError.value = '当前浏览器不支持 Web Speech API';
    return;
  }
  loadVoices();
  // Chrome 中 voices 是异步加载的
  voicesHandler = () => loadVoices();
  window.speechSynthesis.onvoiceschanged = voicesHandler;
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onGlobalReposition, true);
  window.removeEventListener('resize', onGlobalReposition);
  clearCloseTimer();
  popperEl?.removeEventListener('mouseenter', onPopperEnter);
  popperEl?.removeEventListener('mouseleave', onPopperLeave);
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = null;
    userStopped = true;
    window.speechSynthesis.cancel();
  }
  currentUtter = null;
});
</script>

<style scoped>
.tts-card {
  max-width: 640px;
  margin: 16px 0;
}
.tts-card :deep(.el-textarea__inner) {
  word-break: break-all;
  word-wrap: break-word;
  white-space: pre-wrap;
}
.tts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}
.tts-form {
  margin-top: 16px;
}
.tts-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.tts-progress {
  margin-top: 12px;
}
.tts-progress-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
.tts-error {
  margin-top: 8px;
  color: var(--el-color-danger);
  font-size: 13px;
}
.tts-hint {
  margin-top: 4px;
  color: var(--el-color-warning);
  font-size: 12px;
}
.tts-trigger {
  margin-left: 16px;
}
</style>
