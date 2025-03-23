import { Children, Fragment, ReactNode } from "react"

export const CommaSeparated = ({ children }: { children: ReactNode }) => (
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
