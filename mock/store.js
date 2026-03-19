import Mock from 'mockjs'

const itemsDB = {
  1: {
    id: 1,
    name: "瑞幸咖啡",
    description: "提神醒脑",
    image: "https://picsum.photos/200?random=1",
    token_price: 32,
    category: "food",
    icon_style_id: 1
  },
  2: {
    id: 2,
    name: "蛋糕",
    description: "甜甜的快乐",
    image: "https://picsum.photos/200?random=2",
    token_price: 50,
    category: "food",
    icon_style_id: 2
  }
}

let userTokens = 200

export default [
  {
    url: '/shop/items/',
    method: 'get',
    response: () => {
      return {
        items: Object.values(itemsDB)
      }
    }
  },
  {
    url: /\/shop\/items\/\d+\/purchase\//,
    method: 'post',
    response: (config) => {
      const id = config.url.match(/\/shop\/items\/(\d+)\//)[1]
      const item = itemsDB[id]

      if (!item) {
        return {
          status: 404,
          message: "商品不存在"
        }
      }

      if (userTokens < item.token_price) {
        return {
          status: 400,
          message: "金币不足"
        }
      }

      userTokens -= item.token_price

      return {
        message: `购买 ${item.name} 成功`,
        tokens: userTokens,
        inventory_item: {
          id: Date.now(),
          item: item
        }
      }
    }
  }
]