// 用 JSDoc 标注类型，编辑器也有提示
/**
 * @typedef {{exp:[number,number], coin:[number,number], hours:[number,number]}} Range
 * @type {Record<string, Range>}
 */
export const levelRanges = Object.freeze({
  'F级':     { exp:[5,15],      coin:[10,20],    hours:[0,24] },
  'E级':     { exp:[30,50],     coin:[50,100],   hours:[0,24] },
  'D级':     { exp:[80,150],    coin:[100,150],  hours:[0,24] },
  'C级':     { exp:[250,400],   coin:[300,350],  hours:[0,24] },
  'B级':     { exp:[500,800],   coin:[400,600],  hours:[0,24] },
  'A级':     { exp:[1000,2000], coin:[800,1000], hours:[0,24] },
  'S级':     { exp:[3000,5000], coin:[2000,3000],hours:[0,24] },
  '定制':     { exp:[1,10000],  coin:[1,10000],  hours:[0,24] },

  'F': { exp:[5,15],      coin:[10,20],    hours:[0,24] },
  'E': { exp:[30,50],     coin:[50,100],   hours:[0,24] },
  'D': { exp:[80,150],    coin:[100,150],  hours:[0,24] },
  'C': { exp:[250,400],   coin:[300,350],  hours:[0,24] },
  'B': { exp:[500,800],   coin:[400,600],  hours:[0,24] },
  'A': { exp:[1000,2000], coin:[800,1000], hours:[0,24] },
  'S': { exp:[3000,5000], coin:[2000,3000],hours:[0,24] }
});

// 小工具函数（可选）
export const getLevelRange = (key) => levelRanges[key] ?? null;


// ===== 固定区间映射（金币 -> Level） =====
// 用 JSDoc 标注类型，方便编辑器提示
/**
 * @typedef {{level:'F'|'E'|'D'|'C'|'B'|'A'|'S', min:number, max:number}} CoinRule
 * @type {CoinRule[]}
 */
export const COIN_LEVEL_RULES = [
  { level: 'F', min: 1,   max: 9   },
  { level: 'E', min: 10,  max: 19  },
  { level: 'D', min: 20,  max: 39  },
  { level: 'C', min: 40,  max: 69  },
  { level: 'B', min: 70,  max: 109 },
  { level: 'A', min: 110, max: 159 },
  { level: 'S', min: 160, max: Infinity }
];

/**
 * 根据金币数返回对应 Level（默认低于 1 视为 'F'）
 * @param {number} coinNum
 * @returns {'F'|'E'|'D'|'C'|'B'|'A'|'S'}
 */
export function levelFromCoin(coinNum) {
  if (!Number.isFinite(coinNum) || coinNum < 1) return 'F';
  for (const r of COIN_LEVEL_RULES) {
    if (coinNum >= r.min && coinNum <= r.max) return r.level;
  }
  return 'S';
}
