<template>
  <div class="stt-page">
    <header class="stt-page__head">
      <h3 class="stt-page__title">语音识别 + 录音（Web Speech API / MediaRecorder）</h3>
      <p class="stt-page__desc">
        与「Chrome TTS 语音播报」成对：那页是合成（文字→语音），本页是识别（语音→文字）。
        需要 Chrome + 麦克风授权。
      </p>
    </header>

    <div class="stt-page__grid">
      <section class="stt-card">
        <h4>① 语音识别（SpeechRecognition）</h4>
        <p class="stt-card__tip">continuous 模式：边说边出字，interim 为未定稿的灰字</p>
        <div class="stt-card__row">
          <button class="stt-btn" :class="{ 'is-recording': listening }" @click="toggleListen">
            {{ listening ? '⏹ 停止识别' : '🎙 开始识别' }}
          </button>
          <button class="stt-btn stt-btn--ghost" @click="finalText = ''; interimText = ''">清空</button>
        </div>
        <div class="stt-card__result">
          <p v-if="interimText" class="stt-card__interim">{{ interimText }}…</p>
          <p class="stt-card__final">{{ finalText || '识别结果会出现在这里' }}</p>
        </div>
      </section>

      <section class="stt-card">
        <h4>② 录音回放（MediaRecorder）</h4>
        <p class="stt-card__tip">采集麦克风原始音频，适合「录完上传」或语音留言场景</p>
        <div class="stt-card__row">
          <button class="stt-btn" :class="{ 'is-recording': recording }" @click="toggleRecord">
            {{ recording ? '⏹ 停止录音' : '⏺ 开始录音' }}
          </button>
        </div>
        <div v-if="audioUrl" class="stt-card__audio">
          <audio :src="audioUrl" controls></audio>
        </div>
        <p v-if="recording" class="stt-card__rec-tip">● 录音中…</p>
      </section>

      <section class="stt-card stt-card--wide">
        <h4>落地结论</h4>
        <ul class="stt-card__list">
          <li>SpeechRecognition 目前只有 Chromium 内核完整支持，Firefox/Safari 需降级为「录音 + 云端转写」</li>
          <li>识别结果分 interim（临时）与 final（定稿）两段，输入法式 UI 用 interim 撑实时感</li>
          <li>.MediaRecorder 产出 webm/opus，Safari 产出 mp4——上传前按 mimeType 判断后缀</li>
          <li>告警播报（TTS）+ 语音指令（STT）组合可以做纯语音交互的工单终端</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';

defineOptions({ name: 'SpeechRecognitionDemo' });

const listening = ref(false);
const recording = ref(false);
const finalText = ref('');
const interimText = ref('');
const audioUrl = ref('');

let recognition: any = null;
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];

const toggleListen = () => {
  if (listening.value) {
    recognition?.stop();
    return;
  }
  const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
  if (!SR) {
    finalText.value = '当前浏览器不支持 SpeechRecognition，请用 Chrome 试试';
    return;
  }
  recognition = new SR();
  recognition.lang = 'zh-CN';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) finalText.value += result[0].transcript;
      else interim += result[0].transcript;
    }
    interimText.value = interim;
  };
  recognition.onend = () => {
    listening.value = false;
    interimText.value = '';
  };
  recognition.onerror = (event: any) => {
    finalText.value = `识别出错：${event.error}（常见：未授权麦克风）`;
    listening.value = false;
  };

  recognition.start();
  listening.value = true;
}

const toggleRecord = async () => {
  if (recording.value) {
    recorder?.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    chunks = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' });
      audioUrl.value = URL.createObjectURL(blob);
      stream.getTracks().forEach((track) => track.stop());
      recording.value = false;
    };
    recorder.start();
    recording.value = true;
  } catch {
    audioUrl.value = '';
    recording.value = false;
  }
}

onBeforeUnmount(() => {
  recognition?.stop();
  if (recording.value) recorder?.stop();
});
</script>

<style lang="less" scoped>
.stt-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;

  &__title {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__desc {
    margin: 0;
    color: var(--ai-text-dim);
    font-size: 13px;
    line-height: 1.6;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 12px;
  }
}

.stt-card {
  padding: 16px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface-raised);

  &--wide {
    grid-column: 1 / -1;
  }

  h4 {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 13.5px;
  }

  &__tip {
    margin: 0 0 12px;
    color: var(--ai-text-mute);
    font-size: 11.5px;
  }

  &__row {
    display: flex;
    gap: 8px;
  }

  &__result {
    margin-top: 12px;
    min-height: 84px;
    padding: 12px;
    border-radius: var(--ai-radius-sm);
    background: var(--ai-surface);
    border: 1px solid var(--ai-hairline);
  }

  &__interim {
    margin: 0 0 4px;
    color: var(--ai-text-mute);
    font-size: 12.5px;
    font-style: italic;
  }

  &__final {
    margin: 0;
    color: var(--ai-text);
    font-size: 13px;
    line-height: 1.7;
    word-break: break-all;
  }

  &__audio {
    margin-top: 12px;

    audio {
      width: 100%;
    }
  }

  &__rec-tip {
    margin: 8px 0 0;
    color: #f87171;
    font-size: 12px;
    animation: stt-blink 1.2s ease-in-out infinite;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding-left: 18px;
    color: var(--ai-text-dim);
    font-size: 12.5px;
    line-height: 1.7;
  }
}

.stt-btn {
  height: 34px;
  padding: 0 16px;
  border: 1px solid var(--ai-border);
  border-radius: 9px;
  background: var(--ai-surface);
  color: var(--ai-text-dim);
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color 0.18s ease, color 0.18s ease;

  &:hover {
    color: var(--ai-text);
  }

  &--ghost {
    background: transparent;
  }

  &.is-recording {
    border-color: rgba(248, 113, 113, 0.5);
    color: #f87171;
  }
}

@keyframes stt-blink {
  50% {
    opacity: 0.35;
  }
}
</style>
