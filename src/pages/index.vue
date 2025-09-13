<template>
  <div class="page">
    <!-- 背景 -->
    <div class="bg"></div>

    <!-- 输入：ID -->
    <input
      v-model.trim="id"
      type="text"
      :placeholder="$t('login.username')"
      class="input glass"
      :class="{ invalid: touched.id && errors.id }"
      @blur="touch('id')"
      @keydown.enter="login"
      aria-label="User ID"
      autocomplete="username"
    />
    <p v-if="touched.id && errors.id" class="err">{{ errors.id }}</p>

    <!-- Input: Password -->
    <input
      v-model="password"
      :type="showPwd ? 'text' : 'password'"
      :placeholder="$t('login.password')"
      class="input glass"
      :class="{ invalid: touched.password && errors.password }"
      @blur="touch('password')"
      @keydown.enter="login"
      aria-label="Password"
      autocomplete="current-password"
    />
    <p v-if="touched.password && errors.password" class="err">{{ errors.password }}</p>

    <!-- 行为按钮 -->
    <button
      class="btn glass"
      @click="login"
      :disabled="submitting || !canSubmit"
      :aria-busy="submitting ? 'true' : 'false'"
      :title="btnTitle"
    >
      <span v-if="!submitting" class="arrow">➜</span>
      <span v-else class="loading">Loading…</span>
    </button>

    <!-- 统一错误提示（接口错误等） -->
    <p v-if="serverError" class="err global">{{ serverError }}</p>

    <!-- 黑场过渡层 -->
    <div class="blackout" :class="{ show: fading }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref,onMounted  } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from '../stores/user'
const router = useRouter();

// 表单状态
const id = ref("");
const password = ref("");
const showPwd = ref(false);

// 交互/视觉状态
const fading = ref(false);
const submitting = ref(false);
const serverError = ref("");

// 触碰态：只在用户“碰过”后才显示错误，避免一上来就红
const touched = reactive({ id: false, password: false });

// 校验错误
const errors = reactive<{ id: string | null; password: string | null }>({
  id: null,
  password: null,
});

const FADE_MS = 800; // 与 CSS 中 transition 保持一致

// ======= 校验逻辑 =======
const idPattern = /^[A-Za-z0-9_]{3,32}$/;

function validateId(): string | null {
  return null;
}

function validatePassword(): string | null {
  return null;
}

function validateAll() {
  errors.id = validateId();
  errors.password = validatePassword();
  return !errors.id && !errors.password;
}

function touch(field: "id" | "password") {
  touched[field] = true;
  // 即时校验该字段
  if (field === "id") errors.id = validateId();
  if (field === "password") errors.password = validatePassword();
}

// 是否可提交
const canSubmit = computed(() => {
  // 未触碰也允许点击，由 login 内部二次校验兜底
  return !submitting.value && id.value.length > 0 && password.value.length > 0;
});

const btnTitle = computed(() =>
  submitting.value ? "正在提交…" : canSubmit.value ? "登录" : "请先填写表单"
);

// ======= 登录提交 =======
async function login() {
  if (fading.value || submitting.value) return; // 防抖
  // 首次点击时，标记为 touched 以显示错误
  touch("id");
  touch("password");

  serverError.value = "";

  // 强制全表单校验
  if (!validateAll()) {
    return;
  }

  submitting.value = true;
  try {
    // 说明：
    // 后端可能期望 username/password 或 id/password，这里两个字段都带上，便于兼容。
    const payload = {
      username: id.value,
      password: password.value,
    };

    const resp = await fetch("/api/users/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 如果你做了跨域，需要服务端允许，或在本地同源下使用 Mock.js
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      // 尝试解析后端返回的错误信息
      let msg = `登录失败（${resp.status}）`;
      try {
        const data = await resp.json();
        if (data?.error) msg = String(data.error);
        if (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) {
          msg = String(data.non_field_errors[0]);
        }

      } catch {
        // ignore JSON parse error
      }
      throw new Error(msg);
    }

    const data = (await resp.json()) as {
      access_token: string;
      refresh_token: string;
      username: string;
    };

    if (!data?.access_token || !data?.refresh_token) {
      throw new Error("登录返回数据不完整，缺少令牌");
    }

    // 持久化（按需调整为 cookie / pinia / vuex）
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("username", data.username ?? id.value);

    const userStore = useUserStore();
    const user = await userStore.fetchUser();

    // 更稳的判空：空串 / null / undefined / 只包含空白 都当作“没头像”
    const noAvatar = !user?.avatar || String(user.avatar).trim() === "none";
    
    if (noAvatar) {
      // 成功：黑幕淡入 -> 路由跳转
      fading.value = true;
      window.setTimeout(() => {
        router.push("/animations/login"); // TODO: 改成你的目标路由
      }, FADE_MS);
    }
    else
    {
      router.push("/student/home")
    }

  } catch (err: any) {
    serverError.value = err?.message || "登录失败，请稍后重试";
  } finally {
    submitting.value = false;
  }
}
// ======= Token 工具：检查本地 token 是否过期（JWT 常见做法）=======
function isJwtValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const base64 = token.split(".")[1];
    if (!base64) return false;
    const json = JSON.parse(decodeURIComponent(atob(base64).split("").map(c =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join("")));
    if (typeof json.exp !== "number") return true; // 无 exp 当作有效（由接口再兜底）
    return json.exp * 1000 > Date.now();
  } catch {
    // 不是标准 JWT，交由服务端/接口兜底
    return true;
  }
}
onMounted(async () => {
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  // 有 token 且看起来没过期，则尝试拉取用户信息并按业务跳转
  if (access && refresh && isJwtValid(access)) {
    try {
      const userStore = useUserStore();
      const user = await userStore.fetchUser(); // 若后端校验失败会抛错

      const noAvatar = !user?.avatar || String(user.avatar).trim() === "none";
      if (noAvatar) {
        // 与登录成功后的逻辑保持一致（黑幕淡入后跳转）
        fading.value = true;
        window.setTimeout(() => {
          router.replace("/animations/login");
        }, FADE_MS);
      } else {
        router.replace("/student/home");
      }
    } catch {
      // token 失效或网络错误：留在登录页即可，用户可以重新登录
    }
  }
});

</script>

<style scoped>
/* 基础清理，避免出现细小滚动条 */
:root, html, body {
  height: 100%;
}
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;          /* 防止出现轻微滚动 */
  overscroll-behavior: none; /* 阻止回弹 */
}

/* ====== 页面与背景 ====== */
.page {
  position: relative;
  width: 100vw;

  height: 100vh;
  height: 100svh;
  height: 100dvh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: clip;
  padding: 0 20px;
  padding-top: 100px;
}
@supports not (overflow: clip) {
  .page { overflow: hidden; }
}

/* 背景：public 下的资源用绝对路径 /image/... */
.bg {
  position: absolute;
  inset: 0;
  background-image: url("/image/login-real.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  background-color: #E7F0F9;
  z-index: 0;
}

/* ====== 玻璃基类 ====== */
.glass {
  background: rgba(255, 255, 255, 0.14);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

/* ====== 输入/错误 ====== */
.input {
  width: 100%;
  max-width: 320px;
  padding: 22px 14px 22px 22px;
  color: #fff;
  outline: none;
  border: 1px solid rgba(255,255,255,0.38);
  background: rgba(255, 255, 255, 0.10);
  -webkit-appearance: none;
  appearance: none;
  font-size: 16px;
  letter-spacing: 0.2px;
  z-index: 1;
}
.input + .input {
  margin-top: 10px;
}
.input::placeholder { color: #ffffffaa; }
.input:focus {
  background: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 0 0 2px rgba(180, 220, 255, 0.45);
}
.input.invalid { border-color: #ff9aa2; }

.err {
  margin: 4px 2px 2px;
  padding: 0 4px;
  max-width: 320px;
  font-size: 12px;
  color: #ffe6e9;
  text-shadow: 0 1px 0 rgba(0,0,0,0.25);
  z-index: 1;
}
.err.global {
  text-align: center;
  margin-top: 8px;
}

/* ====== 按钮 ====== */
.btn {
  width: 100%;
  max-width: 60px;
  margin-top: 6px;
  padding: 12px 14px;
  color: #fff;
  font-weight: 700;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.45);
  background: linear-gradient(
      to bottom,
      rgba(255,255,255,0.18),
      rgba(255,255,255,0.10)
    ),
    rgba(255,255,255,0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  z-index: 1;
  margin-left: 260px;
}
.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.btn:hover:not([disabled]) {
  transform: translateY(-1px);
  background: linear-gradient(
      to bottom,
      rgba(255,255,255,0.22),
      rgba(255,255,255,0.14)
    ),
    rgba(255,255,255,0.16);
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.btn:active:not([disabled]) {
  transform: translateY(0);
  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.arrow { font-size: 16px; line-height: 1; }
.loading { font-size: 12px; letter-spacing: .5px; }

/* ====== 黑场过渡层 ====== */
.blackout {
  position: fixed;
  inset: 0;
  background: #000;
  opacity: 0;
  transition: opacity 800ms ease;
  pointer-events: none;
  z-index: 9999;
}
.blackout.show {
  opacity: 1;
  pointer-events: auto;
}

/* ====== 降级方案 ====== */
@supports not ((backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px))) {
  .glass { background: rgba(255, 255, 255, 0.75); }
}
</style>
