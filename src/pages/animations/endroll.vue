<template>
  <div class="credits-container">

    <!-- 跳过按钮 -->
    <button class="skip-button" @click="goBack">跳过</button>

    <div class="credits" ref="credits">
      <div class="title">特别鸣谢</div>

      <div v-for="(person, index) in people" :key="index" class="credit-item">
        {{ person }}
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "MovieCredits",

  data() {
    return {
      people: [
        "王天瑞 - Eric ———— GalGame大师",
        "洪天明 - Tim ———— 炉石传说大师",
        "李爱璐 - Light ———— 艺高人胆大",
        "王瀚国 - Louis ———— 隔壁间谍"
      ]
    };
  },

  mounted() {
    this.startCredits();
  },

  methods: {
    startCredits() {

      const credits = this.$refs.credits;

      const contentHeight = credits.offsetHeight; // 字幕高度
      const screenHeight = window.innerHeight;    // 屏幕高度

      const totalDistance = contentHeight + screenHeight;

      const speed = 80; // 像素/秒（可调）

      const duration = totalDistance / speed;

      // 设置动画时间
      credits.style.animationDuration = duration + "s";

      // 动画结束后返回
      setTimeout(() => {
        this.goBack();
      }, duration * 1000);
    },

    goBack() {
      if (this.$router) {
        this.$router.back();
      } else {
        window.history.back();
      }
    }
  }
};
</script>

<style scoped>

.credits-container {
  background: black;
  color: white;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  font-size: 28px;
  font-family: Arial, sans-serif;
  position: relative;
}

.skip-button {
  position: absolute;
  top: 20px;
  right: 30px;
  background: rgba(255,255,255,0.15);
  color: white;
  border: 1px solid white;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 6px;
}

.skip-button:hover {
  background: rgba(255,255,255,0.3);
}

.credits {
  text-align: center;
  animation: scrollCredits linear;
}

.title {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 40px;
}

.credit-item {
  margin: 20px 0;
}

@keyframes scrollCredits {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(-100%);
  }
}

</style>