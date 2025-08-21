<template>
  <main class="mobile-wrap">
    <div class="card">
      <h1 class="title">私密马赛!</h1>
      <p class="desc">
        我们没有适配手机端，<br />
        请使用<strong>iPad/电脑</strong> 进行查看。<br />
        用手机是根本用不了的（经过我们测试）。
      </p>

      <!-- 烟花锚点：绑定到按钮 -->
      <button id="fire-btn" class="btn" @click="boom">
        真可惜:(
      </button>
    </div>
  </main>
</template>

<script setup>
import { useReward } from 'vue-rewards'
import { useTipBuddy } from '../composables/useTipBuddy.js'
const { show } = useTipBuddy()
let count = 0;
// 绑定到按钮 id
const { reward } = useReward('fire-btn', 'emoji', {
  elementCount: 50,
  spread: 70,
  startVelocity: 40,
  decay: 0.9,
  lifetime: 200,
})

function boom() {
  reward()
  count += 1
  if(count == 10)
    show('你已经点了10次了!!! 我要走了!!! 请使用电脑或平板访问本网站￣へ￣')

}
</script>

<style scoped>
.mobile-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F2F7FF;
  padding: 20px;
}

.card {
  max-width: 480px;
  padding: 28px 24px;
  border-radius: 20px;
  background: white;
  backdrop-filter: blur(10px);
  text-align: center;
  box-shadow: 0 12px 30px rgba(0,0,0,0.2);
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #bf3838;
}

.desc {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 24px;
}

.btn {
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 12px 20px;
  border-radius: 12px;
  background: #2A2C56;
  color: #F2F7FF;
  transition: transform .1s ease, background .2s ease;
}
.btn:hover {
  background: #1d1f3f;
}
.btn:active {
  transform: scale(0.96);
}
</style>

<route lang="yaml">
meta:
  layout: false
</route>
