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
          description: '整理图书馆的书籍并清扫地面',
          task_type: 'solo',
          deadline: '2025-08-20 18:00',
          experience_reward: 15,
          token_reward: 20,
          volunteerTime_reward: 24,
          publisher_nickname: 'silverteacher',
          publisher_avatar: '',
          is_accepted: true,
          required_level: 'F',
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

];
