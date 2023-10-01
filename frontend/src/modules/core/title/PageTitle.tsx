import { useContext, useLayoutEffect, useState } from "react"
import { TitleContext } from "./TitleProvider"

export function useTitle(title: string) {
  const [titleSymbol] = useState(() => Symbol())
  const context = useContext(TitleContext)

  useLayoutEffect(() => {
    context.registerTitle(titleSymbol, title)
    return () => {
      context.unregisterTitle(titleSymbol)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, titleSymbol])

  useLayoutEffect(() => {
    context.updateTitle(titleSymbol, title)
  }, [context, title, titleSymbol])
}

export function PageTitle({ title }: { title: string }) {
  useTitle(title)
  return null
}
