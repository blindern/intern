import React, { ReactChild, ReactNode } from 'react'

const CommaSeparated = ({ children }: { children: ReactNode }) => (
  <>
    {React.Children.toArray(children).reduce<ReactChild[]>(
      (acc, child, idx) => {
        if (acc.length > 0) {
          acc.push(<React.Fragment key={`comma-${idx}`}>, </React.Fragment>)
        }
        acc.push(child)
        return acc
      },
      [],
    )}
  </>
)

export default CommaSeparated
