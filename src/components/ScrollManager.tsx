import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * SPA 路由不会触发浏览器原生的页面滚动重置。
 * 路径变化时回到顶部；显式 hash 存在时保留锚点导航。
 * search 参数变化不处理，避免练习页切题时被拉回顶部。
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      const frame = requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
      })
      return () => cancelAnimationFrame(frame)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
