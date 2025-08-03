import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchUser() {
      if (this.userInfo) return this.userInfo; // 有数据就直接返回，避免重复请求
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get('/api/users/');
        this.userInfo = res.data;
        return this.userInfo;
      } catch (e) {
        this.error = e;
        console.error('拉取用户数据失败', e);
        throw e;
      } finally {
        this.loading = false;
      }
    },
    clearUser() {
      this.userInfo = null;
    },
  },
});
