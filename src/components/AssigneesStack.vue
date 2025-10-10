<template>
  <div v-if="users?.length"
       class="assignees"
       role="button"
       :aria-label="`assignees ${users.length}`"
       @click="openDialog"
       :title="tooltip">
    <!-- 只展示前 maxVisible 个 -->
    <img
      v-for="(u, idx) in visibleUsers"
      :key="u.id ?? idx"
      class="avtr"
      :src="avatarSrc(u)"
      alt="assignee avatar"
      :style="[avatarStyle, avatarOffsetStyle(idx)]"
      @error="onImgError($event, u)"
    />

    <!-- > maxVisible 时显示 +N，并与最后一个头像保持 8px 的可读间距 -->
    <span v-if="users.length > maxVisible" class="more-pill">
      +{{ users.length - maxVisible }}
    </span>

    <Dialog v-model:visible="internalVisible" modal :header="dialogTitle" :style="{ width: dialogWidth }">
      <ul class="assignees-list">
        <li v-for="u in users" :key="u.id" class="assignee-row">
          <img :src="avatarSrc(u)" class="avtr sm" alt="" @error="onImgError($event, u)" />
          <div class="assignee-info">
            <div class="assignee-name">{{ u.nickname ?? u.name ?? 'User' }}</div>
            <div class="assignee-id">{{ u.realname ?? '-' }}</div>
          </div>
          <!-- 踢出按钮 -->
          <button
            v-if="props.showRemove"
            class="remove-btn"
            @click.stop="props.onRemove?.(u)">
            <i class="pi pi-minus-circle"></i>
          </button>
        </li>

      </ul>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import Dialog from 'primevue/dialog'

type UserLike = {
  id?: string | number
  nickname?: string
  name?: string
  avatar?: string
}

const props = withDefaults(defineProps<{
  users: UserLike[] | null | undefined
  maxVisible?: number
  size?: number
  overlapOffset?: number
  dialogTitle?: string
  dialogWidth?: string
  tooltip?: string
  avatarUrlFn?: (u: UserLike) => string
  /** 是否显示踢出按钮 */
  showRemove?: boolean
  /** 点击踢出回调 */
  onRemove?: (user: UserLike) => void
}>(), {
  users: () => [],
  maxVisible: 3,
  size: 44,
  overlapOffset: 28,
  dialogTitle: 'Assigned',
  dialogWidth: '420px',
  tooltip: '查看参与者',
  showRemove: false,
})


const emit = defineEmits<{ (e: 'open'): void; (e: 'close'): void }>()
const internalVisible = ref(false)
const visibleUsers = computed(() => (props.users ?? []).slice(0, props.maxVisible))

const defaultAvatarUrl = (u: UserLike) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(u?.avatar || u?.nickname || u?.name || 'user')}&backgroundColor=transparent`

const avatarSrc = (u: UserLike) => (props.avatarUrlFn ? props.avatarUrlFn(u) : defaultAvatarUrl(u))

const avatarStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))

/** 按索引精确控制每个头像的左侧间距，避免被 flex gap 影响 */
const avatarOffsetStyle = (idx: number) => {
  if (idx === 0) return { marginLeft: '0px' }
  // 从第二个开始，每个都往左叠（紧凑效果）
  return { marginLeft: `-${props.overlapOffset}px` }
}


const openDialog = () => {
  internalVisible.value = true
  emit('open')
}
watchEffect(() => { if (!internalVisible.value) emit('close') })

const onImgError = (e: Event, u: UserLike) => {
  const img = e.target as HTMLImageElement
  const fallback = defaultAvatarUrl(u)
  if (img.src !== fallback) img.src = fallback
}
</script>

<style scoped>
.assignees{
  display: flex;
  align-items: center;
  gap: 0;                 /* ✅ 关键：禁止容器 gap 破坏叠加和紧邻间距 */
  cursor: pointer;
  user-select: none;
}

.avtr{
  border-radius: 50%; /* 如果你连白色描边也不想要，可删掉这一行 */
  object-fit: cover;
  /* ✅ 去掉阴影 */
  box-shadow: none;
}

/* “+N” 与最后一张头像留一些空间，避免贴得太近 */
.more-pill{
  margin-left: -15px;
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 12px;
  background: #eef0f4;
  color: #2a2c56;
  font-weight: 700;
  font-size: 12px;
}

/* 弹窗列表样式保持不变 */
.assignees-list{ margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; }
.assignee-row{ display: flex; align-items: center; gap: 10px; }
.assignee-info{ display: flex; flex-direction: column; }
.assignee-name{ font-weight: 700; color: #111; }
.assignee-id{ font-size: 12px; color: #9aa0af; }
.avtr.sm{ width: 36px; height: 36px; border-width: 1.5px; }

.remove-btn {
  margin-left: auto; /* 挤到最右边 */
  background: transparent;
  border: none;
  color: #ff4d4f;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-right: 5px;
}

.remove-btn:hover {
  color: #d9363e;
}

</style>
