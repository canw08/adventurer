import Mock from 'mockjs';

export default [
  // 获取商店物品列表
  {
    url: '/shop/items/',
    method: 'get',
    response: () => ({
      items: [
        {
          id: 1,
          name: "一颗甜菜根",
          description: "这是一颗甜菜根，看起来味道不错。",
          image: "https://picsum.photos/200/200?random=2",
          token_price: 100,
          category: "cultural",
          icon_style_id: 1
        }
      ]
    })
  },

  // 获取用户的库存
  {
    url: '/shop/inventory/',
    method: 'get',
    response: () => ({
      inventory: [
        {
          id: 1,
          item: {
            id: 1,
            name: "一颗甜菜根",
            description: "这是一颗甜菜根，看起来味道不错。",
            image: "https://picsum.photos/200/200?random=2",
            token_price: 100,
            category: "cultural",
            icon_style_id: 1
          },
          purchase_price: 100,
          status: "stored",
          purchased_at: "2026-03-15T11:35:44.758340Z",
          delivered_at: null,
          delivery_request: null
        }
      ]
    })
  },

  // 购买物品
  {
    url: '/shop/items/1/purchase/',
    method: 'post',
    response: () => ({
      message: "购买成功",
      tokens: 177,
      inventory_item: {
        id: 1,
        item: {
          id: 1,
          name: "一颗甜菜根",
          description: "这是一颗甜菜根，看起来味道不错。",
          image: "https://picsum.photos/200/200?random=2",
          token_price: 100,
          category: "cultural",
          icon_style_id: 1
        },
        purchase_price: 100,
        status: "stored",
        purchased_at: "2026-03-15T11:35:44.758340Z",
        delivered_at: null,
        delivery_request: null
      }
    })
  }
]