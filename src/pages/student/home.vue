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
        <div class="menu-button active">
          <i class="pi pi-book mr-2"></i> My Projects
        </div>
        <div class="menu-button">
          <i class="pi pi-user mr-2"></i> My Task
        </div>
      </div>
    </div>

    <!-- 右侧 -->
    <div class="main-content">
      <!-- 顶部标题 -->
      <div class="main-header">
        <div class="header-left">My Projects</div>
        <div class="header-right-group">
          <span class="header-right">{{ runningProjects.length }} running project</span>
          <button class="notify-button">
            <i class="pi pi-bell"></i>
          </button>
        </div>
      </div>

      <!-- 欢迎 + 筛选 -->
      <div class="main-subheader">
        <span class="greeting">Good morning, adventurer</span>
        <div class="filter-buttons">
          <button :class="['filter-btn', activeTab === 'ongoing' ? 'active' : '']" @click="activeTab = 'ongoing'">
            Ongoing
          </button>
          <button :class="['filter-btn', activeTab === 'completed' ? 'active' : '']" @click="activeTab = 'completed'">
            Completed
          </button>
        </div>
      </div>

      <!-- 项目卡片区域 -->
      <div class="main-body">
        <!-- 空内容，等待后续填充 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Avatar from 'primevue/avatar';

const activeTab = ref('ongoing');

const allProjects = [
  { id: 1, title: 'Volunteer feeding the cat', date: '5 July, 2025', status: 'ongoing' },
  { id: 2, title: 'Clean up schoolyard', date: '20 May, 2025', status: 'completed' },
];

const filteredProjects = computed(() => allProjects.filter(p => p.status === activeTab.value));
const runningProjects = computed(() => allProjects.filter(p => p.status === 'ongoing'));
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
  padding: 32px 48px;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fb;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 8px;
  border-bottom: 2px solid #d5dbe5;
}

.header-left {
  font-size: 22px;
  font-weight: 700;
  color: #1e1e1e;
}

.header-right-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  color: #304ffe;
  font-size: 14px;
  font-weight: 500;
}

.notify-button {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #304ffe;
  margin-right: 6px;
}

.main-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
}

.greeting {
  font-style: italic;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  background-color: white;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background-color: #304ffe;
  color: white;
  border-color: #304ffe;
}

.main-body {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>