import { createRef, useState } from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { styled, keyframes } from "styled-components"
import { formatDate } from "utils/dates.js"
import { Flash } from "./FlahesService.js"
import { useFlashesList } from "./FlashesProvider.js"

const animateIn = keyframes`
  from {
    opacity: 1;
    max-height: 0;
  }
  to {
    max-height: 100px;
  }
`

const animateOut = keyframes`
  from {
    opacity: 1;
    max-height: 100px;
  }
  to {
    opacity: 0;
    max-height: 0;
  }
`

const MessageBoxWrap = styled.div`
  overflow-y: hidden;
  box-sizing: border-box;

  &.flash-enter {
    animation: ${animateIn} 0.2s forwards;
  }
  &.flash-exit {
    animation: ${animateOut} 0.2s forwards;
  }
`

const MessageBox = styled.div`
  margin-top: 15px;
  padding: 15px;
`

export const Flashes = () => {
  const flashes = useFlashesList()
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
      {flashes.map((flash, idx) => {
        const ref = getNodeRef(flash)
        return (
          <CSSTransition
            key={idx}
            timeout={300}
            classNames="flash"
            nodeRef={ref}
          >
            <MessageBoxWrap ref={ref}>
              <MessageBox className={flash.type ? `bg-${flash.type}` : ""}>
                <b>{formatDate(flash.date, "HH:mm:ss")}:</b> {flash.message}
              </MessageBox>
            </MessageBoxWrap>
          </CSSTransition>
        )
      })}
    </TransitionGroup>
  )
}
