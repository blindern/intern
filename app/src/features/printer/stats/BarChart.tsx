import * as d3 from "d3"
import { useLayoutEffect, useMemo, useRef } from "react"

interface BarChartProps {
  data: { label: string; value: number }[]
  width?: number
  height?: number
  color?: string
  yLabel?: string
  formatValue?: (v: number) => string
}

export function BarChart({
  data,
  width: totalWidth = 700,
  height: totalHeight = 280,
  color = "steelblue",
  yLabel,
  formatValue,
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const stableFormatValue = useMemo(
    () => formatValue ?? ((v: number) => String(Math.round(v))),
    [formatValue],
  )

  useLayoutEffect(() => {
    if (!containerRef.current || data.length === 0) return
    const container = containerRef.current

    const margin = { top: 10, right: 20, bottom: 60, left: 60 }
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

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, width])
      .padding(0.15)

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(1, d3.max(data, (d) => d.value) ?? 0) * 1.1])
      .range([height, 0])

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.label)!)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("fill", color)

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")

    svg.append("g").call(
      d3
        .axisLeft(y)
        .ticks(6)
        .tickFormat((d) => stableFormatValue(d as number)),
    )

    if (yLabel) {
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text(yLabel)
    }

    svg
      .selectAll(".bar")
      .on("mouseenter", function (event, d) {
        const bar = d as { label: string; value: number }
        d3.select(containerRef.current)
          .select(".chart-tooltip")
          .style("display", "block")
          .text(`${bar.label}: ${stableFormatValue(bar.value)}`)
      })
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, containerRef.current)
        d3.select(containerRef.current)
          .select(".chart-tooltip")
          .style("left", `${mx + 10}px`)
          .style("top", "0px")
      })
      .on("mouseleave", function () {
        d3.select(containerRef.current)
          .select(".chart-tooltip")
          .style("display", "none")
      })

    return () => {
      d3.select(container).selectAll("svg").remove()
    }
  }, [data, totalWidth, totalHeight, color, yLabel, stableFormatValue])
  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        className="chart-tooltip"
        style={{
          display: "none",
          position: "absolute",
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: 4,
          fontSize: 13,
          pointerEvents: "none",
        }}
      />
    </div>
  )
}
