import { FormatNumber } from "components/FormatNumber.js"
import { RightTd } from "modules/printer/invoicing/Helpers.js"
import { Fragment } from "react"

export function CostColumns({
  countByCost,
}: {
  countByCost: Record<number, number>
}) {
  return (
    <>
      <RightTd>
        {Object.keys(countByCost).map((it) => (
          <Fragment key={it}>
            <FormatNumber value={it} />
            <br />
          </Fragment>
        ))}
      </RightTd>
      <RightTd>
        {Object.values(countByCost).map((it) => (
          <Fragment key={it}>
            <FormatNumber value={it} decimals={0} />
            <br />
          </Fragment>
        ))}
      </RightTd>
    </>
  )
}
