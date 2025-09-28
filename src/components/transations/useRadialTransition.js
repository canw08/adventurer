import { createApp } from 'vue'
import RadialOverlay from './RadialRevealOverlay.vue'
import { useRouter } from 'vue-router'

let _vm = null
let _mountEl = null

function ensureOverlay() {
  if (_vm) return _vm
  _mountEl = document.createElement('div')
  document.body.appendChild(_mountEl)
  const app = createApp(RadialOverlay)
  _vm = app.mount(_mountEl) // 通过 defineExpose，可直接拿到 play
  return _vm
}

export function useRadialTransition() {
  const router = useRouter()

  // 路由跳转 + 动画
  function radialTo(to, opts = {}) {
    const vm = ensureOverlay()
    return vm.play({
      ...opts,
      to,
      push: (target) =>
        typeof target === 'string' ? router.push(target) : router.push(target)
    })
  }

  // 只做动画，不跳路由
  function radialEffect(opts = {}) {
    const vm = ensureOverlay()
    return vm.play({ ...opts, to: null, push: null })
  }

  return { radialTo, radialEffect }
}
