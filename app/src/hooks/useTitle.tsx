import {
  createContext,
  ReactNode,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

interface TitleContextValue {
  title: string
  register: (id: symbol, value: string) => void
  unregister: (id: symbol) => void
  update: (id: symbol, value: string) => void
}

const TitleContext = createContext<TitleContextValue>({
  title: "FBS",
  register: () => {},
  unregister: () => {},
  update: () => {},
})

export function useCurrentTitle() {
  return useContext(TitleContext).title
}

export function useTitle(title: string) {
  const idRef = useRef(Symbol())
  const ctx = useContext(TitleContext)

  useLayoutEffect(() => {
    ctx.register(idRef.current, title)
    return () => {
      ctx.unregister(idRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    ctx.update(idRef.current, title)
  }, [ctx, title])
}

export function PageTitle({ title }: { title: string }) {
  useTitle(title)
  return null
}

export function TitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("FBS")
  const stackRef = useRef<{ id: symbol; value: string }[]>([])

  const refresh = () => {
    const stack = stackRef.current
    const newTitle = stack.length > 0 ? stack[stack.length - 1].value : "FBS"
    setTitle(newTitle)
    document.title = newTitle
  }

  const register = (id: symbol, value: string) => {
    stackRef.current.push({ id, value })
    refresh()
  }

  const unregister = (id: symbol) => {
    stackRef.current = stackRef.current.filter((s) => s.id !== id)
    refresh()
  }

  const update = (id: symbol, value: string) => {
    stackRef.current = stackRef.current.map((s) =>
      s.id === id ? { ...s, value } : s,
    )
    refresh()
  }

  return (
    <TitleContext.Provider value={{ title, register, unregister, update }}>
      {children}
    </TitleContext.Provider>
  )
}
