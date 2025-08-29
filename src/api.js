// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/', // 建议直接写成 /api，避免路径歧义
});

// 请求拦截：自动带上 access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let subscribers = [];

function onRefreshed(newToken) {
  subscribers.forEach((cb) => cb(newToken));
  subscribers = [];
}

function addSubscriber(cb) {
  subscribers.push(cb);
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;

    // 没有响应或不是 401，直接抛出
    if (!response || response.status !== 401) {
      return Promise.reject(error);
    }

    // 防止无限重试
    if (config._retry) {
      return Promise.reject(error);
    }
    config._retry = true;

    // —— 关键改动：先把“重放原请求”的逻辑排队 —— //
    const retryOriginalRequest = new Promise((resolve) => {
      addSubscriber((newToken) => {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;
        resolve(api(config)); // 用同一个 api 实例重发
      });
    });

    // 只有一个刷新在进行；没有的话就触发一次
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');

      // 用 api（同 baseURL/同拦截器），且不要带 Authorization
      api.post('api/token/refresh/', { refresh: refreshToken }, { headers: {} })
        .then((res) => {
          const newToken = res.data?.access;
          if (!newToken) throw new Error('No access token in refresh response');
          localStorage.setItem('access_token', newToken);
          onRefreshed(newToken);
        })
        .catch((e) => {
          // 刷新失败，清理并跳转
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          subscribers = []; // 防止挂起
          window.location.href = '/';
          // 把错误继续抛给首个触发者（可选）
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    // 返回等待刷新完成后的重试 Promise
    return retryOriginalRequest;
  }
);

export default api;
