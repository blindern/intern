import { useContext, useEffect, useRef } from 'react'
import { TitleContext } from './TitleProvider'

export function PageTitle({ title }: { title: string }) {
  const ref = useRef(Symbol())
  const context = useContext(TitleContext)

  useEffect(() => {
    context.registerTitle(ref.current, title)
    return () => {
      context.unregisterTitle(ref.current)
    }
  }, [])

  useEffect(() => {
    context.updateTitle(ref.current, title)
  }, [title])

  return null
}
