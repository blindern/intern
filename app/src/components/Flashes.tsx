import { createRef, useState } from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { type Flash, useFlashes } from "../hooks/useFlashes.js"
import { formatDate } from "../utils/dates.js"

export function Flashes() {
  const { flashes } = useFlashes()
  const [nodeRefs] = useState(
    () => new WeakMap<Flash, React.RefObject<HTMLDivElement | null>>(),
  )

  function getNodeRef(flash: Flash) {
    if (!nodeRefs.has(flash)) {
      nodeRefs.set(flash, createRef<HTMLDivElement>())
    }
    return nodeRefs.get(flash)!
  }

  return (
    <TransitionGroup component={null}>
      {flashes.map((flash) => {
        const ref = getNodeRef(flash)
        return (
          <CSSTransition
            key={flash.id}
            timeout={200}
            classNames="flash"
            nodeRef={ref}
          >
            <div className="flash-wrap" ref={ref}>
              <div className={`flash-inner bg-${flash.type}`}>
                <b>{formatDate(flash.date, "HH:mm:ss")}:</b> {flash.message}
              </div>
            </div>
          </CSSTransition>
        )
      })}
    </TransitionGroup>
  )
}
