import Mock from 'mockjs';

export default [
  {
    url: '/api/users/',
    method: 'get',
    response: () => {
      return Mock.mock({
        identifier: '666666', // 随机唯一标识
        username: 'silvervoid',
        nickname: '这是个名称', // 随机英文名
        email: 'wangcan20080128@qq.com',
        avatar: 'sadSADSAasdasdasd',
        bio: null,
        experience: 100,
        next_level_xp: 400,
        current_level_xp: 100,
        tokens: 623,
        volunteerTime: 2.5,
        level: 'F',
        title: null,
        role: 'teacher',
      });
    },
  },

  {
    url: '/api/users/login/',
    method: 'post',
    response: () => {
      return {
        refresh_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1NTI0MTU4OCwiaWF0IjoxNzU1MTU1MTg4LCJqdGkiOiIzNDVjNDBlOTZlMjQ0MzVjOGI3YmRjOTE2MTYwZmRmZSIsInVzZXJfaWQiOjF9.echb2eea7NRxfXCm8Kj63pB2Opl3F6T_WXqUXEUHYvI',
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU1MTU1NDg4LCJpYXQiOjE3NTUxNTUxODgsImp0aSI6IjUzNzllYjZhNmMyMTQ4ZTA4NDk4NDc1YTM4YTI2OTc4IiwidXNlcl9pZCI6MX0.AIvWucaSRKeYo-dWNdD82d6EY524_dDoL0kNl3NMBrI',
        username: 'silvervoid',
      }
    },
  },
];
