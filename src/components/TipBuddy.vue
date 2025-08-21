<template>
  <Teleport to="body">
    <transition name="tip-buddy-rise">
      <div v-if="open" class="tip-buddy" role="dialog" aria-live="polite">
        <div class="tip-buddy__avatar pixelated">
          <img :src="avatar" alt="" />
        </div>
        <div class="tip-buddy__bubble">
          <button class="tip-buddy__close" aria-label="关闭提示" @click="$emit('close')">×</button>
          <p class="tip-buddy__text">{{ message }}</p>
          <div class="tip-buddy__tail"></div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  message: { type: String, default: '' },
  // 头像你也不需要改，这里给个固定默认值；要换就改这儿的默认路径即可
  avatar: { type: String, default: '../assets/solo.png' }
})
defineEmits(['close'])
</script>

<style scoped>
.tip-buddy-pop-enter-from, .tip-buddy-pop-leave-to {
  opacity: 0; transform: translate(-10px, 10px) scale(0.96);
}
.tip-buddy-pop-enter-active, .tip-buddy-pop-leave-active {
  transition: all .18s ease-out;
}
.tip-buddy {
  position: fixed;
  left: 5px; bottom: 5px; z-index: 9999;
  display: flex; align-items: flex-end; gap: 10px;
  pointer-events: none;
}
.tip-buddy__avatar {
  width: 200px; height: 200px; flex: 0 0 auto;
  pointer-events: auto; filter: drop-shadow(0 3px 6px rgba(0,0,0,.2));
  animation: buddy-bob 2.4s ease-in-out infinite; transform-origin: 50% 90%;
}
.tip-buddy__avatar img { width: 100%; height: 100%; object-fit: contain; user-select: none; -webkit-user-drag: none; }
@keyframes buddy-bob { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-2px)} }

.tip-buddy__bubble {
  pointer-events: auto; position: relative; max-width: min(70vw, 380px);
  background: #fff; color: #222; border-radius: 12px; padding: 12px 36px 12px 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,.12); border: 1px solid rgba(0,0,0,.06);
    margin-bottom: 90px; /* 数字越大，气泡离小人更远 */
    margin-left: -50px;
}
.tip-buddy__tail {
  position: absolute;
  /* 让小三角“长在”气泡左边缘，垂直居中 */
  left: -8px;                /* 负值把三角放到气泡外侧 */
  top: 50%;
  transform: translateY(-50%);

  width: 0; height: 0;
  /* 使用“左指向”的边框三角形：
     左边是实心白色，其他方向透明 */
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #fff;

  /* 给小三角加一点阴影感 */
  filter: drop-shadow(0 2px 2px rgba(0,0,0,.06));
}
.tip-buddy__close {
  position: absolute; right: 8px; top: 6px; width: 24px; height: 24px;
  border: 0; background: transparent; font-size: 18px; line-height: 24px; cursor: pointer; color: #666;
}
.tip-buddy__text { margin: 0; line-height: 1.5; font-size: 14px; }


/* 进入动画：从屏幕下方钻出并带一点反弹 */
@keyframes buddy-bounce-in {
  0%   { transform: translateY(120%) scale(1); opacity: 0; }
  60%  { transform: translateY(-3px) scale(1.01); opacity: 1; }
  80%  { transform: translateY(1px)  scale(1.00); }
  90%  { transform: translateY(-0.5px); }
  100% { transform: translateY(0); }
}



/* 离场动画：轻轻落回去 */
@keyframes buddy-bounce-out {
  0%   { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(120%); opacity: 0; }
}

/* Vue 过渡钩子类（与 <transition name="tip-buddy-rise"> 对应） */
.tip-buddy-rise-enter-active {
  animation: buddy-bounce-in 920ms cubic-bezier(.22,1,.36,1) both;
}
.tip-buddy-rise-leave-active {
  animation: buddy-bounce-out 240ms ease-in both;
}
/* 为了确保初始/结束状态更自然，可加上 from/to 的透明度 */
.tip-buddy-rise-enter-from,
.tip-buddy-rise-leave-to {
  opacity: 0;
}

/* 减少动画：尊重系统「减少动态效果」设置 */
@media (prefers-reduced-motion: reduce) {
  .tip-buddy-rise-enter-active,
  .tip-buddy-rise-leave-active {
    animation: none;
    transition: opacity .15s ease;
  }
  .tip-buddy-rise-enter-from,
  .tip-buddy-rise-leave-to {
    opacity: 0;
  }
}

/* 容器整体做 bounce，头像/气泡做轻微补间 */
.tip-buddy__avatar,
.tip-buddy__bubble {
  pointer-events: auto; /* 保持可交互 */
}

/* 气泡晚一点点“跟随” */
.tip-buddy-rise-enter-active .tip-buddy__bubble {
  animation: bubble-follow 480ms ease-out both;
  animation-delay: 190ms; /* 比头像晚 90ms */
}
@keyframes bubble-follow {
  0%   { transform: translateY(14px); opacity: 0; }
  60%  { transform: translateY(-3px); opacity: 1; }
  100% { transform: translateY(0); }
}

</style>
