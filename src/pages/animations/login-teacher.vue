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
import { useRouter } from 'vue-router'   // ① 引入 router

const router = useRouter()              // ② 实例化 router

const sentences = [
  '/漫步在片片石阶上,眼前的茫茫让你思绪万千',
  '/耳边是熟悉的吹打声…风沙慢慢蚀去你的步痕',
  '/貌似只有朵朵暖云在路上陪伴',
  '/前面是一座…小酒馆?',
  '/房顶上缭绕的烟雾让你认出了这就是那些家伙说的地方',
  '/饱经风霜的墙壁勾起你脑中在这片大地经历的种种',
  '/不过…你坚信…这扇门的背后会是新的篇章',
  '/缓缓推开…眼前的是…',
  '您好您好 终于等到您了…看起来您比他们口中说的更年轻俊俏呢',
  '/这个自来熟的少女很自然地带你进了一个房间缓缓坐下',
  '/不经意间,你察觉到少女的脸上褪去了那一丝俏皮',
  '您知道…我们处在个堕落的时代',
  '我们相信唯有精诚合作才能带来希望',
  '因此,请您不要吝啬手中的力量',
  '年轻的冒险者们已经准备好被您征召',
  '现在让我为您拍张美照到系统吧',
];




const displayedText = ref('')
const currentSentenceIndex = ref(0)

const showTerminalLog = ref(false)
const terminalLogs = ref([])

const typingSpeed = 80        // 打字速度
const sentencePause = 1500    // 每句话打完后停顿
const deleteSpeed = 30       // 删除速度

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
  await new Promise(resolve => setTimeout(resolve, 2500))

  for (let i = 0; i < sentences.length; i++) {
    await typeSentence(sentences[i])
    await deleteSentence()   // ✅ 每一句都删掉，包括最后一句
  }

  // ✨ 删除完最后一句后跳转
  router.push('/student/setup')   // 修改成你要去的页面
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
