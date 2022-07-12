import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Subscription } from 'rxjs'
import { Flash, FlashesService } from './FlahesService'

export const FlashesContext = createContext<FlashesService | null>(null)

export function useFlashes() {
  const value = useContext(FlashesContext)
  if (value == null) {
    throw new Error('FlashesContext not provided')
  }
  return value
}

export function useFlashesList() {
  const flashesService = useFlashes()
  const subscriber = useRef<Subscription>()
  const [flashes, setFlashes] = useState<Flash[]>([])

  useEffect(() => {
    subscriber.current = flashesService
      .getFlashesObservable()
      .subscribe((flashes) => {
        setFlashes(flashes)
      })

    return () => {
      subscriber.current?.unsubscribe()
    }
  }, [flashesService])

  return flashes
}

interface Props {
  flashesService: FlashesService
  children: React.ReactNode
}

export function FlashesProvider(props: Props) {
  return (
    <FlashesContext.Provider value={props.flashesService}>
      {props.children}
    </FlashesContext.Provider>
  )
}
