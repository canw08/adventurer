// 用 JSDoc 标注类型，编辑器也有提示
/**
 * @typedef {{exp:[number,number], coin:[number,number], hours:[number,number]}} Range
 * @type {Record<string, Range>}
 */
export const levelRanges = Object.freeze({
  'F级': { exp:[4,4],   coin:[1,3],   hours:[0,24] },
  'E级': { exp:[8,8],   coin:[4,6],   hours:[0,24] },
  'D级': { exp:[10,10], coin:[7,10],  hours:[0,24] },
  'C级': { exp:[14,14], coin:[11,15], hours:[0,24] },
  'B级': { exp:[18,18], coin:[16,20], hours:[0,24] },
  'A级': { exp:[24,24], coin:[21,25], hours:[0,24] },
  'S级': { exp:[30,30], coin:[26,Infinity], hours:[0,24] },
  '定制': { exp:[1,10000], coin:[1,10000], hours:[0,24] },

  // 简写版本
  'F': { exp:[4,4],   coin:[1,3],   hours:[0,24] },
  'E': { exp:[8,8],   coin:[4,6],   hours:[0,24] },
  'D': { exp:[10,10], coin:[7,10],  hours:[0,24] },
  'C': { exp:[14,14], coin:[11,15], hours:[0,24] },
  'B': { exp:[18,18], coin:[16,20], hours:[0,24] },
  'A': { exp:[24,24], coin:[21,25], hours:[0,24] },
  'S': { exp:[30,30], coin:[26,Infinity], hours:[0,24] }
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
  { level: 'F', min: 1,  max: 3 },
  { level: 'E', min: 4,  max: 6 },
  { level: 'D', min: 7,  max: 10 },
  { level: 'C', min: 11, max: 15 },
  { level: 'B', min: 16, max: 20 },
  { level: 'A', min: 21, max: 25 },
  { level: 'S', min: 26, max: Infinity }
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
