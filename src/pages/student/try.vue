<<!-- SliderCustom.vue -->
<template>
  <div class="slider-demo">
    <p>值：{{ value }}</p>
    <Slider v-model="value" :min="0" :max="100" />
  </div>
</template>

<style scoped>
::v-deep(.p-slider .p-slider-handle),
::v-deep(.p-slider .p-slider-handle:hover),
::v-deep(.p-slider .p-slider-handle:focus),
::v-deep(.p-slider .p-slider-handle:active) {
  width: 32px !important;
  height: 32px !important;
  background: url('/login.jpg') no-repeat center center !important;
  background-size: cover !important;
  border: none !important;
  border-radius: 4px !important; /* 方块，改0完全方形 */
  box-shadow: none !important;
  top: -12px !important;
  cursor: pointer !important;
  transition: transform 0.2s !important;
}

::v-deep(.p-slider .p-slider-handle:hover) {
  transform: scale(1.1) !important;
  /* 不要改背景，避免图片消失 */
}

::v-deep(.p-slider .p-slider-handle) {
  width: 32px !important;
  height: 32px !important;
  background: url('/login.jpg') no-repeat center center !important;
  background-size: cover !important;
  border: none !important;
  border-radius: 4px !important;
  box-shadow: none !important;
  top: -12px !important;
  cursor: pointer !important;
  position: relative !important;
  overflow: hidden !important;
}

/* 彻底隐藏 ::before 圆环 */
::v-deep(.p-slider .p-slider-handle)::before {
  content: none !important;
  display: none !important;
  background: none !important;
  box-shadow: none !important;
  border: none !important;
}

/* 悬停时也保持图片不变 */
::v-deep(.p-slider .p-slider-handle:hover) {
  transform: scale(1.1) !important;
  background: url('/login.jpg') no-repeat center center !important;
  background-size: cover !important;
}

</style>

>