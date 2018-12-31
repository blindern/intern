import React from 'react'
import { ConsumerProps, TitleContext } from './TitleProvider'

export class PageTitle extends React.Component<{ title: string }> {
  static contextType = TitleContext
  context: ConsumerProps
  componentWillMount() {
    this.context.registerTitle(this, this.props.title)
  }
  componentDidUpdate() {
    this.context.updateTitle(this, this.props.title)
  }
  componentWillUnmount() {
    this.context.unregisterTitle(this)
  }
  render() {
    return null
  }
}
