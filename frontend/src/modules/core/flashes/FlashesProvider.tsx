import memoizeOne from 'memoize-one'
import React, { createContext } from 'react'
import { Subscription } from 'rxjs'
import { flashesService } from '.'
import { Flash, FlashArgs } from './FlahesService'

interface ConsumerProps {
  flashes: Flash[]
  flash: (data: FlashArgs) => void
}

const defaultValue: ConsumerProps = {
  flashes: [],
  flash: () => null,
}

export const FlashesContext = createContext(defaultValue)

interface Props {
  children: React.ReactNode
}

interface State {
  flashes: Flash[]
}

export default class FlashesProvider extends React.Component<Props, State> {
  subscriber?: Subscription

  state = {
    flashes: [],
  }

  componentDidMount() {
    this.subscriber = flashesService
      .getFlashesObservable()
      .subscribe((flashes) => {
        this.setState({
          flashes,
        })
      })
  }

  componentWillUnmount() {
    if (this.subscriber) this.subscriber.unsubscribe()
  }

  getValue = memoizeOne((state: State) => ({
    flashes: state.flashes,
    flash: (args: FlashArgs) => flashesService.addFlash(args),
  }))

  render() {
    return (
      <FlashesContext.Provider value={this.getValue(this.state)}>
        {this.props.children}
      </FlashesContext.Provider>
    )
  }
}
