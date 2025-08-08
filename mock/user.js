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
        experience: 0,
        tokens: 0,
        level: 'F',
        title: null,
        role: 'student',
      });
    },
  },
];
