// 一个超轻量的全局事件总线（不依赖 mitt）
const listeners = { show: new Set(), hide: new Set() }

export function useTipBuddy() {
  const show = (message) => {
    // 允许 show('文本') 或 show({ message: '文本' })
    const payload = typeof message === 'string' ? { message } : (message || {})
    listeners.show.forEach(fn => fn(payload))
  }
  const hide = () => { listeners.hide.forEach(fn => fn()) }

  const onShow = (fn) => listeners.show.add(fn)
  const offShow = (fn) => listeners.show.delete(fn)
  const onHide = (fn) => listeners.hide.add(fn)
  const offHide = (fn) => listeners.hide.delete(fn)

  return { show, hide, onShow, offShow, onHide, offHide }
}
