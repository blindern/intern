import { ErrorMessages } from "components/ErrorMessages.js"
import { Loading } from "components/Loading.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import { usePrinterInvoiceData } from "modules/printer/api.js"
import { DailyGraph } from "modules/printer/invoicing/DailyGraph.js"
import { ListDetailed } from "modules/printer/invoicing/ListDetailed.js"
import { ListSummed } from "modules/printer/invoicing/ListSummed.js"
import { Summary } from "modules/printer/invoicing/Summary.js"
import { aggregateData, useDates } from "modules/printer/invoicing/utils.js"
import { useState } from "react"
import { formatDate } from "utils/dates.js"

export function PrinterInvoicingPage() {
  useTitle("Fakturering av utskrifter")

  const { dateFrom, dateTo, changeMonth, setDateFrom, setDateTo } = useDates()
  const {
    isPending,
    isError,
    error,
    data: rawdata,
  } = usePrinterInvoiceData(dateFrom, dateTo)
  const data = rawdata ? aggregateData(rawdata) : undefined
  const [viewType, setViewType] = useState<"summed" | "detailed">("summed")

  return (
    <>
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
          <Summary data={rawdata} summer={data.summer} />
          <DailyGraph rawdata={rawdata} dateFrom={dateFrom} dateTo={dateTo} />

          {viewType === "summed" && (
            <ListSummed data={data} rawdata={rawdata} />
          )}
          {viewType === "detailed" && <ListDetailed data={data} />}
        </>
      )}
    </>
  )
}
