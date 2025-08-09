import { defineStore } from 'pinia'

export const useAnnouncementStore = defineStore('announcements', {
  state: () => ({
    items: [
      { id: 1, avatarSeed: 'none', name: 'Bridgette-文碧之', type: '入会通知', content: '欢迎加入冒险者协会', dateISO: '2025-06-26', read: false },
      { id: 2, avatarSeed: 'something', name: 'bot', type: '请假通知', content: '请求时间延期到8/22日', dateISO: '2025-06-25', read: false },
    ],
  }),
  getters: {
    unreadCount: (s) => s.items.filter(a => !a.read).length,
    ordered: (s) => [...s.items].sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
  },
  actions: {
    markRead(id) {
      this.items = this.items.map(a => a.id === id ? { ...a, read: true } : a)
    },
    markAllRead() {
      this.items = this.items.map(a => ({ ...a, read: true }))
    },
    // async fetchAll(){ ... } // 需要时再接后端
  }
})
