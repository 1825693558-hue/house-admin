// 在 React 组件外使用的导航工具
// 在 App.tsx 中通过 NavigateSetter 注册 navigate 实例

let navigateFn: ((path: string) => void) | null = null

export function setNavigate(fn: (path: string) => void) {
  navigateFn = fn
}

export function navigateTo(path: string) {
  if (navigateFn) {
    navigateFn(path)
  } else {
    // 降级：navigate 尚未注册时使用原始跳转
    window.location.href = path
  }
}