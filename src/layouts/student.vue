<template>
  <div class="layout-container">
    <!-- 左栏 -->
    <div class="sidebar">
      <div class="profile-header">
        <Avatar
          image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
          shape="circle"
          size="xlarge"
        />
        <h2>Bridgette - 文碧之</h2>
        <p class="user-id">ID 12345678975</p>
      </div>
      <div class="menu-list">
        <div
          class="menu-button"
          :class="{ active: activeTab === 'projects' }"
          @click="activeTab = 'projects'"
        >
          <i class="pi pi-book mr-2"></i> My Projects
        </div>
        <div
          class="menu-button"
          :class="{ active: activeTab === 'tasks' }"
          @click="activeTab = 'tasks'"
        >
          <i class="pi pi-user mr-2"></i> My Task
        </div>
      </div>
    </div>

    <!-- 右侧主区 -->
    <div class="main-content">
      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import Avatar from 'primevue/avatar'

const activeTab = ref('projects')
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fb;
  font-family: 'Segoe UI', sans-serif;
}

.sidebar {
  width: 280px;
  background-color: #e9f0fb;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.profile-header h2 {
  font-size: 18px;
  font-weight: bold;
  color: #1e1e1e;
}

.user-id {
  font-size: 12px;
  color: #999;
  background: #dbe5f1;
  padding: 4px 8px;
  border-radius: 8px;
}

.menu-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  background-color: white;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.menu-button:hover {
  background-color: #dde8f2;
}

.menu-button.active {
  background-color: #304ffe;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fb;
  padding: 32px 48px;
}

.main-content header {
  font-size: 22px;
  font-weight: 700;
  color: #1e1e1e;
  padding-bottom: 8px;
  border-bottom: 2px solid #d5dbe5;
}

.main-content main {
  flex: 1;
  margin-top: 16px;
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
}

.main-content footer {
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px solid #ddd;
  color: #999;
  font-size: 14px;
}
</style>
