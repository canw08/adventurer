// tip-once.js
import { useTipBuddy } from '../composables/useTipBuddy.js'

const { show } = useTipBuddy()
const PREFIX = 'tips:'

/**
 * 只展示一次提示（永久记忆，看过就不再显示）
 * @param {string} key 唯一 key
 * @param {string} message 提示内容
 */
export function showOnce(key, message) {
  const storage = window.localStorage
  const fullKey = PREFIX + key

  // 已经展示过 → 不再显示
  if (storage.getItem(fullKey) === '1') {
    return false
  }

  // 展示提示
  show(message)

  // 打标记（只存“1”表示已看过）
  storage.setItem(fullKey, '1')
  return true
}

/** 清除某个 key 的标记（下次会重新显示） */
export function clearOnce(key) {
  window.localStorage.removeItem(PREFIX + key)
}
