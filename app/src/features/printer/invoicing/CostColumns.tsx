import { Fragment } from "react"
import { FormatNumber } from "../FormatNumber.js"

function RightTd({ children }: { children?: React.ReactNode }) {
  return <td style={{ textAlign: "right" }}>{children}</td>
}

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

export { RightTd }
