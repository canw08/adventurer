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
  '/你醒了……',
  '/这里的阳光有点刺的你睁不开眼……',
  '/恍惚间片片叶子被风缓缓卷起……仿佛在诉说这片大地过往的种种……',
  '/一双细腻白皙的手轻扫过饱经风霜的石垣……',
  '/一位……美少女？',
  '/她和这里亘古不变的种种一样。',
  '/过去在……未来也会在……',
  '/现在……',
  '哈喽..喂..莫西莫西... O.o?',
  '哦哦你在啊，哈哈不好意思。',
  '已经等你123456789天了（还真有人会来的啊）',
  'Ciallo～(∠・▽< )⌒☆',
  '嗯……是这样的，我喜欢你。',
  '跟我结婚吧！（还不赶紧答应本天才美少女(▼ヘ▼#)）',
  '嘻嘻，既然同意了那就赶紧在契约上写你名字吧……不许反悔的！',
  '/# 输入用户名',
  '不愧是本美女看上的人（这么好骗的 ＜(￣▽￣)>）',
  '唔……那先带你熟悉下这个世界吧。'
];


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
