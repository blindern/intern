import * as d3 from "d3"
import { type Selection } from "d3"
import { createFileRoute } from "@tanstack/react-router"
import { ErrorMessages } from "../../components/ErrorMessages.js"
import { FormatNumber } from "../../components/FormatNumber.js"
import { Loading } from "../../components/Loading.js"
import { usePrinterInvoiceData } from "../../hooks/usePrinter.js"
import { PageTitle } from "../../hooks/useTitle.js"
import { formatDate } from "../../utils/dates.js"
import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react"
import moment from "../../utils/moment.js"

export const Route = createFileRoute("/printer/fakturere")({
  component: PrinterInvoicingPage,
})

// --- Types ---

interface PrinterInvoiceResponse {
  prints: {
    printername: string
    users: {
      username: string
      prints: {
        jobyear: string
        jobmonth: string
        count_jobs: number
        sum_jobsize: number
        last_jobdate: string
        username: string
        printername: string
        cost_each: number
      }[]
    }[]
  }[]
  texts: Record<string, string>
  no_faktura: string[]
  from: string
  to: string
  daily: {
    jobday: string
    count_jobs: number
    sum_jobsize: number
  }[]
  sections: Record<
    string,
    {
      printers: string[]
      is_beboer: boolean
      title: string
      description: string
    }
  >
  section_default: string
  accounts: {
    printers: string[] | null
    account: string | number
    text: string
  }[]
  realnames: Record<string, string>
  utflyttet: string[]
}

interface PrinterUser {
  username: string
  realname: string
  utflyttet: boolean
  months: {
    name: string
    costEach: number
    summer: Summer
  }[]
  summer: Summer
}

interface AggregatedData {
  summer: Summer
  sections: {
    summer: Summer
    title: string
    description: string | null
    isBeboer: boolean
    printers: {
      summer: Summer
      printername: string
      comment: string | undefined
      users: PrinterUser[]
    }[]
  }[]
}

// --- Summer class ---

class Summer {
  prev?: Summer | undefined

  numJobs = 0
  numPages = 0
  numPagesReal = 0
  numPagesAlt = 0
  amount = 0
  amountReal = 0
  amountAlt = 0
  countByCost: Record<number, number> = {}

  constructor(prev?: Summer) {
    this.prev = prev
  }

  add(props: {
    jobCount: number
    totalJobSize: number
    costEach: number
    isAlt: boolean
  }) {
    this.numJobs += props.jobCount
    this.numPages += props.totalJobSize
    this.amount += props.costEach * props.totalJobSize

    if (props.isAlt) {
      this.amountAlt += props.costEach * props.totalJobSize
      this.numPagesAlt += props.totalJobSize
    } else {
      this.amountReal += props.costEach * props.totalJobSize
      this.numPagesReal += props.totalJobSize
    }

    this.countByCost[props.costEach] ??= 0
    this.countByCost[props.costEach] += props.totalJobSize

    if (this.prev) {
      this.prev.add(props)
    }
  }
}

// --- Aggregation ---

function aggregateData(
  data: PrinterInvoiceResponse,
): AggregatedData | undefined {
  const totalSummer = new Summer()
  const sections: Record<string | number, AggregatedData["sections"][0]> = {}
  const printernameToSectionKey: Record<string, string> = {}

  for (const [key, section] of Object.entries(data.sections)) {
    sections[key] = {
      title: section.title,
      description: section.description,
      isBeboer: section.is_beboer,
      printers: [],
      summer: new Summer(totalSummer),
    }

    for (const printer of section.printers) {
      printernameToSectionKey[printer] = key
    }
  }

  for (const printer of data.prints) {
    const sectionKey =
      printernameToSectionKey[printer.printername] ?? data.section_default
    const section = sections[sectionKey]
    const printerSummer = new Summer(section.summer)
    const isAlt = data.no_faktura.includes(printer.printername)

    const users: PrinterUser[] = []

    for (const user of printer.users) {
      const userSummer = new Summer(printerSummer)

      const months: PrinterUser["months"] = []
      for (const printmonth of user.prints) {
        const summer = new Summer(userSummer)
        summer.add({
          jobCount: printmonth.count_jobs,
          totalJobSize: printmonth.sum_jobsize,
          costEach: printmonth.cost_each,
          isAlt,
        })
        months.push({
          name: printmonth.jobyear + "-" + printmonth.jobmonth,
          costEach: printmonth.cost_each,
          summer,
        })
      }

      users.push({
        summer: userSummer,
        username: user.username,
        realname: data.realnames[user.username],
        utflyttet: data.utflyttet.includes(user.username),
        months,
      })
    }

    section.printers.push({
      summer: printerSummer,
      printername: printer.printername,
      comment: data.texts[printer.printername],
      users,
    })
  }

  return {
    summer: totalSummer,
    sections: Object.values(sections),
  }
}

// --- Hooks ---

function useDates() {
  const [dateFrom, setDateFrom] = useState(() =>
    moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
  )

  const [dateTo, setDateTo] = useState(() =>
    moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
  )

  function changeMonth(modifyBy: number) {
    setDateFrom(
      moment(dateFrom)
        .add(modifyBy, "month")
        .startOf("month")
        .format("YYYY-MM-DD"),
    )
    setDateTo(
      moment(dateTo).add(modifyBy, "month").endOf("month").format("YYYY-MM-DD"),
    )
  }

  return { setDateFrom, setDateTo, dateFrom, dateTo, changeMonth }
}

// --- Helper components ---

function RightTd({ children }: { children?: React.ReactNode }) {
  return <td style={{ textAlign: "right" }}>{children}</td>
}

function CostColumns({ countByCost }: { countByCost: Record<number, number> }) {
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

// --- Summary ---

function Summary({
  data,
  summer,
}: {
  data: PrinterInvoiceResponse
  summer: Summer
}) {
  const { uniquePeople, uniquePeopleBeboer } = useMemo(() => {
    const beboerPrinters = Object.values(data.sections)
      .filter((it) => it.is_beboer)
      .flatMap((it) => it.printers)

    return {
      uniquePeople: new Set(
        data.prints.flatMap((printer) =>
          printer.users.map((user) => user.username),
        ),
      ).size,
      uniquePeopleBeboer: new Set(
        data.prints
          .filter((printer) => beboerPrinters.includes(printer.printername))
          .flatMap((printer) => printer.users.map((user) => user.username)),
      ).size,
    }
  }, [data])

  return (
    <>
      <h2>Total statistikk</h2>
      <dl className="dl-horizontal">
        <dt>Bruk i perioden</dt>
        <dd>
          kr <FormatNumber value={summer.amountReal} /> (se spesifikasjon
          nedenfor)
        </dd>
        <dt>Antall utskriftsjobber</dt>
        <dd>
          <FormatNumber value={summer.numJobs} decimals={0} />
        </dd>
        <dt>Antall sider</dt>
        <dd>
          <FormatNumber value={summer.numPages} decimals={0} /> (
          <FormatNumber
            value={summer.numPagesReal}
            decimals={0}
          /> faktureres,{" "}
          <FormatNumber value={summer.numPagesAlt} decimals={0} /> ikke)
        </dd>
        <dt>Antall personer</dt>
        <dd>{uniquePeopleBeboer} (privat bruk)</dd>
        <dd>{uniquePeople} (inkludert grupper)</dd>
      </dl>
    </>
  )
}

// --- Daily Graph ---

function getDaily(data: PrinterInvoiceResponse): Record<string, number> {
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

function DailyGraph({
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
  const svg = useRef<Selection<SVGGElement, any, any, any>>(null)

  const margin = { top: 20, right: 30, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom

  useLayoutEffect(() => {
    svg.current ??= d3
      .select(el.current)
      .append("svg")
      .attr("class", "printerchart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
  }, [height, margin.bottom, margin.left, margin.right, margin.top, width])

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
    const xAxis = d3.axisBottom<Date>(x).tickFormat(myTimeFormatter)
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
  }, [data, dateFrom, dateTo, height, width])

  return (
    <>
      <h2>Daglig statistikk</h2>
      <div ref={el}></div>
    </>
  )
}

// --- List Summed ---

function ListSummed({
  data,
  rawdata,
}: {
  data: AggregatedData
  rawdata: PrinterInvoiceResponse
}) {
  return (
    <div className="row">
      {data.sections.map((section, sectionidx) => {
        const groups = section.isBeboer
          ? section.printers
              .flatMap((it) => it.users)
              .sort((a, b) => a.realname.localeCompare(b.realname))
              .map((it) => ({
                name: it.realname,
                summer: it.summer,
                utflyttet: it.utflyttet,
                comment: undefined,
              }))
          : [...section.printers]
              .sort((a, b) => a.printername.localeCompare(b.printername))
              .map((it) => ({
                name: it.printername,
                summer: it.summer,
                utflyttet: undefined as boolean | undefined,
                comment: it.comment,
              }))

        return (
          <div key={sectionidx} className="col-md-6 printergroup">
            <h2>{section.title}</h2>

            {section.isBeboer &&
              section.printers
                .filter((it) => it.comment != null && it.comment !== "")
                .map((group, groupidx) => (
                  <p key={groupidx}>{group.comment}</p>
                ))}

            {section.description && <p>{section.description}</p>}

            <table
              className="table table-striped table-condensed"
              style={{ width: "auto" }}
            >
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Per side</th>
                  <th>Sider</th>
                  <th>Å betale</th>
                  {!section.isBeboer && <th>Kommentar</th>}
                </tr>
              </thead>
              <tfoot>
                <tr style={{ fontStyle: "italic", fontWeight: "bold" }}>
                  <td>Sum ({groups.length} stk)</td>
                  <td />
                  <RightTd>
                    <FormatNumber
                      value={section.summer.numPages}
                      decimals={0}
                    />
                  </RightTd>
                  <RightTd>
                    <FormatNumber value={section.summer.amountReal} />
                  </RightTd>
                  {!section.isBeboer && <td />}
                </tr>
              </tfoot>
              <tbody>
                {groups.map((row) => {
                  const hasComment = row.comment != null && row.comment !== ""

                  return (
                    <tr key={row.name}>
                      <td>
                        {row.name}
                        {section.isBeboer && row.utflyttet && (
                          <b> Utflyttet?</b>
                        )}
                      </td>
                      <CostColumns countByCost={row.summer.countByCost} />
                      <RightTd>
                        <FormatNumber value={row.summer.amountReal} />
                      </RightTd>
                      {!section.isBeboer && (
                        <td>
                          {(hasComment || row.summer.amountAlt > 0) && (
                            <>
                              {row.comment}
                              <br />
                              {row.summer.amountAlt > 0 && (
                                <>
                                  (ikke dekket: kr{" "}
                                  <FormatNumber value={row.summer.amountAlt} />)
                                </>
                              )}
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}

      <AccountsList data={data} rawdata={rawdata} />
    </div>
  )
}

// --- List Detailed ---

function ListDetailed({ data }: { data: AggregatedData }) {
  return (
    <>
      {data.sections.map((section, sectionidx) => (
        <Fragment key={sectionidx}>
          {[...section.printers]
            .sort((a, b) => a.printername.localeCompare(b.printername))
            .map((group) => (
              <div key={group.printername} className="printergroup">
                <h2>
                  {section.isBeboer
                    ? "Enkeltbeboere"
                    : "Gruppe: " + group.printername}
                </h2>
                {group.comment != null && group.comment !== "" && (
                  <p>{group.comment}</p>
                )}

                <table
                  className="table table-striped table-condensed"
                  style={{ width: "auto" }}
                >
                  <thead>
                    <tr>
                      <th>Navn</th>
                      <th>Måned</th>
                      <th>Jobber</th>
                      <th>Per side</th>
                      <th>Sider</th>
                      <th>Å betale</th>
                    </tr>
                  </thead>
                  <tfoot>
                    <tr style={{ fontStyle: "italic", fontWeight: "bold" }}>
                      <td colSpan={2}>Sum</td>
                      <td style={{ textAlign: "right" }}>
                        <FormatNumber
                          value={group.summer.numJobs}
                          decimals={0}
                        />
                      </td>
                      <td />
                      <RightTd>
                        <FormatNumber
                          value={group.summer.numPages}
                          decimals={0}
                        />
                      </RightTd>
                      <RightTd>
                        <FormatNumber value={group.summer.amountReal} />
                      </RightTd>
                    </tr>
                  </tfoot>
                  {[...group.users]
                    .sort((a, b) => a.realname.localeCompare(b.realname))
                    .map((row) => {
                      const showSum = row.months.length > 1
                      const numRows = row.months.length + (showSum ? 1 : 0)

                      return (
                        <tbody key={row.username}>
                          {row.months.map((month, monthidx) => (
                            <tr key={monthidx}>
                              {monthidx === 0 && (
                                <td rowSpan={numRows}>
                                  {row.realname || row.username}
                                  {section.isBeboer && row.utflyttet && (
                                    <b> Utflyttet?</b>
                                  )}
                                </td>
                              )}
                              <td>{month.name}</td>
                              <RightTd>{month.summer.numJobs}</RightTd>
                              <CostColumns
                                countByCost={month.summer.countByCost}
                              />
                              <RightTd>
                                <FormatNumber value={month.summer.amountReal} />
                              </RightTd>
                            </tr>
                          ))}
                          {showSum && (
                            <tr style={{ fontStyle: "italic" }}>
                              <td>Sum</td>
                              <RightTd>{row.summer.numJobs}</RightTd>
                              <td />
                              <RightTd>
                                <FormatNumber
                                  value={row.summer.numPages}
                                  decimals={0}
                                />
                              </RightTd>
                              <RightTd>
                                <FormatNumber value={row.summer.amountReal} />
                              </RightTd>
                            </tr>
                          )}
                        </tbody>
                      )
                    })}
                </table>
              </div>
            ))}
        </Fragment>
      ))}
    </>
  )
}

// --- Accounts List ---

function AccountsList({
  data,
  rawdata,
}: {
  data: AggregatedData
  rawdata: PrinterInvoiceResponse
}) {
  const accounts = useMemo(() => {
    const result: { account: string | number; text: string; sum: number }[] = []
    const printerToAccountIdx: Record<string, number> = {}
    let sumAccountIdx: number | null = null

    rawdata.accounts.forEach((account, i) => {
      result.push({
        account: account.account,
        text: account.text,
        sum: 0,
      })

      if (account.printers === null) {
        sumAccountIdx = i
      } else {
        for (const printer of account.printers) {
          printerToAccountIdx[printer] = i
        }
      }
    })

    if (sumAccountIdx == null) {
      throw Error("accounts_sum is null")
    }

    for (const printer of rawdata.prints) {
      const printerSummer = data.sections
        .flatMap((it) => it.printers)
        .find((it) => it.printername === printer.printername)!.summer

      if (printerSummer.amountReal > 0) {
        const account_key = printerToAccountIdx[printer.printername]
        if (!account_key) {
          result.push({
            account: 9999,
            text: "Ukjent: " + printer.printername,
            sum: printerSummer.amountReal,
          })
        } else {
          result[account_key].sum += printerSummer.amountReal
        }
        result[sumAccountIdx].sum -= printerSummer.amountReal
      }
    }

    return result.filter((it) => it.sum != 0)
  }, [data, rawdata])

  return (
    <div className="col-md-6 printergroup">
      <h2>Konteringsliste for FBS</h2>
      <table
        className="table table-striped table-condensed"
        style={{ width: "auto" }}
      >
        <thead>
          <tr>
            <th>Konto</th>
            <th>Debet</th>
            <th>Kredit</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, accountidx) => (
            <tr key={accountidx}>
              <td>{account.account}</td>
              <RightTd>
                {account.sum > 0 ? <FormatNumber value={account.sum} /> : ""}
              </RightTd>
              <RightTd>
                {account.sum < 0 ? (
                  <FormatNumber value={account.sum * -1} />
                ) : (
                  ""
                )}
              </RightTd>
              <td>{account.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- Main Page ---

function PrinterInvoicingPage() {
  const { dateFrom, dateTo, changeMonth, setDateFrom, setDateTo } = useDates()
  const {
    isPending,
    isError,
    error,
    data: rawdata,
  } = usePrinterInvoiceData(dateFrom, dateTo)
  const data = rawdata
    ? aggregateData(rawdata as unknown as PrinterInvoiceResponse)
    : undefined
  const [viewType, setViewType] = useState<"summed" | "detailed">("summed")

  return (
    <>
      <PageTitle title="Fakturering av utskrifter" />
      <div className="form-horizontal hidden-print">
        <div className="row form-group">
          <label className="col-md-2 control-label">Visningsmodus</label>
          <div className="col-md-10">
            <select
              name="format"
              value={viewType}
              onChange={(ev) =>
                setViewType(ev.target.value as "summed" | "detailed")
              }
              className="form-control"
            >
              <option value="summed">Oppsummert</option>
              <option value="detailed">Detaljert</option>
            </select>
          </div>
        </div>
        <div className="row form-group">
          <label className="col-md-2 control-label">Tidsperiode</label>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="yyyy-mm-dd"
              type="date"
              value={dateFrom}
              onChange={(ev) => setDateFrom(ev.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="yyyy-mm-dd"
              type="date"
              value={dateTo}
              onChange={(ev) => setDateTo(ev.target.value)}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-offset-2 col-md-10">
            <button onClick={() => changeMonth(-1)}>
              &laquo; En måned tilbake
            </button>{" "}
            <button onClick={() => changeMonth(1)}>
              En måned frem &raquo;
            </button>
          </div>
        </div>
      </div>

      <div className="visible-print-block">
        <p>
          <b>
            {viewType === "detailed" ? "Detaljert oversikt" : "Oppsummering"}
          </b>{" "}
          for perioden <u>{formatDate(dateFrom, "dddd D. MMMM YYYY")}</u> til{" "}
          <u>{formatDate(dateTo, "dddd D. MMMM YYYY")}</u>.
        </p>
        <p>
          Rapport generert {formatDate(new Date(), "dddd D. MMMM YYYY HH:mm")}.
        </p>
      </div>

      {isPending ? (
        <Loading />
      ) : isError && rawdata == null ? (
        <ErrorMessages error={error} />
      ) : (
        ""
      )}

      {data && rawdata && (
        <>
          <Summary
            data={rawdata as unknown as PrinterInvoiceResponse}
            summer={data.summer}
          />
          <DailyGraph
            rawdata={rawdata as unknown as PrinterInvoiceResponse}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />

          {viewType === "summed" && (
            <ListSummed
              data={data}
              rawdata={rawdata as unknown as PrinterInvoiceResponse}
            />
          )}
          {viewType === "detailed" && <ListDetailed data={data} />}
        </>
      )}
    </>
  )
}
