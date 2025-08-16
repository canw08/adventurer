<template>
  <div class="outer-container">
    <!-- 左侧图片单独容器 -->
    <div class="photo-container">
      <img src="/login.jpg" alt="Login" class="login-image" />
    </div>

    <!-- 右侧原有login-box（只包含表单） -->
    <div class="login-box">
      <div class="form-area">
        <div class="form-group">
          <label for="name">姓名</label>
          <InputText v-model="name" id="name" />
        </div>

        <div class="form-group">
          <label for="account">账号</label>
          <InputText v-model="account" id="account" />
        </div>

        <div class="form-group">
          <label for="noodles">火鸡面好不好吃</label>
          <InputText v-model="noodles" id="noodles" />
        </div>

        <Button label="Enter" @click="goToNextPage" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

export default {
  components: { InputText, Button },
  setup() {
    const name = ref('');
    const account = ref('');
    const noodles = ref('');

    const goToNextPage = () => {
      console.log(name.value, account.value, noodles.value);
      // 这里写跳转逻辑
    };

    return { name, account, noodles, goToNextPage };
  },
};
</script>

<style scoped>
.outer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 24px; /* 图片和表单间距 */
  background: #f3f3f3;
  padding: 20px;
  box-sizing: border-box;
}

.photo-container {
  width: 500*(4/3)px;
  height: 500px;
  background: #e5e5e5;
  border-radius: 16px;
  overflow: visible; /* 确保图片完整显示 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 完整显示，保持比例 */
  border-radius: 16px;
  display: block;
}

.login-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 550px;
  height: 500px;
  padding: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: center;
  justify-content: center;
  gap: 20px;
  align-items: center;
}

.form-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

input.p-inputtext {
  width: 100%;
}

button.p-button {
  width: 100%;
}
</style>
