import { Children, Fragment, ReactNode } from "react"

export function CommaSeparated({ children }: { children: ReactNode }) {
  return (
    <>
      {Children.toArray(children).reduce<ReactNode[]>((acc, child, idx) => {
        if (acc.length > 0) {
          acc.push(<Fragment key={`comma-${idx}`}>, </Fragment>)
        }
        acc.push(child)
        return acc
      }, [])}
    </>
  )
}
