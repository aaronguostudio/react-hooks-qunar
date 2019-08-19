import { useCallback } from 'react'
import { h0 } from './fp'

// 自定义 hook 函数
export default function useNav (departDate, dispatch, prevDate, nextDate) {
  const isPrevDisabled = h0(departDate) <= h0()
  const isNextDisabled = h0(departDate) - h0() > 20 * 86400 * 1000

  const prev = useCallback(() => {
    if (isPrevDisabled) return
    dispatch(prevDate())
  }, [dispatch, isPrevDisabled, prevDate])

  const next = useCallback(() => {
    if (isNextDisabled) return
    dispatch(nextDate())
  }, [dispatch, isNextDisabled, nextDate])

  return {
    isPrevDisabled,
    isNextDisabled,
    prev,
    next
  }
}
