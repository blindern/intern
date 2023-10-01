import * as d3 from "d3"
import { Selection } from "d3-selection"
import moment from "utils/moment"
import React, { useLayoutEffect, useMemo, useRef } from "react"
import { PrinterInvoiceResponse } from "modules/printer/api"

// chart for daily usage
// using D3.js

function getDaily(data: PrinterInvoiceResponse): Record<string, number> {
  // daily statistics
  const daily: Record<string, number> = {}
  let d = moment(data.from)
  const d_end = moment(data.to)
  while (true) {
    daily[d.format("YYYY-MM-DD")] = 0
    d = d.add(1, "day")
    if (!d.isBefore(d_end)) break
  }

  for (const row of data.daily) {
    daily[row.jobday] = row.sum_jobsize
  }

  return daily
}

export function DailyGraph({
  rawdata,
  dateFrom,
  dateTo,
}: {
  rawdata: PrinterInvoiceResponse
  dateFrom: string
  dateTo: string
}) {
  const data = useMemo(() => getDaily(rawdata), [rawdata])

  const el = useRef<HTMLDivElement>(null)
  const svg = useRef<Selection<SVGGElement, any, any, any>>()

  const margin = { top: 20, right: 30, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom

  useLayoutEffect(() => {
    if (svg.current == null) {
      svg.current = d3
        .select(el.current)
        .append("svg")
        .attr("class", "printerchart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
    }
  }, [])

  useLayoutEffect(() => {
    const parseDate = d3.timeParse("%Y-%m-%d")
    const myTimeFormatter = (date: Date) => moment(date).format("D. MMM")

    const newdata = Object.entries(data).map(([i, elm]) => ({
      date: parseDate(i)!,
      value: +elm,
    }))

    const x = d3
      .scaleTime()
      .domain([parseDate(dateFrom)!, parseDate(dateTo)!])
      .range([0, width])
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(newdata, (d) => d.value)!])
      .range([height, 0])
    const xAxis = d3.axisBottom(x).tickFormat(myTimeFormatter)
    const yAxis = d3.axisLeft(y).ticks(6)
    const area = d3
      .area<(typeof newdata)[0]>()
      .x((d) => {
        return x(d.date)
      })
      .y0(y(0))
      .y1((d) => {
        return y(d.value)
      })

    svg.current!.selectAll("*").remove()

    svg.current!.append("path").attr("class", "area").attr("d", area(newdata))

    svg
      .current!.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)

    svg
      .current!.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("class", "ytext")
      .style("text-anchor", "end")
      .text("Antall utskrifter")
  }, [data])

  return (
    <>
      <h2>Daglig statistikk</h2>
      <div ref={el}></div>
    </>
  )
}
