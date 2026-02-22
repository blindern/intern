import * as d3 from "d3"
import { useLayoutEffect, useRef } from "react"

interface StackedAreaChartProps {
  years: string[]
  series: { name: string; values: number[] }[]
  width?: number
  height?: number
  formatValue?: (v: number) => string
}

const COLORS = [
  "#4e79a7",
  "#f28e2b",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc948",
  "#b07aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ac",
]

export function StackedAreaChart({
  years,
  series,
  width: totalWidth = 700,
  height: totalHeight = 300,
  formatValue = (v: number) =>
    new Intl.NumberFormat("nb-NO").format(Math.round(v)),
}: StackedAreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!containerRef.current || years.length === 0) return
    const container = containerRef.current

    const margin = { top: 10, right: 150, bottom: 30, left: 60 }
    const width = totalWidth - margin.left - margin.right
    const height = totalHeight - margin.top - margin.bottom

    d3.select(containerRef.current).selectAll("svg").remove()

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("class", "printer-stats-chart")
      .attr("width", totalWidth)
      .attr("height", totalHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const stackData = years.map((year, i) => {
      const row: Record<string, number | string> = { year }
      for (const s of series) {
        row[s.name] = s.values[i] ?? 0
      }
      return row
    })

    const keys = series.map((s) => s.name)
    const stack = d3.stack<Record<string, number | string>>().keys(keys)
    const stacked = stack(stackData as Iterable<Record<string, number>>)

    const x = d3.scalePoint().domain(years).range([0, width])

    const y = d3
      .scaleLinear()
      .domain([
        0,
        Math.max(
          1,
          d3.max(stacked, (layer) => d3.max(layer, (d) => d[1])) ?? 0,
        ) * 1.05,
      ])
      .range([height, 0])

    const color = d3.scaleOrdinal<string>().domain(keys).range(COLORS)

    const area = d3
      .area<d3.SeriesPoint<Record<string, number>>>()
      .x((d) => x(String(d.data.year))!)
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX)

    svg
      .selectAll(".layer")
      .data(stacked)
      .enter()
      .append("path")
      .attr("class", "layer")
      .attr("d", area as d3.ValueFn<SVGPathElement, unknown, string | null>)
      .attr("fill", (d) => color(d.key))
      .attr("opacity", 0.85)

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")

    svg.append("g").call(d3.axisLeft(y).ticks(6))

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + 15}, 0)`)

    keys.forEach((key, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 18})`)
      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(key))
      g.append("text")
        .attr("x", 16)
        .attr("y", 10)
        .attr("font-size", "11px")
        .text(key)
    })

    const guideLine = svg
      .append("line")
      .attr("class", "guide-line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,3")
      .style("display", "none")

    const tooltip = d3.select(containerRef.current).select(".chart-tooltip")

    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event)

        let nearestIdx = 0
        let nearestDist = Infinity
        years.forEach((yr, i) => {
          const px = x(yr)!
          const dist = Math.abs(mx - px)
          if (dist < nearestDist) {
            nearestDist = dist
            nearestIdx = i
          }
        })

        const yr = years[nearestIdx]
        const xPos = x(yr)!

        guideLine.attr("x1", xPos).attr("x2", xPos).style("display", null)

        const row = stackData[nearestIdx]
        const total = keys.reduce((sum, k) => sum + (Number(row[k]) || 0), 0)

        const tooltipEl = tooltip.node() as HTMLElement | null
        if (tooltipEl) {
          tooltipEl.textContent = ""
          const title = document.createElement("strong")
          title.textContent = yr
          tooltipEl.appendChild(title)
          for (const k of keys) {
            const val = Number(row[k])
            if (val <= 0) continue
            tooltipEl.appendChild(document.createElement("br"))
            const span = document.createElement("span")
            span.style.color = color(k)
            span.textContent = "\u25A0"
            tooltipEl.appendChild(span)
            tooltipEl.appendChild(
              document.createTextNode(` ${k}: ${formatValue(val)}`),
            )
          }
          tooltipEl.appendChild(document.createElement("br"))
          const totalEl = document.createElement("strong")
          totalEl.textContent = `Totalt: ${formatValue(total)}`
          tooltipEl.appendChild(totalEl)
        }

        tooltip.style("display", "block")

        const containerMx = d3.pointer(event, containerRef.current)[0]
        tooltip.style("left", `${containerMx + 14}px`).style("top", "0px")
      })
      .on("mouseleave", function () {
        guideLine.style("display", "none")
        tooltip.style("display", "none")
      })

    return () => {
      d3.select(container).selectAll("svg").remove()
    }
  }, [years, series, totalWidth, totalHeight, formatValue])

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        className="chart-tooltip"
        style={{
          display: "none",
          position: "absolute",
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: 4,
          fontSize: 13,
          pointerEvents: "none",
          lineHeight: 1.5,
          whiteSpace: "nowrap",
        }}
      />
    </div>
  )
}
