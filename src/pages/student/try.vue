<template>
  <div class="container">
    <div class="typewriter">
      {{ displayedText }}<span class="cursor">|</span>
    </div>
    <div class="terminal-log" v-if="showTerminalLog">
      <div v-for="(log, index) in terminalLogs" :key="index">{{ log }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const sentences = [
  '欢迎来到异世界(?)',
  '正在接入冒险者工会接取终端。',
  '我是 Bot，工会的辅助引导程序。',
  '正在为你进行身份初始化……',
  '身份状态：未注册 · 等级 E',
  '生理结构：人类 · 现实维度投影体',
  '初始权限：基础任务接取 · 代币获取 · 经验积累',
  '即将开启身份注册流程……',
  '同步完成。',
  '已为你注册至冒险者工会。',
  '可接取任务范围：校园内公共任务、志愿服务、小型委托',
  '完成任务将获得：经验值、代币、志愿者时长',
  '经验值提升后将自动晋升冒险者等级',
  '更高等级可解锁更多权限与任务类别',
  '请先设置你的昵称和头像，打造专属形象。',
  'Bot 将在你执行任务时提供指引与协助。',
  'gogogo出发喽~'
]

const displayedText = ref('')
const currentSentenceIndex = ref(0)

const showTerminalLog = ref(false)
const terminalLogs = ref([])

const typingSpeed = 80        // 打字速度
const sentencePause = 1500    // 每句话打完后停顿
const deleteSpeed = 40        // 删除速度

const fakeTerminalCommands = [
  '>>> INIT_PROTOCOL handshake_bot_01',
  '>>> Loading assistant personality module...',
  '>>> Bot personality: Academic · Cheerful · Helpful',
  '>>> Establishing speech synthesis...',
  '>>> Synthesizer online.',
  '>>> Connecting to volunteer network nodes...',
  '>>> Network connection stable.',
  '>>> Fetching latest task database...',
  '>>> Task database synchronized.',
  '>>> Running system diagnostics...',
  '>>> Diagnostics complete. All systems functional.',
  '>>> Ready to assist adventurer.'
]

const typeSentence = async (sentence) => {
  displayedText.value = ''
  for (let i = 0; i < sentence.length; i++) {
    displayedText.value += sentence[i]
    await new Promise(resolve => setTimeout(resolve, typingSpeed))
  }
  await new Promise(resolve => setTimeout(resolve, sentencePause))
}

const deleteSentence = async () => {
  while (displayedText.value.length > 0) {
    displayedText.value = displayedText.value.slice(0, -1)
    await new Promise(resolve => setTimeout(resolve, deleteSpeed))
  }
}

const runTerminalLog = async () => {
  showTerminalLog.value = true
  terminalLogs.value = []
  let speed = 200
  for (const cmd of fakeTerminalCommands) {
    terminalLogs.value.push(cmd)
    await new Promise(resolve => setTimeout(resolve, speed))
    speed = Math.max(100, speed - 3) // 每条命令间隔逐渐缩短
  }
  await new Promise(resolve => setTimeout(resolve, 800))
  showTerminalLog.value = false
}

const runTypewriter = async () => {
  while (true) {
    const index = currentSentenceIndex.value
    const sentence = sentences[index]
    await typeSentence(sentence)

    if (index === 1) { // 第二句后显示终端动画
      await runTerminalLog()
    }

    await deleteSentence()
    currentSentenceIndex.value = (index + 1) % sentences.length
  }
}

onMounted(() => {
  runTypewriter()
})
</script>

<style scoped>
/* 全屏黑背景 + 居中 + 现代无衬线字体 */
.container {
  position: relative;
  background-color: #000;
  color: #fff;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Inter', 'Roboto', 'Arial', sans-serif;
  overflow: hidden;
  padding: 20px;
}

/* 打字文本样式 */
.typewriter {
  font-size: 2rem;
  white-space: pre;
  text-align: center;
  z-index: 2;
}

/* 光标闪烁 */
.cursor {
  display: inline-block;
  width: 1ch;
  animation: blink 1s step-start infinite;
  color: #00ff88;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* 左下角终端日志 */
.terminal-log {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: #00ff88;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10px 12px;
  border-left: 2px solid #00ff88;
  max-width: 90vw;
  white-space: pre-wrap;
  pointer-events: none;
  z-index: 10;
  user-select: none;
}
</style>
