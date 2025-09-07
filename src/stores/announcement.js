// stores/announcement.js
import { defineStore } from 'pinia'
import api from '../api.js';

const KNOWN_TYPES = new Set(['system', 'invite', 'completion_request','cancel_request'])
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

    /**
     * 为安全：将「全部标记为已读」也限制为仅 system；
     * 若项目里还有调用 markAllRead，不会误把其他类型清掉
     */
    async markAllRead() {
      return this.markAllSystemRead()
    },

    /**
     * 仅将 system 类型未读项批量标记为已读。
     * 目前逐条调用后端单条标记接口；若将来后端提供类型批量接口，可在此替换为一次请求。
     */
    async markAllSystemRead() {
      try {
        const targets = this.items.filter(it => !it.read && it.typeKey === 'system')
        if (targets.length === 0) return
        for (const it of targets) {
          try {
            await api.post(`/api/notifications/${it.id}/mark-read/`)
          } catch (e) {
            console.error(`标记已读失败 id=${it.id}`, e)
          }
        }
        await this.fetchAll()
      } catch (err) {
        console.error('批量标记 system 通知已读失败', err)
      }
    },

    // 拉取所有通知
    async fetchAll() {
      try {
        const res = await api.get('/api/notifications/latest/')
        this.items = (res.data || []).map((n) => ({
          id: n.id,
          avatarSeed: n.related_user_avatar || 'none',
          name: n.related_user_nickname ?? null,
          typeKey: normalizeTypeKey(n.type),
          content: n.message,
          dateISO: n.created_at,
          read: !!n.is_read,
          userid: n.related_user,
          taskid: n.related_task
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
