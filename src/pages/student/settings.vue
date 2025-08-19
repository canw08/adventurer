<template>
  <div class="main-content">
    <!-- 顶部标题栏，仅保留标题与底部分割线 -->
    <div class="main-header">
      <div class="header-left-group">
        <span class="header-left">{{ $t('settings.title') }}</span>
      </div>
    </div>

    <!-- 主体区域：保留原先浅蓝背景与边框，供后续设置项放置 -->
    <div class="main-body">
      <!-- 这里放你的 Setting 内容（表单/开关/卡片等） -->
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: "student"
</route>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
/* ====== 保留的核心布局与配色（沿用你原本的风格） ====== */

/* 右侧主容器：白底 + 外边框 + 圆角 */
.main-content {
  flex: 1;
  padding: 4px 48px;            /* 原样保留 */
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #ffffff;     /* 白底 */
  border: 0px solid #e4eaf4;     /* 外边框 */
  border-radius: 12px;
}

/* 顶部标题栏：保留底部分割线与高度 */
.main-header {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #d5dbe5;
  padding: 4px 0;
  height: 64px;                  /* 原高度 */
}

/* 左侧标题组（只留标题本身） */
.header-left-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 标题样式：沿用原字号与粗细 */
.header-left {
  font-size: 28px;
  font-weight: 800;
  color: #1e1e1e;
}

/* 主体区：保留浅蓝背景、内边距、边框与圆角 */
.main-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  overflow: auto;
  background-color: #f3f7fe;     /* 浅蓝背景（保留原风格） */
  border: 1px solid #e4eaf4;     /* 内层边框（保留原风格） */
  margin-top: 50px;               /* 与头部保持呼吸感 */
  padding: 24px;                 /* 给设置项留白 */
}
</style>
