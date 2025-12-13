import Mock from 'mockjs';

export default [
  {
    url: '/api/tasks/create/',
    method: 'post',
    response: () => {
      return Mock.mock({
        id: '@increment(1)',
        title: '魔法迷宫探险',
        description: '探索危险的地下迷宫，获取宝藏！',
        task_type: 'team',
        deadline: '2025-08-01T12:00:00Z',
        experience_reward: 300,
        token_reward: 150,
        is_started: false,
        is_accepted: false,
      });
    },
  },
  {
    url: '/api/tasks/my-tasks/',
    method: 'get',
    response: () => {
      return Mock.mock([
        {
          id: 4,
          title: '打扫图书馆',
          accepted_by: [
            {
              "id": 1,
              "nickname": "扣1复活科比",
              "avatar": "T4Nh4vKllH5NrXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
            },
          ],
          description: '整理图书馆的书籍并清扫地面',
          task_type: 'solo',
          deadline: '2025-08-20 18:00',
          experience_reward: 7,
          token_reward: 20,
          volunteerTime_reward: 12,
          publisher_nickname: 'silverteacher',
          publisher_avatar: '',
          is_accepted: false,
          is_completed: true,
          required_level: 'F',
          wechat: "SXiaoCu"
        },
      ]);
    },
  },
  {
    url: '/api/tasks/',
    method: 'get',
    response: ({ query }) => {
      // 模拟分页参数
      const page = Number(query.page || 1);

      const allResults = [
        {
          id: 14,
          title: '打扫图书馆',
          maximum_users: 10,
          accepted_by: [
            {
              "id": 1,
              "nickname": "扣1复活科比",
              "avatar": "T4Nh4vKllH5NrXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
            },
            {
              "id": 1,
              "nickname": "扣1复活科比",
              "avatar": "T4Nh4vKllH5NrXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
            },
            {
              "id": 1,
              "nickname": "扣1复活科比",
              "avatar": "T4Nh4vKllH5NrXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
            },
            {
              "id": 1,
              "nickname": "扣1复活科比",
              "avatar": "T4Nh4vKllH5NrXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
            },
          ],
          description: '整理图书馆的书籍并清扫地面',
          task_type: 'solo',
          deadline: '2025-08-29 18:00',
          experience_reward: 100,
          token_reward: 20,
          volunteerTime_reward: 0.0,
          publisher_nickname: 'silverteacher',
          publisher_avatar: '',
          is_accepted: false,
          required_level: 'F',
        },
        {
          id: 13,
          title: '打扫图书馆',
          description: '整理图书馆的书籍并清扫地面',
          accepted_by: [
            {
              "id": 1,
              "nickname": "扣1复活科比",
              "avatar": "T4Nh4vKllH5NrXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
            },
          ],
          task_type: 'solo',
          deadline: '2025-08-29 18:00',
          experience_reward: 100,
          token_reward: 20,
          volunteerTime_reward: 0.0,
          publisher_nickname: 'silverteacher',
          publisher_avatar: '',
          is_accepted: true,
          required_level: 'F',
        },
        {
          id: 12,
          title: '打扫图书馆',
          description: '整理图书馆的书籍并清扫地面',
          task_type: 'solo',
          deadline: '2025-08-29 18:00',
          experience_reward: 100,
          token_reward: 20,
          volunteerTime_reward: 0.0,
          publisher_nickname: 'silverteacher',
          publisher_avatar: '',
          is_accepted: false,
          required_level: 'F',
        },
        {
          id: 11,
          title: '打扫图书馆',
          description: '整理图书馆的书籍并清扫地面',
          task_type: 'solo',
          deadline: '2025-08-29 18:00',
          experience_reward: 100,
          token_reward: 20,
          volunteerTime_reward: 0.0,
          publisher_nickname: 'silverteacher',
          publisher_avatar: '',
          is_accepted: false,
          required_level: 'F',
        },
      ];

      const pageSize = 4; // 每页显示 2 条
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const results = allResults.slice(start, end);

      return {
        count: allResults.length,
        next: end < allResults.length ? `http://127.0.0.1:8000/tasks/?page=${page + 1}` : null,
        previous: page > 1 ? `http://127.0.0.1:8000/tasks/?page=${page - 1}` : null,
        results,
      };
    },
  },
  {
    url: '/api/tasks/3/',
    method: 'get',
    response: () => {
      return {
        id: 3,
        publisher: 'silverteacher',
        invited_users: [],
        leader: '扣2科比复活失败',
        title: '打扫图书馆',
        accepted_by: [
          {
            "id": 1,
            "nickname": "扣1复活科比",
            "avatar": "T4Nh4vKllH5NrXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
          },
                    {
            "id": 1,
            "nickname": "扣1复活科比",
            "avatar": "T4Nh4vKllH5NXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
          },
          {
            "id": 1,
            "nickname": "扣1复活科比",
            "avatar": "T4Nh4vlH5NrXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
          },
          {
            "id": 1,
            "nickname": "扣1复活科比",
            "avatar": "T4Nh4vlH5NrXygw5JtXfHzM0ULmTcla9kZlEJQfnIZ3pxD51"
          }
        ],
        description: '<p>Hi!&nbsp;The&nbsp;English&nbsp;Department&nbsp;needs&nbsp;a&nbsp;minimum&nbsp;6&nbsp;students&nbsp;to&nbsp;help&nbsp;out&nbsp;with&nbsp;some&nbsp;Christmas&nbsp;games&nbsp;at&nbsp;the&nbsp;party&nbsp;event&nbsp;at&nbsp;lunch!&nbsp;Meet&nbsp;at&nbsp;the&nbsp;Avenue&nbsp;of&nbsp;Stars&nbsp;to&nbsp;help&nbsp;the&nbsp;English&nbsp;Department&nbsp;out.</p><p>3&nbsp;shifts&nbsp;that&nbsp;need&nbsp;to&nbsp;be&nbsp;covered:&nbsp;12:00-12:40,&nbsp;12:40-13:20,&nbsp;13:30-14:00&nbsp;(10&nbsp;minutes&nbsp;of&nbsp;clean&nbsp;up&nbsp;time).</p><p><img src="https://www.aidiventure.com/media/images/d6eaf280e75147f6b259dd05acc232f9.png"></p><p><img src="https://www.aidiventure.com/media/images/1049e8f2da0f46d3aa24d48e63f6bd2f.png"></p>',
        task_type: 'solo',
        maximum_users:  1,
        required_level: 'F',
        experience_reward: 100,
        token_reward: 20,
        volunteerTime_reward: 0.0,
        image: null,
        deadline: '2025-08-20T18:00:00Z',
        is_completed: true,
        is_expired: false,
        is_accepted: true,
        is_started: true,
        created_at: '2025-08-14T07:22:59.834162Z',
        updated_at: '2025-08-14T07:40:40.798383Z',
        cancel_requested: false,
      };

    },
  },
  
];
