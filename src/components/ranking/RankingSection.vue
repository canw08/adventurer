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
  <span class="rank header-cell">Rank</span>
  <span class="name header-cell">Name</span>
  <span class="count header-cell">{{ board.headerLabel }}</span>
</div>
      <!-- 第 2-6 行：前五名 -->
     <div
  v-for="(item, idx) in board.top5"
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
    <span class="name">{{ board.my.nickname }}（我）</span>
  </div>

  <span class="count">{{ formatValue(board.my.value, board.unit) }}</span>
</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 组件只负责展示：数据从父组件传进来
 * board 结构：
 * {
 *   key: 'rich' | 'hours' | 'owner',
 *   title: '富豪榜' | '时长榜' | '主人榜',
 *   unit: '全币' | '小时' | '次',
 *   top5: [{ userId, avatarUrl, nickname, value }],
 *   my: { rank, userId, avatarUrl, nickname, value }
 * }
 */
const props = defineProps({
  rankingBoards: {
    type: Array,
    default: () => []
  }
})

const boards = computed(() => props.rankingBoards ?? [])

// 默认头像（你可以换成你项目的真实资源）
const defaultAvatar = '/img/default-avatar.png'

/** 格式化数值展示（时长保留 1 位小数更自然） */
function formatValue(val, unit) {
  if (val === null || val === undefined) return '-'
  if (unit === '小时') return `${Number(val).toFixed(1)} ${unit}`
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
  justify-content: center;  /* ✅ 水平居中 */
  text-align: center;       /* ✅ 文本居中 */
  font-weight: 800;
  font-size: 14px;
  padding: 6px 4px;     /* ✅ 标题行也紧凑 */
  margin-bottom: 2px;   /* ✅ 原来 4px，缩小 */
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