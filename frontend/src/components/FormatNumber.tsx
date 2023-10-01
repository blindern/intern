import React from "react"

export function FormatNumber({
  value,
  decimals = 2,
}: {
  value: number | string
  decimals?: number
}) {
  const number = typeof value === "number" ? value : parseFloat(value)
  const numberStr = number.toFixed(decimals) + ""

  const x = numberStr.split(".")
  let x1 = x[0]!
  const x2 = x.length > 1 ? "," + x[1] : ""
  const rgx = /(\d+)(\d{3})/
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + " " + "$2")
  }

  return <>{x1 + x2}</>
}
