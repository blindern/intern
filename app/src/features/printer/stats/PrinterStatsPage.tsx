import { useMemo } from "react"
import { ErrorMessages } from "../../../components/ErrorMessages.js"
import { Loading } from "../../../components/Loading.js"
import { usePrinterStats } from "../hooks.js"
import { PageTitle } from "../../../hooks/useTitle.js"
import { formatDate } from "../../../utils/dates.js"
import { BarChart } from "./BarChart.js"
import { StackedAreaChart } from "./StackedAreaChart.js"

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

// PostgreSQL DOW: 0=Sunday
const WEEKDAY_NAMES = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"]

// Reorder weekdays to start on Monday
function reorderWeekdays<T extends { weekday: number }>(data: T[]): T[] {
  const byDay = new Map(data.map((d) => [d.weekday, d]))
  return [1, 2, 3, 4, 5, 6, 0]
    .map((day) => byDay.get(day))
    .filter((d): d is T => d != null)
}

const fmtNum = (v: number) =>
  new Intl.NumberFormat("nb-NO").format(Math.round(v))
const fmtKr = (v: number) =>
  new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(Math.round(v))

function buildPrinterToSection(
  sections: Record<string, { printers: string[] }>,
): Map<string, string> {
  const map = new Map<string, string>()
  for (const [sectionKey, section] of Object.entries(sections)) {
    for (const printer of section.printers) {
      map.set(printer, sectionKey)
    }
  }
  return map
}

const SECTION_LABELS: Record<string, string> = {
  beboer: "Beboere",
  other: "Administrasjonen",
  fbs: "FBS internt",
}

function SectionSummaryTable({
  totals,
  grandTotal,
}: {
  totals: { key: string; label: string; total: number }[]
  grandTotal: number
}) {
  return (
    <table
      className="table table-striped"
      style={{ maxWidth: 500, marginTop: 15 }}
    >
      <thead>
        <tr>
          <th>Gruppe</th>
          <th style={{ textAlign: "right" }}>Totalt sider</th>
          <th style={{ textAlign: "right" }}>Andel</th>
        </tr>
      </thead>
      <tbody>
        {totals.map((s) => (
          <tr key={s.key}>
            <td>{s.label}</td>
            <td style={{ textAlign: "right" }}>{fmtNum(s.total)}</td>
            <td style={{ textAlign: "right" }}>
              {grandTotal > 0
                ? `${((s.total / grandTotal) * 100).toFixed(1)} %`
                : "–"}
            </td>
          </tr>
        ))}
        <tr style={{ fontWeight: 700 }}>
          <td>Totalt</td>
          <td style={{ textAlign: "right" }}>{fmtNum(grandTotal)}</td>
          <td style={{ textAlign: "right" }}>100 %</td>
        </tr>
      </tbody>
    </table>
  )
}

export function PrinterStatsPage() {
  const { isPending, isError, error, data } = usePrinterStats()

  const {
    printerBreakdownData,
    internalPrinterBreakdownData,
    sectionBreakdownData,
  } = useMemo(() => {
    if (!data)
      return {
        printerBreakdownData: null,
        internalPrinterBreakdownData: null,
        sectionBreakdownData: null,
      }
    const printerToSection = buildPrinterToSection(data.sections)
    const beboerPrinters = new Set(data.sections.beboer?.printers ?? [])

    function buildPrinterBreakdown(
      rows: NonNullable<typeof data>["printerBreakdown"],
    ) {
      const byYear = new Map<string, Map<string, number>>()
      const allPrinters = new Set<string>()
      for (const row of rows) {
        allPrinters.add(row.printername)
        if (!byYear.has(row.year)) byYear.set(row.year, new Map())
        byYear.get(row.year)!.set(row.printername, row.sum_jobsize)
      }
      const years = [...byYear.keys()].sort()
      const printers = [...allPrinters].sort()
      const series = printers.map((name) => ({
        name,
        values: years.map((y) => byYear.get(y)?.get(name) ?? 0),
      }))
      return { years, series }
    }

    const byYearSection = new Map<string, Map<string, number>>()
    for (const row of data.printerBreakdown) {
      const section = printerToSection.get(row.printername) ?? "fbs"
      if (!byYearSection.has(row.year)) byYearSection.set(row.year, new Map())
      const yearMap = byYearSection.get(row.year)!
      yearMap.set(section, (yearMap.get(section) ?? 0) + row.sum_jobsize)
    }
    const sectionYears = [...byYearSection.keys()].sort()

    function buildSectionBreakdown(keys: string[]) {
      const series = keys.map((key) => ({
        name: SECTION_LABELS[key] ?? key,
        values: sectionYears.map((y) => byYearSection.get(y)?.get(key) ?? 0),
      }))
      const totals = keys.map((key) => {
        const total = sectionYears.reduce(
          (sum, y) => sum + (byYearSection.get(y)?.get(key) ?? 0),
          0,
        )
        return { key, label: SECTION_LABELS[key] ?? key, total }
      })
      const grandTotal = totals.reduce((sum, t) => sum + t.total, 0)
      return { years: sectionYears, series, totals, grandTotal }
    }

    return {
      printerBreakdownData: buildPrinterBreakdown(data.printerBreakdown),
      internalPrinterBreakdownData: buildPrinterBreakdown(
        data.printerBreakdown.filter((r) => !beboerPrinters.has(r.printername)),
      ),
      sectionBreakdownData: buildSectionBreakdown(["beboer", "other", "fbs"]),
    }
  }, [data])

  if (isPending)
    return (
      <>
        <PageTitle title="Printerstatistikk" />
        <Loading />
      </>
    )
  if (isError && data == null)
    return (
      <>
        <PageTitle title="Printerstatistikk" />
        <ErrorMessages error={error} />
      </>
    )

  const { overview, totalCost, yearly, monthly, weekday, hourly } = data

  const dataYears =
    overview.first_job && overview.last_job
      ? new Date(overview.last_job).getFullYear() -
        new Date(overview.first_job).getFullYear() +
        1
      : 0

  return (
    <>
      <PageTitle title="Printerstatistikk" />
      <p className="lead">
        Historisk oversikt over printerbruk på Blindern Studenterhjem.
      </p>

      {/* Overview cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 30,
        }}
      >
        <div style={{ flex: "1 1 170px" }}>
          <div className="panel panel-default">
            <div className="panel-body text-center">
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {fmtNum(overview.total_pages)}
              </div>
              <div className="text-muted">sider skrevet ut</div>
            </div>
          </div>
        </div>
        <div style={{ flex: "1 1 170px" }}>
          <div className="panel panel-default">
            <div className="panel-body text-center">
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {fmtKr(totalCost)}
              </div>
              <div className="text-muted">fakturert totalt</div>
            </div>
          </div>
        </div>
        <div style={{ flex: "1 1 170px" }}>
          <div className="panel panel-default">
            <div className="panel-body text-center">
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {fmtNum(overview.total_jobs)}
              </div>
              <div className="text-muted">utskriftsjobber</div>
            </div>
          </div>
        </div>
        <div style={{ flex: "1 1 170px" }}>
          <div className="panel panel-default">
            <div className="panel-body text-center">
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {overview.total_users}
              </div>
              <div className="text-muted">brukere</div>
            </div>
          </div>
        </div>
        <div style={{ flex: "1 1 170px" }}>
          <div className="panel panel-default">
            <div className="panel-body text-center">
              <div style={{ fontSize: 28, fontWeight: 700 }}>{dataYears}</div>
              <div className="text-muted">
                år med data
                {overview.first_job && (
                  <>
                    {" "}
                    <small>
                      (fra {formatDate(overview.first_job, "MMMM YYYY")})
                    </small>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly trend */}
      <h3>Utskrifter per år</h3>
      <p className="text-muted">Totalt antall sider skrevet ut hvert år.</p>
      <BarChart
        data={yearly.map((y) => ({ label: y.year, value: y.sum_jobsize }))}
        yLabel="Sider"
        formatValue={fmtNum}
        color="#4e79a7"
      />

      {/* Users per year */}
      <h3>Aktive brukere per år</h3>
      <p className="text-muted">
        Antall unike brukere som har brukt printeren hvert år.
      </p>
      <BarChart
        data={yearly.map((y) => ({
          label: y.year,
          value: y.unique_users,
        }))}
        yLabel="Brukere"
        color="#59a14f"
        height={220}
      />

      {/* Section (group) breakdown */}
      {sectionBreakdownData && sectionBreakdownData.series.length > 0 && (
        <>
          <h3>Fordeling per gruppe over tid</h3>
          <p className="text-muted">
            Sider skrevet ut fordelt på beboere, administrasjonen og FBS-interne
            grupper.
          </p>
          <StackedAreaChart
            years={sectionBreakdownData.years}
            series={sectionBreakdownData.series}
          />

          {/* Section summary table */}
          <SectionSummaryTable
            totals={sectionBreakdownData.totals}
            grandTotal={sectionBreakdownData.grandTotal}
          />
        </>
      )}

      {/* Printer breakdown */}
      {printerBreakdownData && printerBreakdownData.series.length > 0 && (
        <>
          <h3>Fordeling per printer over tid</h3>
          <p className="text-muted">Sider skrevet ut per printer hvert år.</p>
          <StackedAreaChart
            years={printerBreakdownData.years}
            series={printerBreakdownData.series}
          />
        </>
      )}

      {internalPrinterBreakdownData &&
        internalPrinterBreakdownData.series.length > 0 && (
          <>
            <h3>Fordeling per printer over tid (uten beboer)</h3>
            <p className="text-muted">
              Sider skrevet ut per printer hvert år, ekskludert beboerprinteren.
            </p>
            <StackedAreaChart
              years={internalPrinterBreakdownData.years}
              series={internalPrinterBreakdownData.series}
            />
          </>
        )}

      {/* Monthly seasonality */}
      <h3>Gjennomsnitt per måned</h3>
      <p className="text-muted">
        Gjennomsnittlig antall sider per måned over alle år. Viser
        sesongvariasjoner.
      </p>
      <BarChart
        data={monthly.map((m) => ({
          label: MONTH_NAMES[m.month - 1],
          value: m.avg_pages,
        }))}
        yLabel="Snitt sider"
        formatValue={fmtNum}
        color="#f28e2b"
      />

      {/* Day of week */}
      <div className="row">
        <div className="col-md-6">
          <h3>Ukedag</h3>
          <p className="text-muted">Gjennomsnittlig sider per ukedag.</p>
          <BarChart
            data={reorderWeekdays(weekday).map((d) => ({
              label: WEEKDAY_NAMES[d.weekday],
              value: d.avg_pages,
            }))}
            yLabel="Snitt sider"
            formatValue={fmtNum}
            color="#76b7b2"
            width={450}
            height={240}
          />
        </div>
        <div className="col-md-6">
          <h3>Tid på døgnet</h3>
          <p className="text-muted">Gjennomsnittlig sider per klokketime.</p>
          <BarChart
            data={hourly.map((h) => ({
              label: `${String(h.hour).padStart(2, "0")}:00`,
              value: h.avg_pages,
            }))}
            yLabel="Snitt sider"
            formatValue={fmtNum}
            color="#e15759"
            width={450}
            height={240}
          />
        </div>
      </div>
    </>
  )
}
