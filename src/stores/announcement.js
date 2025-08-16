// stores/announcement.js
import { defineStore } from 'pinia'
import axios from 'axios'

// 可选：后端扩展新类型时的兜底
const KNOWN_TYPES = new Set(['system', 'invite'])
const normalizeTypeKey = (k) => (KNOWN_TYPES.has(k) ? k : 'unknown')

export const useAnnouncementStore = defineStore('announcements', {
  state: () => ({
    items: [], // [{ id, avatarSeed, name|null, typeKey, content, dateISO, read }]
  }),
  getters: {
    unreadCount: (s) => s.items.filter(a => !a.read).length,
    ordered: (s) => [...s.items].sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || '')),
  },
  actions: {
    markRead(id) {
      this.items = this.items.map(a => a.id === id ? { ...a, read: true } : a)
    },
    markAllRead() {
      this.items = this.items.map(a => ({ ...a, read: true }))
    },
    async fetchAll() {
      try {
        const res = await axios.get('/api/notifications/latest/')
        this.items = (res.data || []).map((n) => ({
          id: n.id,
          avatarSeed: n.related_user_nickname || 'none',
          name: n.related_user_nickname ?? null,      // 为空时，组件用 t('notifications.systemName') 兜底
          typeKey: normalizeTypeKey(n.type),          // 'system' | 'invite' | 'unknown'
          content: n.message,
          dateISO: n.created_at,                      // 组件可直接展示或再格式化
          read: !!n.is_read,
        }))
      } catch (err) {
        console.error('获取通知失败', err)
      }
    }
  }
})
