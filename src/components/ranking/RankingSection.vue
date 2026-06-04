<template>
  <!-- 外层区域：三个排行榜并排 -->
  <div class="ranking-section">
    <div
      v-for="(board, index) in boards"
      :key="board.key ?? index"
      class="ranking-board"
    >
      <!-- 第 1 行：标题 -->
      <div class="ranking-row title-row">
        {{ board.title }}
      </div>

      <!-- ✅ 说明行（表头） -->
      <div class="ranking-row ranking-header-row">
        <span class="rank header-cell">{{ t('ranking.rank') }}</span>
        <span class="name header-cell">{{ t('ranking.name') }}</span>
        <span class="count header-cell">{{ board.headerLabel }}</span>
      </div>

      <!-- 第 2-6 行：前五名 -->
      <div
        v-for="(item, idx) in board.top3"
        :key="item.userId ?? idx"
        class="ranking-row"
      >
        <!-- Rank -->
        <span class="rank">{{ idx + 1 }}</span>

        <!-- Name 列（头像 + 名字作为一个整体） -->
        <div class="name-cell">
          <img :src="item.avatarUrl || defaultAvatar" class="avatar" />
          <span class="name">{{ item.nickname }}</span>
        </div>

        <!-- Count -->
        <span class="count">{{ formatValue(item.value, board.unit) }}</span>
      </div>

      <!-- 第 7 行：我的排名 -->
      <div class="ranking-row my-rank-row">
        <span class="rank">{{ board.my.rank }}</span>

        <div class="name-cell">
          <img :src="board.my.avatarUrl || defaultAvatar" class="avatar" />
          <span class="name">{{ board.my.nickname }}{{ t('ranking.meSuffix') }}</span>
        </div>

        <span class="count">{{ formatValue(board.my.value, board.unit) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../../api.js'
import { useUserStore } from '../../stores/user'

// 默认头像（你可以换成你项目的真实资源）
const defaultAvatar = '/img/default-avatar.png'
const { t } = useI18n()
const userStore = useUserStore()


function getAvatarUrl(u) {
  const seed =
    u?.avatar ||
    u?.nickname ||
    u?.name ||
    'user'

  return `https://api.dicebear.com/9.x/adventurer/svg?skinColor=ecad80,f2d3b1&seed=${encodeURIComponent(seed)}&backgroundColor=transparent`
}

function isCurrentUser(u) {
  const currentUserId = userStore.userInfo?.id
  return currentUserId !== undefined &&
    currentUserId !== null &&
    String(u?.id) === String(currentUserId)
}

function getLeaderboardAvatarUrl(u, isMe = false) {
  return getAvatarUrl(isMe || isCurrentUser(u) ? userStore.userInfo : u)
}
/**
 * 后端(mock)返回结构（来自你之前的 mock/rankings.js）：
 * {
 *   tokens: { top3: [...], me: {...} },
 *   volunteerTime: { top3: [...], me: {...} },
 *   published_tasks: { top3: [...], me: {...} }
 * }
 */
const rawData = ref(null)

async function fetchRankings() {
  try {
    // 这里的接口要和你的 mock url 对上：/api/rankings/
    const res = await api.get('/api/users/leaderboard/')
    // 兼容 axios 风格：res.data
    rawData.value = res?.data ?? res
  } catch (err) {
    console.error('获取排行榜失败：', err)
    rawData.value = null
  }
}

onMounted(() => {
  fetchRankings()
})

/** 把 mock 的字段映射成组件所需字段 */
function mapTopItem(item) {
  return {
    userId: item?.id,
    avatarUrl: getLeaderboardAvatarUrl(item),
    nickname: item?.nickname,
    value: item?.value
  }
}

function mapMeItem(me, top3) {
  const meId = me?.id
  const meInTop = Array.isArray(top3) ? top3.find(x => x?.id === meId) : null
  return {
    rank: me?.rank ?? '-',
    userId: me?.id,
    avatarUrl: getLeaderboardAvatarUrl(meInTop || me, true),
    nickname: me?.nickname ?? t('ranking.me'),
    value: me?.value ?? 0
  }
}

/**
 * 输出给模板渲染的 boards：
 * [
 *   { key,title,unit,headerLabel,top3:[...],my:{...} },
 *   ...
 * ]
 */
const boards = computed(() => {
  const d = rawData.value
  if (!d) return []

  const tokensTop3 = d?.tokens?.top3 ?? []
  const volunteerTop3 = d?.volunteerTime?.top3 ?? []
  const publishedTop3 = d?.published_tasks?.top3 ?? []

  return [
    {
      key: 'tokens',
      title: t('ranking.boards.tokens.title'),
      unit: t('ranking.boards.tokens.unit'),
      headerLabel: t('ranking.boards.tokens.header'),
      top3: tokensTop3.map(mapTopItem),
      my: mapMeItem(d?.tokens?.me, tokensTop3)
    },
    {
      key: 'volunteerTime',
      title: t('ranking.boards.volunteerTime.title'),
      unit: t('ranking.boards.volunteerTime.unit'),
      headerLabel: t('ranking.boards.volunteerTime.header'),
      top3: volunteerTop3.map(mapTopItem),
      my: mapMeItem(d?.volunteerTime?.me, volunteerTop3)
    },
    {
      key: 'published_tasks',
      title: t('ranking.boards.publishedTasks.title'),
      unit: t('ranking.boards.publishedTasks.unit'),
      headerLabel: t('ranking.boards.publishedTasks.header'),
      top3: publishedTop3.map(mapTopItem),
      my: mapMeItem(d?.published_tasks?.me, publishedTop3)
    }
  ]
})

/** 格式化数值展示（时长保留 1 位小数更自然） */
function formatValue(val, unit) {
  if (val === null || val === undefined) return '-'
  if (unit === t('ranking.boards.volunteerTime.unit')) return `${Number(val).toFixed(1)} ${unit}`
  return `${val} ${unit ?? ''}`.trim()
}
</script>

<style scoped>
.ranking-section {
  display: flex;
  gap: 30px;
  width: 100%;
}

.ranking-board {
  flex: 1;
  background: #ffffff;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.ranking-row {
  display: grid;
  grid-template-columns: 40px 1fr auto; /* Rank | Name | Count */
  align-items: center;
  justify-items: center;
  padding: 6px 12px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.title-row {
  justify-content: center; /* ✅ 水平居中 */
  text-align: center; /* ✅ 文本居中 */
  font-weight: 800;
  font-size: 14px;
  padding: 6px 4px; /* ✅ 标题行也紧凑 */
  margin-bottom: 2px; /* ✅ 原来 4px，缩小 */
  border-bottom: 1px solid #ddd; /* ✅ 线细一点更轻盈 */
  grid-column: 1 / -1;
  display: flex;
}

.rank {
  font-weight: 700;
  color: #555;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.name {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count {
  text-align: right;
  font-weight: 600;
  white-space: nowrap;
}

.my-rank-row {
  background: #f9fafc;
  border-radius: 6px;
  font-weight: 600;
}

.ranking-header-row {
  font-size: 12px;
  color: #8a8f99;
  font-weight: 600;
  background-color: #f6f7fb;
  border-radius: 6px;
}

/* 表头单元格统一样式 */
.header-cell {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ranking-header-row .header-cell {
  white-space: nowrap;
}

/* Name 单元：头像 + 名字横向 */
.name-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
}

/* 名字过长省略 */
.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
