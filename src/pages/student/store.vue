<template>
  <div class="main-content">
    <!-- 顶部标题栏 -->
    <div class="main-header">
      <div class="header-left-group">
        <span class="header-left">商店(要翻译!!!)</span>
      </div>
    </div>

      <!-- 商店功能按钮 -->
    <div class="store-toolbar">
        <button class="store-btn">
        商品
        </button>
    </div>

   <!-- 主体卡片（浅蓝背景） -->
    <!-- 主体卡片（浅蓝背景） -->
    <div class="main-body two-column">
      <!-- 左侧：原有设置内容 -->
      <div class="left-panel">
        <section class="block">
        </section>
        
        <!-- 示例产品展示框 -->
        <div class="product-card">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxh9Pn1t9AALRLCBwG90kcSQj1r1kxqvDFWw&s" alt="瑞幸咖啡">
          <div class="product-title">瑞幸咖啡</div>
          <div class="product-description">
            这个咖啡是瑞幸的，它的配料是张忠泽, 不知道, 和橙子。它非常的好喝。
          </div>
          <div class="product-footer">
            <div class="product-price">
                <img src="../../assets/icon/token.png" alt="token" style="width:20px; height:20px; vertical-align:middle; margin-right:0px;">
                32
            </div>
            <button class="product-buy-btn">购买</button>
          </div>
        </div>

        <!-- 第二个产品展示框 -->
        <div class="product-card">
        <img src="https://www.zhanlu.com.tw/wp-content/uploads/2023/12/d5b715852e9014d4254650a4e7ba30c0.jpg" alt="瑞幸咖啡2">
        <div class="product-title">瑞幸拿铁</div>
        <div class="product-description">
            这是一款瑞幸拿铁，配料是牛奶, 咖啡, 糖，非常好喝。
        </div>
        <div class="product-footer">
            <div class="product-price">
            <img src="../../assets/icon/token.png" alt="token" style="width:20px; height:20px; vertical-align:middle; margin-right:0px;">
            35
            </div>
            <button class="product-buy-btn">购买</button>
        </div>
        </div>

        <!-- 第三个产品展示框 -->
        <div class="product-card">
        <img src="https://www.zhanlu.com.tw/wp-content/uploads/2023/12/d5b715852e9014d4254650a4e7ba30c0.jpg" alt="瑞幸咖啡2">
        <div class="product-title">瑞幸拿铁</div>
        <div class="product-description">
            这是一款瑞幸拿铁，配料是牛奶, 咖啡, 糖，非常好喝。
        </div>
        <div class="product-footer">
            <div class="product-price">
            <img src="../../assets/icon/token.png" alt="token" style="width:20px; height:20px; vertical-align:middle; margin-right:0px;">
            35
            </div>
            <button class="product-buy-btn">购买</button>
        </div>
        </div>

        <!-- 第四个产品展示框 -->
        <div class="product-card">
        <img src="https://www.zhanlu.com.tw/wp-content/uploads/2023/12/d5b715852e9014d4254650a4e7ba30c0.jpg" alt="瑞幸咖啡2">
        <div class="product-title">瑞幸拿铁</div>
        <div class="product-description">
            这是一款瑞幸拿铁，配料是牛奶, 咖啡, 糖，非常好喝。
        </div>
        <div class="product-footer">
            <div class="product-price">
            <img src="../../assets/icon/token.png" alt="token" style="width:20px; height:20px; vertical-align:middle; margin-right:0px;">
            35
            </div>
            <button class="product-buy-btn">购买</button>
        </div>
        </div>

         <!-- 第五个产品展示框 -->
        <div class="product-card">
        <img src="https://www.zhanlu.com.tw/wp-content/uploads/2023/12/d5b715852e9014d4254650a4e7ba30c0.jpg" alt="瑞幸咖啡2">
        <div class="product-title">瑞幸拿铁</div>
        <div class="product-description">
            这是一款瑞幸拿铁，配料是牛奶, 咖啡, 糖，非常好喝。
        </div>
        <div class="product-footer">
            <div class="product-price">
            <img src="../../assets/icon/token.png" alt="token" style="width:20px; height:20px; vertical-align:middle; margin-right:0px;">
            35
            </div>
            <button class="product-buy-btn">购买</button>
        </div>
        </div>

        <!-- 第六个产品展示框 -->
        <div class="product-card">
        <img src="https://www.zhanlu.com.tw/wp-content/uploads/2023/12/d5b715852e9014d4254650a4e7ba30c0.jpg" alt="瑞幸咖啡2">
        <div class="product-title">瑞幸拿铁</div>
        <div class="product-description">
            这是一款瑞幸拿铁，配料是牛奶, 咖啡, 糖，非常好喝。
        </div>
        <div class="product-footer">
            <div class="product-price">
            <img src="../../assets/icon/token.png" alt="token" style="width:20px; height:20px; vertical-align:middle; margin-right:0px;">
            35
            </div>
            <button class="product-buy-btn">购买</button>
        </div>
        </div>

      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: "student"
  requiresAuth: true
  roles: ['student']
</route>
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../i18n/index.js'   // 👈 引入你写的 setLocale 方法
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
const userStore = useUserStore();
const router = useRouter();
const { locale, t } = useI18n()

const SHORTCUT_DOT_KEY = 'settings.shortcutDotDismissed'  // 记忆小红点是否已消失
const showShortcutDot = ref(localStorage.getItem(SHORTCUT_DOT_KEY) !== '1')


// 在这里扩展语言即可
const languages = ref([
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文' },
  { code: 'flip-en', label: 'ɥsᴉlƃuƎ dᴉlℲ' },
  // { code: 'jp', label: '日本語' } // 扩展示例
])

const changeLang = async (code) => {
  await setLocale(code)    // 👈 调用封装好的方法
}

const ackOpen = ref(false)
const ackNames = [
  '王天瑞Eric', "洪天明Tim", "李爱璐Light", "王瀚国Louis"
]

const onSignOut = () => {
  // TODO: 接入你的登出逻辑
  localStorage.setItem("access_token", "");
  localStorage.setItem("refresh_token", "");
  userStore.clearUser()
  router.push('/');
  console.log('Sign out clicked')
}

const onSaveShortcut = () => {
  sessionStorage.setItem('visitedFromHomeIcon', '1')
  router.push('/help/addToHome');
  showShortcutDot.value = false
  localStorage.setItem(SHORTCUT_DOT_KEY, '1')
}

const createProductCard = (title, description, price) => {
  return {
    title,
    description,
    price,
    image: '', // 预留图片路径
  }
}
</script>

<style scoped>
/* ===== 商店顶部按钮 ===== */
.store-toolbar {
  margin-top: 12px;
  margin-bottom: 12px;
  display: flex;
}

.store-btn {
  height: 40px;
  padding: 0px 44px;
  border-radius: 12px;
  border: none;
  background: #2a2c55; /* 深蓝色 */
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(42,44,85,0.25);
}

.store-btn:hover {
  background: #24264a;
}

/* ===== 保留原布局与配色 ===== */
.main-content {
  flex: 1;
  padding: 4px 48px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 12px;
}

.main-header {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #d5dbe5;
  padding: 4px 0;
  height: 64px;
}
.header-left-group { display: flex; align-items: center; gap: 16px; }
.header-left { font-size: 28px; font-weight: 800; color: #1e1e1e; }

.main-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  overflow: auto;
  background-color: #f3f7fe;   /* 浅蓝 */
  border: 1px solid #e4eaf4;
  margin-top: 0px;
  padding: 24px;
}

/* ===== 页面块样式（简洁） ===== */
.block { margin-bottom: 28px; }
.block-title { font-size: 18px; font-weight: 700; margin: 0 0 12px; color: #111827; }

/* 语言胶囊按钮 */
.lang-toggle { display: inline-flex; gap: 8px; }
.pill {
  min-width: 84px;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #d9ddea;
  background: #ffffff;
  color: #111827;
  font-weight: 600;
  cursor: pointer;
}
.pill.active {
  background: #2a2c55;
  color: #fff;
  border-color: #2a2c55;
}

/* Acknowledgements */
.linklike {
  background: transparent;
  border: none;
  color: #4f60c6;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}
.ack-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px 16px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  color: #1f2937;
}

/* 右下角按钮 */
.signout-btn {
  position: absolute;
  right: 24px;
  bottom: 24px;
  height: 44px;
  padding: 0 42px;
  border-radius: 12px;
  border: none;
  background: #2a2c55;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(42,44,85,0.25);
  cursor: pointer;
}

/* 左下角说明文字 */
.footer-note {
  position: absolute;
  left: 24px;
  bottom: 24px;
  color: #a3a3a3;
  font-size: 14px;
}

/* 小过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity .16s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }


/* 图标按钮（与页面风格一致的主按钮样式） */
.icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px 0 12px;
  border-radius: 12px;
  border: 1px solid #d9ddea;
  background: #ffffff;
  color: #111827;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: transform .08s ease, box-shadow .12s ease, border-color .12s ease;
}
.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(42,44,85,0.12);
  border-color: #cfd6ea;
}
.icon-btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 10px rgba(42,44,85,0.12);
}

/* 小红点（仅在 has-dot 时出现） */
.icon-btn.has-dot::after {
  content: '';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 10px;
  height: 10px;
  background: #ff3b30; /* 清晰的红色 */
  border-radius: 999px;
  box-shadow: 0 0 0 2px #ffffff; /* 形成白色描边，适配浅底 */
}

/* 让图标与文字的视觉对齐更舒适 */
.icon-btn .pi {
  font-size: 16px;
}
.icon-btn span {
  font-size: 14px;
  font-weight: 700;
}

/* ===== 双栏布局 ===== */
.two-column {
  display: flex;
  gap: 24px;
}

/* 左侧保持原设置栏 */
.left-panel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  gap: 16px; /* 控制水平和垂直间距 */
  justify-items: start;
  justify-content: start;
}

/* ===== 产品展示卡片 ===== */
.product-card {
  position: relative;
  background: #ffffff;
  border-radius: 5px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  margin-bottom: 10px;
  width: 275px;
  height: 360px;
}

.product-card img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 12px;
  width: 243px;
  height: 250px;
}

.product-card .product-title {
  color: #000000; /* 橙C美式 */
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 8px;
}

.product-card .product-description {
  color: #000000;
  font-weight: 400;
  font-size: 14px;
  margin-bottom: 12px;
}


.product-card .product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card .product-price {
  font-weight: 500;
  font-size: 16px;
}

.product-card .product-price img {
  vertical-align: middle;
  margin-right: 0px; /* 调整数字与图片间距 */
  margin-bottom: 2px;
  width: 16px;
  height: 16px;
}

.product-card .product-buy-btn {
  background: #2a2c55;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 0 16px;
  height: 36px;
  cursor: pointer;
}
.product-card .product-buy-btn:hover {
  background: #24264a;
}

</style>
