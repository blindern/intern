import memoizeOne from 'memoize-one'
import React, { Component, createContext, useContext } from 'react'

export interface ConsumerProps {
  title: string
  registerTitle: (comp: Component, value: string) => void
  unregisterTitle: (comp: Component) => void
  updateTitle: (comp: Component, value: string) => void
}

const defaultValue: ConsumerProps = {
  title: 'FBS',
  registerTitle: () => null,
  unregisterTitle: () => null,
  updateTitle: () => null,
}

export const useTitle = () => useContext(TitleContext).title

export const TitleContext = createContext(defaultValue)

export default class TitleProvider extends React.Component {
  components: Array<{ comp: Component; value: string }> = []
  state = {
    title: defaultValue.title,
    mounts: [defaultValue.title],
  }
  getValue = memoizeOne((title: string) => ({
    title,
    registerTitle: this.registerTitle,
    unregisterTitle: this.unregisterTitle,
    updateTitle: this.updateTitle,
  }))
  registerTitle = (comp: Component, value: string) => {
    this.components.push({
      comp,
      value,
    })
    this.refresh()
  }
  unregisterTitle = (comp: Component) => {
    this.components = this.components.filter((elm) => elm.comp !== comp)
    this.refresh()
  }
  updateTitle = (comp: Component, value: string) => {
    this.components = this.components.map((elm) =>
      elm.comp === comp ? { ...elm, value } : elm,
    )
    this.refresh()
  }
  refresh() {
    const title =
      this.components.length === 0
        ? defaultValue.title
        : this.components[this.components.length - 1].value

    this.setState({
      title,
    })

    document.title = title
  }
  render() {
    return (
      <TitleContext.Provider value={this.getValue(this.state.title)}>
        {this.props.children}
      </TitleContext.Provider>
    )
  }
}
