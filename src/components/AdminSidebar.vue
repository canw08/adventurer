<template>
  <div class="sidebar">
    <div class="menu-list">
      <div
        class="menu-button"
        :class="{ active: isActive('/admin/home') }"
        @click="goToHome"
        v-ripple
      >
        <i class="pi pi-book icon"></i>
        <span class="label-text">后台主页</span>
      </div>

      <div
        class="menu-button"
        :class="{ active: isActive('/admin/audit') }"
        @click="goToAudit"
        v-ripple
      >
        <i class="pi pi-verified icon"></i>
        <span class="label-text">审核页面</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import 'primeicons/primeicons.css'

const router = useRouter()
const route = useRoute()

const goToHome = () => router.push('/admin/home')
const goToAudit = () => router.push('/admin/audit')
const isActive = (path) => route.path === path
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
  position: relative;
  justify-content: center;
}

.menu-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.menu-button {
  display: flex;
  align-items: center;
  padding: 16px 16px 16px 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 14px;
  background-color: #f3f7fe;
  color: #5067b0;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
  transform: translateZ(0);
  position: relative;
  overflow: hidden;
  z-index: 1;
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
  color: #fff;
}

.icon {
  margin-right: 30px;
  font-size: 1.2em;
}

.label-text {
  transform: translateY(-1px);
  display: inline-block;
  font-size: 20.5px;
}

.menu-button.active .label-text {
  color: #fff;
}
</style>
