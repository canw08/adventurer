<template>
  <div class="help-page">
    <header class="header glass">
      <h1 class="title">我的账号是啥？</h1>
      <p class="subtitle">登录账号说明</p>
    </header>

    <div class="content">
      <section class="single-pane">
        <Card class="card">
          <template #title>
            <div class="card-title">爱迪邮箱账号说明</div>
          </template>

          <template #content>
            <p class="description">
              本网站使用你的爱迪邮箱账号登录，网站密码已发送至你的爱迪邮箱。
              如果你还没有登录过爱迪邮箱，或者不知道邮箱密码，可以复制下方话术发送给班主任老师，获取爱迪邮箱密码。
              爱迪邮箱的登录方式请前往帮助中心查看。
            </p>

            <label class="message-label" for="teacher-message">发送给班主任老师的话术</label>
            <Textarea
              id="teacher-message"
              v-model="teacherMessage"
              class="message-box"
              rows="4"
              readonly
              autoResize
            />

            <div class="message-footer">
              <small class="message-style">当前风格：{{ currentStyle }}</small>
            </div>

            <div class="copy-row">
              <small class="copy-status" aria-live="polite">{{ copyStatus }}</small>
              <div class="message-actions">
                <Button
                  label="随机更换"
                  icon="pi pi-refresh"
                  class="compact-button"
                  text
                  @click="randomizeMessage"
                />
                <Button
                  label="一键复制"
                  icon="pi pi-copy"
                  class="compact-button"
                  @click="copyMessage"
                />
              </div>
            </div>

            <div class="actions">
              <Button
                label="返回"
                icon="pi pi-arrow-left"
                text
                @click="goBack"
              />
              <Button
                label="进入帮助中心"
                icon="pi pi-arrow-right"
                iconPos="right"
                @click="goToHelpCenter"
              />
            </div>
          </template>
        </Card>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Textarea from 'primevue/textarea'

const router = useRouter()
const messages = [
  { style: '礼貌简洁', text: '老师您好，我需要登录爱迪邮箱，但目前不知道自己的爱迪邮箱密码。请问可以将邮箱密码发给我吗？谢谢老师。' },
  { style: '正式清晰', text: '老师您好，我需要登录个人爱迪邮箱，目前无法确认自己的邮箱密码。麻烦您将爱迪邮箱密码告知我，谢谢老师。' },
  { style: '自然日常', text: '老师您好，我想登录爱迪邮箱，但是不知道自己的邮箱密码。可以麻烦您把密码发给我吗？谢谢老师。' },
  { style: '直接明了', text: '老师您好，请问可以把我的爱迪邮箱密码发给我吗？我需要登录邮箱，谢谢老师。' },
  { style: '温和客气', text: '老师您好，打扰您了。我需要登录爱迪邮箱，但还不知道邮箱密码。方便的话，麻烦您将密码发给我，谢谢老师。' },
  { style: '说明原因', text: '老师您好，因为我需要登录自己的爱迪邮箱，所以想向您询问邮箱密码。麻烦您将密码发给我，谢谢老师。' },
  { style: '诚恳请求', text: '老师您好，麻烦您了。我需要登录爱迪邮箱，但目前没有邮箱密码。请问您可以帮我查询并发送一下吗？谢谢老师。' },
  { style: '轻松自然', text: '老师您好，我需要登录一下爱迪邮箱，不过我还不知道邮箱密码。麻烦您发给我一下，谢谢老师。' },
  { style: '郑重礼貌', text: '老师您好，打扰了。我需要使用个人爱迪邮箱，烦请您将我的邮箱密码告知我。感谢老师。' },
  { style: '学生日常', text: '老师您好，我要登录爱迪邮箱，但是不清楚自己的邮箱密码。可以麻烦您发给我吗？谢谢。' },
  { style: '精简请求', text: '老师您好，请问可以将我的爱迪邮箱密码发给我吗？我需要登录邮箱。谢谢老师。' },
  { style: '友好说明', text: '老师您好，我正在尝试登录爱迪邮箱，但发现自己还不知道邮箱密码。麻烦您有空时发给我一下，谢谢老师。' },
  { style: '谨慎询问', text: '老师您好，请问您方便提供我的爱迪邮箱密码吗？我需要登录邮箱。麻烦您了，谢谢老师。' },
  { style: '完整说明', text: '老师您好，我还没有登录过自己的爱迪邮箱，目前也不知道邮箱密码。麻烦您将我的邮箱密码发给我，谢谢老师。' },
  { style: '非常客气', text: '老师您好，不好意思打扰您。我需要登录个人爱迪邮箱，但暂时不知道邮箱密码。方便时麻烦您发送给我，非常感谢。' },
  { style: '兄弟型', text: '哥们，来点爱迪邮箱密码吗？我想登录一下。' },
  { style: '鼓励型', text: '加油老师！你可以把爱迪邮箱密码发给我的！' },
  { style: '霸总型', text: '老师，三分钟之内，我要看到我的爱迪邮箱密码。' },
  { style: '卑微型', text: '老师老师，求求了，赏我一个爱迪邮箱密码吧。' },
  { style: '江湖型', text: '老师，在下想登录爱迪邮箱，还请赐密码一份。' },
  { style: '客服型', text: '尊敬的老师您好，我正在申请爱迪邮箱密码，请问可以安排发放吗？' },
  { style: '播音腔型', text: '老师您好，现在为您播报一则消息：我需要一份爱迪邮箱密码。' },
  { style: '悬疑型', text: '老师，爱迪邮箱的大门就在眼前，而我唯独缺少那串密码。' },
  { style: '勇者型', text: '老师，我准备进入爱迪邮箱冒险了，请赐予我通关密码。' },
  { style: '古风型', text: '老师安好，学生欲登录爱迪邮箱，恳请赐下密码。' },
  { style: '机器人型', text: '老师您好。检测到爱迪邮箱密码缺失。请求补充密码。' },
  { style: '热血型', text: '老师！为了成功登录爱迪邮箱，请把密码交给我吧！' },
  { style: '省流型', text: '老师您好，省流版：求一个我的爱迪邮箱密码，谢谢。' },
  { style: '暗号型', text: '老师您好，请问今天的爱迪邮箱登录暗号是什么？' },
  { style: '打工人型', text: '老师您好，登录爱迪邮箱这项工作还差一个密码，麻烦您支援一下。' },
]
const currentMessageIndex = ref(0)
const teacherMessage = ref(messages[currentMessageIndex.value].text)
const currentStyle = ref(messages[currentMessageIndex.value].style)
const copyStatus = ref('')

function randomizeMessage() {
  let nextIndex = currentMessageIndex.value
  while (nextIndex === currentMessageIndex.value) {
    nextIndex = Math.floor(Math.random() * messages.length)
  }
  currentMessageIndex.value = nextIndex
  teacherMessage.value = messages[nextIndex].text
  currentStyle.value = messages[nextIndex].style
  copyStatus.value = ''
}

async function copyMessage() {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(teacherMessage.value)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = teacherMessage.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copyStatus.value = '话术已复制'
  } catch {
    copyStatus.value = '复制失败，请手动复制文本框中的话术'
  }
}

function goBack() {
  router.back()
}

function goToHelpCenter() {
  router.push('/help/accounts')
}
</script>

<style scoped>
:root {
  --bg: #F4F7FE;
  --ink: #2B2C57;
  --card: #FFFFFF;
  --muted: rgba(43, 44, 87, 0.6);
}

.help-page {
  min-height: 100vh;
  background: var(--bg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--ink);
}

.header {
  background: var(--card);
  border: 1px solid rgba(43, 44, 87, 0.08);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  align-self: center;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}

.subtitle {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.content {
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  flex: 1;
}

.single-pane {
  width: 100%;
  max-width: 720px;
}

.card {
  background: var(--card);
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

.card-title,
.message-label {
  font-weight: 600;
  color: var(--ink);
}

.description {
  margin: 0 0 18px;
  color: var(--ink);
  line-height: 1.8;
}

.message-label {
  display: block;
  margin-bottom: 8px;
}

.message-box {
  width: 100%;
  resize: vertical;
  line-height: 1.6;
}

.message-footer,
.copy-row,
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.message-footer {
  margin-top: 4px;
}

.message-style {
  color: var(--muted);
}

.copy-row {
  margin-top: 8px;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compact-button {
  font-size: 13px;
  padding: 6px 10px !important;
}

.copy-status {
  color: var(--muted);
}

.actions {
  margin-top: 24px;
}

.glass {
  background: rgba(255, 255, 255, 0.85);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(43, 44, 87, 0.08);
}

:deep(.p-button) {
  background: #2B2C57 !important;
  border-color: #2B2C57 !important;
  color: #FFF !important;
}

:deep(.p-button:enabled:hover),
:deep(.p-button:enabled:focus) {
  background: #242555 !important;
  border-color: #242555 !important;
  box-shadow: 0 0 0 0.2rem rgba(43, 44, 87, 0.2) !important;
}

:deep(.p-button.p-button-text) {
  background: transparent !important;
  color: #2B2C57 !important;
  border-color: transparent !important;
}

:deep(.p-button.p-button-text:enabled:hover),
:deep(.p-button.p-button-text:enabled:focus) {
  background: rgba(43, 44, 87, 0.08) !important;
  color: #2B2C57 !important;
  box-shadow: none !important;
}

:deep(.p-inputtextarea:enabled:focus),
:deep(.p-inputtextarea:enabled:hover) {
  box-shadow: 0 0 0 0.2rem rgba(43, 44, 87, 0.2) !important;
  border-color: #2B2C57 !important;
}

@media (max-width: 520px) {
  .help-page {
    padding: 16px;
  }

  .actions,
  .copy-row {
    align-items: stretch;
    flex-direction: column;
  }

  .message-actions {
    align-self: flex-end;
    flex-direction: row;
  }

  .message-footer,
  .actions {
    align-items: stretch;
  }

  .copy-status {
    min-height: 18px;
  }
}
</style>
