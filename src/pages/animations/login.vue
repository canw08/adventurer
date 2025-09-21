<template>
  
  <div class="container">
    <div class="typewriter">
      {{ displayedText }}<span class="cursor">|</span>
    </div>
    <div class="terminal-log" v-if="showTerminalLog">
      <div v-for="(log, index) in terminalLogs" :key="index">{{ log }}</div>
    </div>
    <button
      v-if="showSkipButton"
      class="skip-btn"
      @click="skip"
    >
      Skip
    </button>
  </div>
</template>

<route lang="yaml">
meta:
  requiresAuth: false
</route>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'   // ① 引入 router
import { useUserStore } from '../../stores/user'   // ⬅️ 从 Pinia 取用户角色

const router = useRouter()              // ② 实例化 router
// ★新增：控制按钮显示与跳过状态
const showSkipButton = ref(false)
const skipped = ref(false)
const currentTarget = ref(null)  // 记录将要跳转的路由


const skip = async () => {
  if (skipped.value) return
  skipped.value = true
  if (typeof showSkipButton !== 'undefined') showSkipButton.value = false // 可选：隐藏按钮

  const role = (useUserStore().userInfo && useUserStore().userInfo.role) || 'student'
  const sentences = scriptsByRole[role] || scriptsByRole.student
  const target = redirectByRole[role] || redirectByRole.default

  // 小工具：在 skip 内部使用的打字与删除（不受 skipped 判断影响）
  const typeOut = async (text) => {
    displayedText.value = ''
    for (let i = 0; i < text.length; i++) {
      displayedText.value += text[i]
      await new Promise(r => setTimeout(r, typingSpeed))
    }
  }
  const deleteOut = async () => {
    while (displayedText.value.length > 0) {
      displayedText.value = displayedText.value.slice(0, -1)
      await new Promise(r => setTimeout(r, deleteSpeed))
    }
  }

  if (sentences.length >= 2) {
    const penultimate = sentences[sentences.length - 2]
    const last = sentences[sentences.length - 1]

    // 1) 打出倒数第二句
    await typeOut(penultimate)
    await new Promise(r => setTimeout(r, sentencePause))
    // 2) 删除
    await deleteOut()
    // 3) 打出最后一句
    await typeOut(last)
  } else {
    // 只有一句时，直接打出最后一句
    const only = sentences[sentences.length - 1]
    await typeOut(only)
  }

  // 4) 最后一句完成后，统一等待一会儿再跳转
  await new Promise(r => setTimeout(r, sentencePause))
  router.push(target)
}


/** —— 各角色的脚本（可按需增减角色或替换文案） —— */
const scriptsByRole = {
  teacher: [
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
  ],
  student: [
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
    
  ],
  admin: [
    '/周遭的喧嚣戛然而止，数据流如瀑布般在您眼前静谧流淌',
    '/一道冰冷的蓝光扫过，验证着您的最高权限',
    '身份确认。管理员，欢迎归来。',
    '/无数待处理的请求如繁星般在虚空中闪烁，等待您的裁决',
    '系统日志显示三处异常波动，已标记。需要您亲自审阅。',
    '秩序，是这片世界得以运行的唯一基石。',
    '/您的指尖划过光屏，违规的条目在无声中化为齑粉',
    '新的规则已注入底层协议。',
    '防火墙强度提升至“冥河”级别。一切如您所愿。',
    '维护完成。系统，稳定运行中。'
  ],
}

const redirectByRole = {
  teacher: '/teacher/setup',
  student: '/student/setup',
  admin: '/admin/dashboard',
  // 未识别角色或未登录的兜底
  default: '/login',
}

const displayedText = ref('')
const currentSentenceIndex = ref(0)

const showTerminalLog = ref(false)
const terminalLogs = ref([])

const typingSpeed = 80        // 打字速度
const sentencePause = 1500    // 每句话打完后停顿
const deleteSpeed = 30       // 删除速度

const fakeTerminalCommands = [
]

const typeSentence = async (sentence) => {
  displayedText.value = ''
  for (let i = 0; i < sentence.length; i++) {
    if (skipped.value) return                   // ★新增：被跳过时立刻退出
    displayedText.value += sentence[i]
    await new Promise(resolve => setTimeout(resolve, typingSpeed))
  }
  await new Promise(resolve => setTimeout(resolve, sentencePause))
  // ★新增：首句播放完后显示“跳过动画”按钮
  if (currentSentenceIndex.value === 0) {
    showSkipButton.value = true
  }
}

const deleteSentence = async () => {
  while (displayedText.value.length > 0) {
    if (skipped.value) return                   // ★新增：被跳过时立刻退出
    displayedText.value = displayedText.value.slice(0, -1)
    await new Promise(resolve => setTimeout(resolve, deleteSpeed))
  }
}

const runTypewriter = async (role) => {
  await new Promise(resolve => setTimeout(resolve, 2500))
  const sentences = scriptsByRole[role] || scriptsByRole.student
  const target = redirectByRole[role] || redirectByRole.default
  currentTarget.value = target                 // ★新增：记录跳转目标

  for (let i = 0; i < sentences.length; i++) {
    currentSentenceIndex.value = i             // ★新增：用于判定首句结束
    await typeSentence(sentences[i])
    if (skipped.value) return                  // ★新增：被跳过就不再删/播后续
    await deleteSentence()
  }
  router.push(target)
}



onMounted(async () => {
    const userStore = useUserStore()
  let role = null

  // 建议：如果这个页面属于“需要登录才能看”，这里要 try/catch 到登录
  try {
    if (!userStore.userInfo) {
      await userStore.fetchUser()
    }
    role = userStore.userInfo && userStore.userInfo.role
  } catch (e) {
    // 拉取失败，当成未登录
    role = null
  }
  runTypewriter(role)
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
/* ★新增：跳过按钮样式（右下角固定） */
.skip-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  padding: 10px 14px;
  border: 1px solid #00ff88;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #00ff88;
  font-family: 'Inter', 'Roboto', 'Arial', sans-serif;
  cursor: pointer;
  z-index: 20;
  transition: transform .15s ease, background .15s ease;
}
.skip-btn:hover {
  transform: translateY(-1px);
  background: rgba(0, 0, 0, 0.75);
}
.skip-btn:active {
  transform: translateY(0);
}

</style>
