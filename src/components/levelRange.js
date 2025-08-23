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
