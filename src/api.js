// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/', // 所有请求都会带上 /api 前缀
});

// 请求拦截器：自动加上 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理 token 过期
let isRefreshing = false;
let subscribers = [];

function onRefreshed(newToken) {
  subscribers.forEach((callback) => callback(newToken));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    console.log(response.status);
    
    if (response && response.status === 401 && !config._retry) {
      config._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refresh_token');

        try {
          const res = await axios.post('/api/token/refresh/', {
            refresh: refreshToken,
          });
          const newToken = res.data.access;
          localStorage.setItem('access_token', newToken);

          isRefreshing = false;
          onRefreshed(newToken);
        } catch (e) {
          isRefreshing = false;
          // 刷新失败，清理 token
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/'; // 跳到登录页
          return Promise.reject(e);
        }
      }

      return new Promise((resolve) => {
        addSubscriber((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(config));
        });
      });
    }
    return Promise.reject(error);
  }
);

export default api;
