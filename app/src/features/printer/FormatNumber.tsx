const formatters = new Map<number, Intl.NumberFormat>()

function getFormatter(decimals: number) {
  let fmt = formatters.get(decimals)
  if (!fmt) {
    fmt = new Intl.NumberFormat("nb-NO", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    formatters.set(decimals, fmt)
  }
  return fmt
}

export function FormatNumber({
  value,
  decimals = 2,
}: {
  value: number | string
  decimals?: number
}) {
  const number = typeof value === "number" ? value : parseFloat(value)
  return <>{getFormatter(decimals).format(number)}</>
}
