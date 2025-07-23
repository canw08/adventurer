<template>
  <div class="login-container">
    <div class="login-image">
      <img src="/login.jpg" alt="Login Illustration" />
    </div>

    <div class="login-form">
      <Card class="w-full max-w-md">
        <template #title>
          登录
        </template>

        <template #content>
        <form @submit.prevent="handleLogin">
            <div class="p-fluid">
            <div class="form-item">
                <label for="email">邮箱</label>
                <InputText id="email" v-model="email" type="email" required />
            </div>

            <div class="form-item">
                <label for="password">密码</label>
                <Password id="password" v-model="password" toggleMask feedback="false" required />
            </div>

            <Button label="登录" type="submit" class="w-full mt-3" />
            </div>
        </form>
        </template>

      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'  // ✅ 正确，使用默认导入

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const email = ref('')
const password = ref('')

function handleLogin() {
  // 你可以替换为实际 API 请求
  console.log('登录信息：', { email: email.value, password: password.value })
  alert('登录成功！（模拟）')
}
</script>

<style scoped>
.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
}

.login-image {
  background-color: #f5f5f5;
}

.login-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.login-form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem; /* 原来是 2rem，现在加大 */
  background-color: white;
}

</style>
