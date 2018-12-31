import memoizeOne from 'memoize-one'
import React, { createContext } from 'react'

type FlashType = 'danger' | null

export interface Flash {
  type: FlashType
  message: string
  date: Date
}

interface ConsumerProps {
  flashes: Flash[]
  flash: (data: FlashArgs) => void
}

interface FlashArgs {
  message: string
  type?: FlashType
}

const defaultValue: ConsumerProps = {
  flashes: [],
  flash: () => null,
}

export const FlashesContext = createContext(defaultValue)

interface State {
  flashes: Flash[]
}

export default class FlashesProvider extends React.Component<{}, State> {
  state = {
    flashes: [],
  }
  getValue = memoizeOne(state => ({
    flashes: state.flashes,
    flash: this.flash,
  }))
  flash = ({ message, type = 'danger' }: FlashArgs) => {
    const flashObj: Flash = {
      type,
      message,
      date: new Date(),
    }

    this.setState(state => ({
      ...state,
      flashes: state.flashes.concat([flashObj]),
    }))

    setTimeout(() => {
      // Don't bother checking for unmount.
      this.setState(state => ({
        ...state,
        flashes: state.flashes.filter(item => item !== flashObj),
      }))
    }, 3000)
  }
  render() {
    return (
      <FlashesContext.Provider value={this.getValue(this.state)}>
        {this.props.children}
      </FlashesContext.Provider>
    )
  }
}
