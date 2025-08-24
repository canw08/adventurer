<route lang="yaml">
meta:
  allowMobile: true
</route>
<template>
  <div class="error-page">
    <h1>{{ code }}</h1>
    <p class="message">{{ message }}</p>
    <p class="hint">{{ hint }}</p>
    <button @click="goHome">🏠 返回首页</button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useTipBuddy } from '../composables/useTipBuddy'
import { onMounted } from 'vue'
const { show } = useTipBuddy()

onMounted(() => {
    show('给我干哪来了?! 这还是国内吗w(ﾟДﾟ)w')
})

// 接收错误码
const props = defineProps({
  code: {
    type: Number,
    default: 403,
  },
});

const router = useRouter();

// 不同错误码的文案
const messages = {
  403: {
    message: "禁止访问 / Forbidden",
    hint: "你没有权限进入这里 (Oops, no permission!)",
  },
  404: {
    message: "页面丢失 / Not Found",
    hint: "你要找的页面不在这 (Page vanished into the void...)",
  },
  500: {
    message: "服务器出错 / Server Error",
    hint: "后台睡着了 (Server is taking a nap 😴)",
  },
};

const message = computed(() => messages[props.code]?.message || "未知错误 / Unknown Error");
const hint = computed(() => messages[props.code]?.hint || "发生了一点小问题 (Something went wrong)");

function goHome() {
  router.push("/");
}
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  font-family: "Segoe UI", system-ui, sans-serif;
  color: #444;
}
h1 {
  font-size: 6rem;
  margin: 0;
  color: #ff6b6b;
}
.message {
  font-size: 1.5rem;
  margin: 1rem 0;
}
.hint {
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
}
button {
  background: #4cafef;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}
button:hover {
  background: #3498db;
}
</style>
