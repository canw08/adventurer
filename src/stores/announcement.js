// stores/announcement.js
import { defineStore } from 'pinia'
import api from '../api.js';

const KNOWN_TYPES = new Set(['system', 'invite'])
const normalizeTypeKey = (k) => (KNOWN_TYPES.has(k) ? k : 'unknown')

export const useAnnouncementStore = defineStore('announcements', {
  state: () => ({
    items: [],
    _timer: null, // 内部用的定时器引用
  }),
  getters: {
    unreadCount: (s) => s.items.filter(a => !a.read).length,
    ordered: (s) => [...s.items].sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || '')),
  },
  actions: {
    // 标记单条已读
    async markRead(id) {
      try {
        await api.post(`/api/notifications/${id}/mark-read/`)
        await this.fetchAll()
      } catch (err) {
        console.error('标记通知已读失败', err)
      }
    },

    // 标记全部已读
    async markAllRead() {
      try {
        await api.post(`/api/notifications/mark-all-read/`)
        await this.fetchAll()
      } catch (err) {
        console.error('标记全部通知已读失败', err)
      }
    },

    // 拉取所有通知
    async fetchAll() {
      try {
        const res = await api.get('/api/notifications/latest/')
        this.items = (res.data || []).map((n) => ({
          id: n.id,
          avatarSeed: n.related_user_nickname || 'none',
          name: n.related_user_nickname ?? null,
          typeKey: normalizeTypeKey(n.type),
          content: n.message,
          dateISO: n.created_at,
          read: !!n.is_read,
        }))
      } catch (err) {
        console.error('获取通知失败', err)
      }
    },

    // 开始定时刷新（默认 2 分钟一次）
    startAutoRefresh(intervalMs = 120000) {
      if (this._timer) return // 已经在跑了就不要重复开
      this.fetchAll() // 先拉一次
      this._timer = setInterval(() => {
        this.fetchAll()
      }, intervalMs)
    },

    // 停止定时刷新
    stopAutoRefresh() {
      if (this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
    },
  }
})
