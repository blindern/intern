import { FormatNumber } from 'components/FormatNumber'
import { RightTd } from 'modules/printer/invoicing/Helpers'
import React from 'react'

export function CostColumns({
  countByCost,
}: {
  countByCost: Record<number, number>
}) {
  return (
    <>
      <RightTd>
        {Object.keys(countByCost).map((it) => (
          <React.Fragment key={it}>
            <FormatNumber value={it} />
            <br />
          </React.Fragment>
        ))}
      </RightTd>
      <RightTd>
        {Object.values(countByCost).map((it) => (
          <React.Fragment key={it}>
            <FormatNumber value={it} decimals={0} />
            <br />
          </React.Fragment>
        ))}
      </RightTd>
    </>
  )
}
