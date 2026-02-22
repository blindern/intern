import { useState } from "react"
import { ErrorMessages } from "../../../components/ErrorMessages.js"
import { Loading } from "../../../components/Loading.js"
import { usePrinterInvoiceData } from "../hooks.js"
import { PageTitle } from "../../../hooks/useTitle.js"
import { formatDate, moment } from "../../../utils/dates.js"
import type { PrinterInvoiceResponse } from "./types.js"
import { aggregateData } from "./aggregateData.js"
import { Summary } from "./Summary.js"
import { DailyGraph } from "./DailyGraph.js"
import { ListSummed } from "./ListSummed.js"
import { ListDetailed } from "./ListDetailed.js"

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

export function PrinterInvoicingPage() {
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
