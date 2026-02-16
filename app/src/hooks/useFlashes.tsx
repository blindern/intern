import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"

export interface Flash {
  id: number
  type: "danger" | "success"
  message: string
  date: Date
}

interface FlashesContextValue {
  flashes: Flash[]
  addFlash: (args: { message: string; type?: "danger" | "success" }) => void
}

const FlashesContext = createContext<FlashesContextValue>({
  flashes: [],
  addFlash: () => {},
})

export function useFlashes() {
  return useContext(FlashesContext)
}

let nextFlashId = 0

export function FlashesProvider({ children }: { children: ReactNode }) {
  const [flashes, setFlashes] = useState<Flash[]>([])

  const addFlash = useCallback(
    ({
      message,
      type = "danger",
    }: {
      message: string
      type?: "danger" | "success"
    }) => {
      const flash: Flash = {
        id: nextFlashId++,
        type,
        message,
        date: new Date(),
      }
      setFlashes((prev) => [...prev, flash])

      setTimeout(() => {
        setFlashes((prev) => prev.filter((f) => f !== flash))
      }, 3000)
    },
    [],
  )

  return (
    <FlashesContext.Provider value={{ flashes, addFlash }}>
      {children}
    </FlashesContext.Provider>
  )
}
