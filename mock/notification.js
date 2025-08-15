import Mock from 'mockjs';

// mock/notifications.js
export default [
  {
    url: '/api/notifications/latest/',
    method: 'get',
    response: () => [
      {
        id: 3,
        type: 'system',
        message: '测试通知来了',
        is_read: false,
        created_at: '2025-08-15T11:59:01.968049Z',
        related_task: null,
        related_user: 3,
        related_user_nickname: 'silverFriend',
        related_user_avatar: 'bot'
      },
      {
        id: 2,
        type: 'system',
        message: '这是一条测试通知',
        is_read: false,
        created_at: '2025-08-15T11:58:19.310548Z',
        related_task: null,
        related_user: null
      },
      {
        id: 1,
        type: 'invite',
        message: '你被 silvervoid 邀请加入任务《魔法迷宫探险》',
        is_read: true,
        created_at: '2025-07-27T09:45:48.071516Z',
        related_task: 1,
        related_user: null
      }
    ]
  }
]
