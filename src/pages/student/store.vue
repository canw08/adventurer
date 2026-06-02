<template>
  <Toast position="top-right" :baseZIndex="10000" />
  <div class="main-content" @click="cancelPurchase">
    <!-- 顶部标题栏 -->
    <div class="main-header">
      <div class="header-left-group">
        <span class="header-left">{{ t('storePage.title') }}</span> 
      </div>
    </div>

      <!-- 商店功能按钮 -->
    <div class="store-toolbar">
        <button class="store-btn">
        {{ t('storePage.products') }}
        </button>
    </div>

   <!-- 主体卡片（浅蓝背景） -->
    <!-- 主体卡片（浅蓝背景） -->
    <div class="main-body two-column">
      <!-- 左侧：原有设置内容 -->
      <div class="left-panel">
          
            <div class="product-card" v-for="product in products" :key="product.id">
              <img :src="product.image" :alt="product.title" />
              <div class="product-title">{{ product.title }}</div>
              <div class="product-description">{{ product.description }}</div>
              <div class="product-footer">
                <div class="product-price">
                  <img
                    src="../../assets/icon/token.png"
                    alt="token"
                    style="width:20px; height:20px; vertical-align:middle; margin-right:0px;"
                  />
                  {{ product.price }}
                </div>
                <button
                  class="product-buy-btn"
                  @click.stop="openConfirm(product)"
                >
                  {{ t('storePage.buy') }}
                </button>
              </div>

              <!-- 购买确认矩形 -->
              <div
                v-if="showConfirm && selectedProduct && selectedProduct.id === product.id"
                class="purchase-box"
                @click.stop
              >
                <div class="purchase-text">
                  {{ t('storePage.confirmPurchasePrompt') }}
                  <span class="price">
                    {{ selectedProduct.price }}<img src="../../assets/icon/token.png" alt=""/>
                  </span>          
                </div>
                <div class="purchase-buttons">
                  <button class="cancel-btn" @click="cancelPurchase">{{ t('storePage.cancel') }}</button>
                  <button class="confirm-btn" @click="confirmPurchase">{{ t('storePage.confirm') }}</button>
                </div>
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
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../i18n/index.js'   // 👈 引入你写的 setLocale 方法
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
const toast = useToast()
import api from '../../api.js'


// 商品列表
const products = ref([])

// ✅ 获取商品
const fetchProducts = async () => {
  try {
    const res = await api.get('/api/shop/items/')

    // 👉 兼容后端返回“数组”或“{ items: [] }”
    const rawItems = Array.isArray(res.data) ? res.data : (res.data?.items || [])
    products.value = rawItems.map(item => ({
      id: item.id,
      title: item.name,
      description: item.description,
      price: item.token_price,
      image: typeof item.image === 'string' && item.image.startsWith('http')
        ? item.image
        : `${window.location.origin}${item.image || ''}`
    }))

  } catch (err) {
    console.error("获取商品失败:", err)
  }
}

// 页面加载执行
onMounted(() => {
  fetchProducts()
  fetchTokens()
})

const userStore = useUserStore();
const router = useRouter();
const { locale, t } = useI18n()
const userCoins = ref(0)
const showConfirm = ref(false)
const selectedProduct = ref(null)
const SHORTCUT_DOT_KEY = 'settings.shortcutDotDismissed'  // 记忆小红点是否已消失
const showShortcutDot = ref(localStorage.getItem(SHORTCUT_DOT_KEY) !== '1')


const fetchTokens = async () => {
  try {
    // UserDetailView 需要 me=true 才返回当前用户
    const res = await api.get('/api/users/', {
      params: { me: true }
    })
    userCoins.value = Number(res.data?.tokens ?? 0)
  } catch (err) {
    try {
      // 兼容旧接口
      const legacyRes = await api.get('/api/user/tokens/')
      userCoins.value = Number(legacyRes.data?.tokens ?? 0)
    } catch (legacyErr) {
      console.error("获取金币失败:", legacyErr?.response?.data || legacyErr)
    }
  }
}
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

const openConfirm = (product) => {
selectedProduct.value = product
showConfirm.value = true
}

const cancelPurchase = () => {
  showConfirm.value = false
  selectedProduct.value = null
}

const confirmPurchase = async () => {
  if (!selectedProduct.value) return

  try {
    const res = await api.post(`/api/shop/items/${selectedProduct.value.id}/purchase/`)

    // ✅ 使用 PrimeVue Toast 替代 alert
    toast.add({
      severity: 'success',   // success / info / warn / error
      summary: t('storePage.purchaseSuccess'),
      detail: res.data.message,
      life: 3000             // 显示 3 秒
    })

    // 更新金币（后端返回）
    userCoins.value = res.data.tokens
    cancelPurchase()

  } catch (err) {
    // ❌ 失败
    let msg = t('storePage.purchaseFailedFallback')
    if (err.response && err.response.data) {
      msg = err.response.data.detail || err.response.data.message || msg
    }
    toast.add({
      severity: 'error',
      summary: t('storePage.purchaseFailed'),
      detail: msg,
      life: 3000
    })

    console.error("购买失败:", err)
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
  padding: 24px 48px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 12px;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #d5dbe5;
  padding-top: 0px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  margin-top: -8px;
}
.header-left-group { display: flex; align-items: center; gap: 16px; }
.header-left { font-size: 28px; font-weight: 800; color: #1e1e1e; }

.main-body {
  position: relative;
  flex: 1;
  display: block;
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
  grid-template-columns: repeat(3, 1fr);
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
  flex: 1;
}

/* 左侧保持原设置栏 */
.left-panel {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 40px;
  width: 100%;
  padding-left: 15px;
  padding-top: 15px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== 产品展示卡片 ===== */
.product-card {
  background: #ffffff;
  border-radius: 15px;
  min-width: 0;
  height: 350px;
  position: relative;
}

.product-card img {
  width: 90%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin: 10px auto 10px;
  display: block;
}

.product-card .product-title {
  color: #000000; /* 橙C美式 */
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 8px;
  padding-left: 11px;
  padding-right: 11px;
  box-sizing: border-box
}

.product-card .product-description {
  color: #000000;
  font-weight: 400;
  font-size: 14px;
  margin-bottom: 12px;
  padding-left: 11px;
  padding-right: 11px;
  box-sizing: border-box;
}

.product-card .product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 11px;
  padding-right: 11px;
  box-sizing: border-box
}

.product-card .product-price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  font-size: 16px;
  position: relative;
  top: 5px;
}

.product-card .product-price img {
  width: 16px;
  height: 16px;
  margin: 0;
  position: relative;
}

.product-card .product-buy-btn {
  background: #2a2c55;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 0 16px;
  height: 36px;
  cursor: pointer;

  position: relative;
  left: -5px;
  top: 4px
}
.product-card .product-buy-btn:hover {
  background: #24264a;
}
 
 /* ===== 卡片内购买确认框 ===== */
 .purchase-text img{
  width: 16px;
  height: 16px;
 }
.purchase-box{
  position: absolute;
  top:355px;

  left: 50%;
  transform: translateX(-50%);
  
  z-index: 10;
  
  width: 310px;
  min-height: 140px;

  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  padding-bottom: 60px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.purchase-text{
  font-size: 14px;
  font-weight: 600;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 4px;

  margin-bottom: 10px;

  white-space: nowrap;
}

.purchase-buttons{
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
  
.cancel-btn{
  background: #e5e7eb;
  border: none;
  border-radius: 8px;
  width: 120px;
  height: 36px;
  cursor: pointer;
  font-weight: 600;
}

.confirm-btn{
  background: #2a2c55;
  color: white;
  border: none;
  border-radius: 8px;
  width: 120px;
  height: 36px;
  cursor: pointer;
  font-weight: 600;
}

.price{
  display: flex;
  align-items: center;
  gap: 2px;
}

.p-toast-success {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 1px solid #ccc !important;
}
</style>
