<template>
  <div class="review-page">

    <!-- ===== 上半部分 ===== -->
    <div class="review-top">

      <div v-if="currentTask" class="task-layout">

        <!-- 左侧图片 -->
        <div class="task-image">
          <img
            v-if="currentTask.image"
            :src="currentTask.image"
          />
          <div v-else class="image-placeholder">
            No Image
          </div>
        </div>

        <!-- 右侧信息 -->
        <div class="task-info">

          <h2 class="title">
            {{ currentTask.title }}
          </h2>

          <p class="desc">
            {{ currentTask.description }}
          </p>

          <div class="meta">
            <p><b>Publisher:</b> {{ currentTask.publisher_nickname }}</p>
            <p><b>Deadline:</b> {{ currentTask.deadline }}</p>
            <p><b>Reward EXP:</b> {{ currentTask.experience_reward }}</p>
            <p><b>Reward Token:</b> {{ currentTask.token_reward }}</p>
            <p><b>Volunteer Time:</b> {{ currentTask.volunteerTime_reward }}</p>
            <p><b>Required Level:</b> {{ currentTask.required_level }}</p>
          </div>

        </div>

      </div>

      <div v-else class="no-task">
        No more tasks to review
      </div>

    </div>

    <!-- ===== 分割线 ===== -->
    <div class="divider"></div>

    <!-- ===== 下半部分 ===== -->
    <div class="review-bottom">

      <button
        class="approve-btn"
        @click="approveTask"
      >
        ✔ 批准
      </button>

      <button
        class="cancel-btn"
        @click="rejectTask"
      >
        ✖ Cancel
      </button>

    </div>

  </div>
</template>


<script setup>

import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const tasks = ref([])
const index = ref(0)

const currentTask = computed(() => {
  return tasks.value[index.value]
})

async function loadTasks() {

  const res = await axios.get('/api/tasks/my-tasks/')
  tasks.value = res.data

}

function nextTask() {
  index.value++
}

function approveTask() {

  console.log('approved', currentTask.value?.id)
  nextTask()

}

function rejectTask() {

  console.log('rejected', currentTask.value?.id)
  nextTask()

}

onMounted(() => {
  loadTasks()
})

</script>


<style scoped>

.review-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ===== 上半部分 ===== */

.review-top {
  flex: 7;
  padding: 24px;
}

.task-layout {
  display: flex;
  height: 100%;
  gap: 24px;
}

/* 图片 3 */
.task-image {
  flex: 3;
}

.task-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.image-placeholder {
  background: #eee;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

/* 文字 7 */

.task-info {
  flex: 7;
}

.title {
  margin-bottom: 12px;
}

.desc {
  margin-bottom: 20px;
  line-height: 1.6;
}

.meta p {
  margin: 4px 0;
}


/* ===== 分割线 ===== */

.divider {
  height: 1px;
  background: #ddd;
  margin: 0 20px;
}


/* ===== 下半部分 ===== */

.review-bottom {
  flex: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
}

/* 批准按钮 */

.approve-btn {
  background: #2ecc71;
  color: white;
  border: none;
  font-size: 20px;
  padding: 16px 40px;
  border-radius: 10px;
  cursor: pointer;
}

.approve-btn:hover {
  background: #27ae60;
}

/* 取消按钮 */

.cancel-btn {
  background: #e74c3c;
  color: white;
  border: none;
  font-size: 20px;
  padding: 16px 40px;
  border-radius: 10px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #c0392b;
}

.no-task {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 20px;
}

</style>