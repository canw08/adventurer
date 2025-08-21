// src/mock/upload.js
import Mock from 'mockjs';

export default [
  {
    url: '/api/upload',   // 上传接口地址
    method: 'post',
    response: () => {
      return Mock.mock({
        url: 'https://picsum.photos/400/300',
        compressed: false,
      });
    },
  },
];
