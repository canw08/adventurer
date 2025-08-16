<template>
  <div class="sidebar" v-if="userStore.userInfo">
    <div class="profile-header">
      <img
        :src="`https://api.dicebear.com/9.x/adventurer/svg?seed=${userStore.userInfo.avatar}`"
        alt="User Avatar"
        class="avatar-img"
      />
      <h2 class="user-name">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</h2>
      <p class="user-id">ID {{ userStore.userInfo.identifier }}</p>
    </div>

    <div class="menu-list">
      <div
        class="menu-button"
        :class="{ active: isActive('/student/home') }"
        @click="goToLog"
        v-ripple
      >
        <i class="pi pi-book icon"></i>
        <span class="label-text">Home</span>
      </div>
      <div
        class="menu-button"
        :class="{ active: isActive('/student/task') }"
        @click="goToBoard"
        v-ripple
      >
        <i class="pi pi-user icon"></i>
        <span class="label-text">Board</span>
      </div>
      <div
        class="menu-button"
        :class="{ active: isActive('/student/team') }"
        @click="goToTeam"
        v-ripple
      >
        <i class="pi pi-user icon"></i>
        <span class="label-text">Team</span>
      </div>
    </div>

    <!-- 新增底部图片 -->
    <div class="sidebar-footer">
      <img src="../assets/sidebar.png" alt="Footer Image" class="footer-img" />
    </div>
  </div>

  <div v-else>
    加载中...
  </div>
</template>


<script setup>
import Avatar from 'primevue/avatar';
import { useRouter, useRoute } from 'vue-router';
import 'primeicons/primeicons.css';
import { onMounted } from 'vue';
import { useUserStore } from '../stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const defaultAvatar = 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png';

const goToLog = () => {
  router.push('/student/home');
};
const goToBoard = () => {
  router.push('/student/task');
};
const goToTeam = () => {
  router.push('/student/team');
};
const isActive = (path) => route.path === path;

onMounted(async () => {
  try {
    await userStore.fetchUser();
  } catch {
    // 可做错误提示
  }
});
</script>

<style scoped>
.sidebar {
  width: 300px;
  background-color: #f3f7fe;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  border-right: 1px solid #e3eaf5;
}
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 0px;
  margin-top: 40px;
}
.user-name
{
  margin-top: -2px;
}
.user-id {
  background-color: #e6e6e6;
  padding: 4px 10px;
  border-radius: 999px;
  margin-top: -20px;
  font-size: 14px;
  color: #a2a0a0;
}
.menu-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
}
.menu-button {
  display: flex;
  align-items: center;
  padding: 16px;
  padding-left: 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 14px;
  background-color: #f3f7fe;
  color: #5067b0;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  transform: scale(1);
  position: relative;
  overflow: hidden;
  z-index: 1
}
.menu-button:hover {
  transform: scale(1.03);
  background-color: #e0e8ff;
}
.menu-button:active {
  transform: scale(0.96);
}
.menu-button.active {
  background-color: #2a2c56;
  color: white;
}
.icon {
  margin-right: 30px;
  font-size: 1.2em;
}
.label-text {
  transform: translateY(-3px);
  display: inline-block;
  font-size: 20.5px;
}

.avatar-img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-color: #fff;
}

.sidebar {
  position: relative; /* 让子元素可以绝对定位 */
}

.sidebar-footer {
  position: absolute;
  bottom: 53px;    /* 往下移出 sidebar 底部，可以调大/调小 */
  left: 50%;
  transform: translateX(-50%) scale(1.5); /* 水平居中 + 放大 */

  pointer-events: none; /* 👈 关键：让下面的按钮可点 */
  z-index: 0; 
}

.footer-img {
  width: 200px;   /* 控制宽度 */
  height: auto;
  pointer-events: none; /* 如果只作为装饰，不阻挡点击 */

}



</style>
