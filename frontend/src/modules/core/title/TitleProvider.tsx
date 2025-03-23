import { EqualityFn, MemoizedFn, default as _memoizeOne } from "memoize-one"
import { Component, createContext, useContext } from "react"

type MemoizeOneFn = <TFunc extends (this: any, ...newArgs: any[]) => any>(
  resultFn: TFunc,
  isEqual?: EqualityFn<TFunc>,
) => MemoizedFn<TFunc>

// For reasons I have not spent time investigating, the type definitions for
// memoize-one or the way we import it doesn't seem to be right. This override
// fixes it as a workaround.
const memoizeOne = _memoizeOne as unknown as MemoizeOneFn

export interface ConsumerProps {
  title: string
  registerTitle: (comp: symbol, value: string) => void
  unregisterTitle: (comp: symbol) => void
  updateTitle: (comp: symbol, value: string) => void
}

const defaultValue: ConsumerProps = {
  title: "FBS",
  registerTitle: () => null,
  unregisterTitle: () => null,
  updateTitle: () => null,
}

export const useCurrentTitle = () => useContext(TitleContext).title

export const TitleContext = createContext(defaultValue)

interface Props {
  children: React.ReactNode
}

export class TitleProvider extends Component<Props> {
  components: { comp: symbol; value: string }[] = []
  override state = {
    title: defaultValue.title,
    mounts: [defaultValue.title],
  }
  getValue = memoizeOne((title: string) => ({
    title,
    registerTitle: this.registerTitle,
    unregisterTitle: this.unregisterTitle,
    updateTitle: this.updateTitle,
  }))
  registerTitle = (comp: symbol, value: string) => {
    this.components.push({
      comp,
      value,
    })
    this.refresh()
  }
  unregisterTitle = (comp: symbol) => {
    this.components = this.components.filter((elm) => elm.comp !== comp)
    this.refresh()
  }
  updateTitle = (comp: symbol, value: string) => {
    this.components = this.components.map((elm) =>
      elm.comp === comp ? { ...elm, value } : elm,
    )
    this.refresh()
  }
  refresh() {
    const title =
      this.components.length === 0
        ? defaultValue.title
        : this.components[this.components.length - 1]!.value

    this.setState({
      title,
    })

    document.title = title
  }
  override render() {
    return (
      <TitleContext.Provider value={this.getValue(this.state.title)}>
        {this.props.children}
      </TitleContext.Provider>
    )
  }
}
