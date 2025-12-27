import Mock from 'mockjs'

// mock/rankings.js
export default [
  {
    url: '/api/users/leaderboard/',
    method: 'get',
    response: () => ({
      tokens: {
        top5: [
          {
            id: 1,
            identifier: '268955',
            nickname: '认真的名称',
            avatar: 'Hth3oUjKs5lErzSkfeRrXdCaw4jZUAHhwsjemuzOaisoOVP4ZO',
            value: 314
          },
          {
            id: 2,
            identifier: '958094',
            nickname: 'silverteacher',
            avatar: 'pbS7wzSUQ1EfHTm6att8ax5KHzWeZoxroPCFmHiSVqwKaS3j69',
            value: 0
          },
          {
            id: 3,
            identifier: '215434',
            nickname: '认真点的人',
            avatar: 'wGThkbz7RFPNEmPLv8a2JJW8RotHJeFHfSHgi0TFxMU1RpEUNe',
            value: 0
          }
        ],
        me: {
          id: 1,
          identifier: '268955',
          nickname: '认真的名称',
          rank: 1,
          value: 314
        }
      },

      volunteerTime: {
        top5: [
          {
            id: 1,
            identifier: '268955',
            nickname: '认真的名称',
            avatar: 'Hth3oUjKs5lErzSkfeRrXdCaw4jZUAHhwsjemuzOaisoOVP4ZO',
            value: 3.5
          },
          {
            id: 2,
            identifier: '958094',
            nickname: 'silverteacher',
            avatar: 'pbS7wzSUQ1EfHTm6att8ax5KHzWeZoxroPCFmHiSVqwKaS3j69',
            value: 0.0
          },
          {
            id: 3,
            identifier: '215434',
            nickname: '认真点的人',
            avatar: 'wGThkbz7RFPNEmPLv8a2JJW8RotHJeFHfSHgi0TFxMU1RpEUNe',
            value: 0.0
          }
        ],
        me: {
          id: 1,
          identifier: '268955',
          nickname: '认真的名称',
          rank: 1,
          value: 3.5
        }
      },

      published_tasks: {
        top5: [
          {
            id: 2,
            identifier: '958094',
            nickname: 'silverteacher',
            avatar: 'pbS7wzSUQ1EfHTm6att8ax5KHzWeZoxroPCFmHiSVqwKaS3j69',
            value: 10
          },
          {
            id: 1,
            identifier: '268955',
            nickname: '认真的名称',
            avatar: 'Hth3oUjKs5lErzSkfeRrXdCaw4jZUAHhwsjemuzOaisoOVP4ZO',
            value: 6
          },
          {
            id: 3,
            identifier: '215434',
            nickname: '认真点的人',
            avatar: 'wGThkbz7RFPNEmPLv8a2JJW8RotHJeFHfSHgi0TFxMU1RpEUNe',
            value: 0
          }
        ],
        me: {
          id: 1,
          identifier: '268955',
          nickname: '认真的名称',
          rank: 2,
          value: 6
        }
      }
    })
  }
]
