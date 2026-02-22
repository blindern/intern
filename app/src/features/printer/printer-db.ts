import postgres from "postgres"
import { env } from "../../server/env.js"

let printerDb: ReturnType<typeof postgres> | null = null

function getPrinterDb() {
  if (printerDb) return printerDb
  if (!env.printerDbDsn) {
    throw new Error("PRINTERDB_DSN not configured")
  }

  // Build connection URL with credentials if provided separately
  let dsn = env.printerDbDsn
  if (env.printerDbUser) {
    const url = new URL(dsn)
    url.username = env.printerDbUser
    url.password = env.printerDbPass ?? ""
    dsn = url.toString()
  }

  printerDb = postgres(dsn)
  return printerDb
}

export interface PrintRow {
  jobsize: number
  jobdate: Date
  username: string
  printername: string
}

export async function getLastPrints(limit = 30): Promise<PrintRow[]> {
  const sql = getPrinterDb()
  const rows = await sql`
    SELECT j.jobsize, j.jobdate, lower(u.username) as username, p.printername
    FROM jobhistory j
      JOIN users u ON j.userid = u.id
      JOIN printers p ON j.printerid = p.id
    ORDER BY j.jobdate DESC
    LIMIT ${limit}
  `
  return rows as unknown as PrintRow[]
}

interface UsageRow {
  jobyear: string
  jobmonth: string
  count_jobs: number
  sum_jobsize: number
  last_jobdate: Date
  username: string
  printername: string
}

interface UsageEntry extends UsageRow {
  cost_each: number
}

export async function getUsageData(from: string, to: string) {
  const sql = getPrinterDb()
  const rows = (await sql`
    SELECT to_char(j.jobdate, 'YYYY') as jobyear,
           to_char(j.jobdate, 'MM') as jobmonth,
           count(j.id)::int as count_jobs,
           sum(j.jobsize)::int as sum_jobsize,
           max(j.jobdate) as last_jobdate,
           lower(u.username) as username,
           p.printername
    FROM jobhistory j
      JOIN users u ON j.userid = u.id
      JOIN printers p ON j.printerid = p.id
    WHERE j.jobdate::date >= ${from}::date
      AND j.jobdate::date <= ${to}::date
    GROUP BY lower(u.username), p.printername, jobyear, jobmonth
    ORDER BY jobyear, jobmonth, p.printername, lower(u.username)
  `) as unknown as UsageRow[]

  // Restructure into nested format matching PHP output
  const byPrinter: Record<string, Record<string, UsageEntry[]>> = {}
  for (const row of rows) {
    const costEach = getCost(`${row.jobyear}-${row.jobmonth}`)
    const entry: UsageEntry = { ...row, cost_each: costEach }

    if (!byPrinter[row.printername]) byPrinter[row.printername] = {}
    if (!byPrinter[row.printername][row.username])
      byPrinter[row.printername][row.username] = []
    byPrinter[row.printername][row.username].push(entry)
  }

  return Object.entries(byPrinter).map(([printername, users]) => ({
    printername,
    users: Object.entries(users).map(([username, prints]) => ({
      username,
      prints,
    })),
  }))
}

export async function getDailyUsageData(from: string, to: string) {
  const sql = getPrinterDb()
  return sql`
    SELECT to_char(j.jobdate, 'YYYY-MM-DD') as jobday,
           count(j.id)::int as count_jobs,
           sum(j.jobsize)::int as sum_jobsize
    FROM jobhistory j
    WHERE j.jobdate::date >= ${from}::date
      AND j.jobdate::date <= ${to}::date
    GROUP BY jobday
    ORDER BY jobday
  `
}

// Cost per page by month
const amounts: [string | 0, number][] = [
  [0, 0.5],
  ["2014-03", 0.4],
]

function getCost(monthDate: string): number {
  const [year, month] = monthDate.split("-")
  let lastAmount = 0
  for (const [start, amount] of amounts) {
    if (start === 0) {
      lastAmount = amount
    } else {
      const [checkYear, checkMonth] = start.split("-")
      if (checkYear < year || (checkYear === year && checkMonth <= month)) {
        lastAmount = amount
      }
    }
  }
  return lastAmount
}

export interface YearlyStats {
  year: string
  count_jobs: number
  sum_jobsize: number
  unique_users: number
}

export interface MonthlyPattern {
  month: number
  avg_jobs: number
  avg_pages: number
}

export interface WeekdayPattern {
  weekday: number
  avg_jobs: number
  avg_pages: number
}

export interface HourlyPattern {
  hour: number
  avg_jobs: number
  avg_pages: number
}

export interface PrinterYearlyBreakdown {
  year: string
  printername: string
  sum_jobsize: number
}

export interface StatsOverview {
  total_jobs: number
  total_pages: number
  total_users: number
  first_job: string | null
  last_job: string | null
}

export async function getStatsOverview(): Promise<StatsOverview> {
  const sql = getPrinterDb()
  const rows = await sql`
    SELECT count(j.id)::int as total_jobs,
           coalesce(sum(j.jobsize), 0)::int as total_pages,
           count(DISTINCT j.userid)::int as total_users,
           to_char(min(j.jobdate), 'YYYY-MM-DD') as first_job,
           to_char(max(j.jobdate), 'YYYY-MM-DD') as last_job
    FROM jobhistory j
  `
  return rows[0] as unknown as StatsOverview
}

export async function getYearlyStats(): Promise<YearlyStats[]> {
  const sql = getPrinterDb()
  const rows = await sql`
    SELECT to_char(j.jobdate, 'YYYY') as year,
           count(j.id)::int as count_jobs,
           coalesce(sum(j.jobsize), 0)::int as sum_jobsize,
           count(DISTINCT j.userid)::int as unique_users
    FROM jobhistory j
    GROUP BY year
    ORDER BY year
  `
  return rows as unknown as YearlyStats[]
}

export async function getMonthlyPattern(): Promise<MonthlyPattern[]> {
  const sql = getPrinterDb()
  const rows = await sql`
    WITH date_range as (
      SELECT min(jobdate::date) as min_d,
             max(jobdate::date) as max_d
      FROM jobhistory
    ),
    all_months as (
      SELECT extract(MONTH FROM d)::int as month
      FROM date_range,
        generate_series(min_d, max_d, '1 day'::interval) as d
      GROUP BY extract(YEAR FROM d), extract(MONTH FROM d)
    ),
    month_counts as (
      SELECT month,
             count(*)::float as total_occurrences
      FROM all_months
      GROUP BY month
    )
    SELECT extract(MONTH FROM j.jobdate)::int as month,
           count(j.id)::float / mc.total_occurrences as avg_jobs,
           sum(j.jobsize)::float / mc.total_occurrences as avg_pages
    FROM jobhistory j
      JOIN month_counts mc ON mc.month = extract(MONTH FROM j.jobdate)::int
    GROUP BY extract(MONTH FROM j.jobdate)::int, mc.total_occurrences
    ORDER BY month
  `
  return rows as unknown as MonthlyPattern[]
}

export async function getWeekdayPattern(): Promise<WeekdayPattern[]> {
  const sql = getPrinterDb()
  const rows = await sql`
    WITH date_range as (
      SELECT min(jobdate::date) as min_d,
             max(jobdate::date) as max_d
      FROM jobhistory
    ),
    all_days as (
      SELECT generate_series(min_d, max_d, '1 day'::interval)::date as d
      FROM date_range
    ),
    weekday_counts as (
      SELECT extract(DOW FROM d)::int as weekday,
             count(*)::float as total_days
      FROM all_days
      GROUP BY weekday
    )
    SELECT extract(DOW FROM j.jobdate)::int as weekday,
           count(j.id)::float / wc.total_days as avg_jobs,
           sum(j.jobsize)::float / wc.total_days as avg_pages
    FROM jobhistory j
      JOIN weekday_counts wc ON wc.weekday = extract(DOW FROM j.jobdate)::int
    GROUP BY extract(DOW FROM j.jobdate)::int, wc.total_days
    ORDER BY weekday
  `
  return rows as unknown as WeekdayPattern[]
}

export async function getHourlyPattern(): Promise<HourlyPattern[]> {
  const sql = getPrinterDb()
  const rows = await sql`
    WITH date_range as (
      SELECT min(jobdate::date) as min_d,
             max(jobdate::date) as max_d
      FROM jobhistory
    ),
    day_count as (
      SELECT count(*)::float as total_days
      FROM date_range,
        generate_series(min_d, max_d, '1 day'::interval) as d
    )
    SELECT extract(HOUR FROM j.jobdate)::int as hour,
           count(j.id)::float / dc.total_days as avg_jobs,
           sum(j.jobsize)::float / dc.total_days as avg_pages
    FROM jobhistory j
      CROSS JOIN day_count dc
    GROUP BY hour, dc.total_days
    ORDER BY hour
  `
  return rows as unknown as HourlyPattern[]
}

export async function getPrinterYearlyBreakdown(): Promise<
  PrinterYearlyBreakdown[]
> {
  const sql = getPrinterDb()
  const rows = await sql`
    SELECT to_char(j.jobdate, 'YYYY') as year,
           p.printername,
           coalesce(sum(j.jobsize), 0)::int as sum_jobsize
    FROM jobhistory j
      JOIN printers p ON j.printerid = p.id
    GROUP BY year, p.printername
    ORDER BY year, p.printername
  `
  return rows as unknown as PrinterYearlyBreakdown[]
}

export const printerConfig = {
  texts: {
    beboer: "Faktureres den enkelte beboer gjennom BS og utbetales av BS.",
    dugnaden: "Dekkes av BS.",
    ffhost: "Kostnadsføres direkte på festforeningen for høstsemesteret.",
    ffvaar: "Kostnadsføres direkte på festforeningen for vårsemesteret.",
    fs: "Kostnadsføres direkte på foreningsstyret.",
    hyttestyret: "Kostnadsføres direkte på hyttestyret.",
    kollegiet: "Dekkes av BS.",
    printeroppmann: "Ikke inntektsbringende.",
    uka: "Kostnadsføres direkte på UKA.",
    velferden: "Kostnadsføres direkte på velferden.",
  } as Record<string, string>,
  no_faktura: ["printeroppmann"],
  section_default: "fbs",
  sections: {
    beboer: {
      printers: ["beboer"],
      is_beboer: true,
      title: "Faktureres enkeltbeboere",
      description: "",
    },
    other: {
      printers: ["kollegiet", "dugnaden"],
      is_beboer: false,
      title: "Faktureres administrasjonen",
      description: "Faktureres/dekkes gjennom BS og utbetales av BS.",
    },
    fbs: {
      printers: [
        "ffhost",
        "ffvaar",
        "fs",
        "hyttestyret",
        "printeroppmann",
        "uka",
        "velferden",
      ],
      is_beboer: false,
      title: "Kostnadsføres internt i FBS",
      description:
        "Føres som en kostnad direkte i foreningens regnskap samtidig med inntekten. Skal ikke utbetales fra BS.",
    },
  },
  accounts: [
    {
      printers: null,
      account: 3261,
      text: "Avdeling/prosjekt: Foreningsstyret/printer",
    },
    {
      printers: ["beboer", "kollegiet", "dugnaden"],
      account: "1500",
      text: "Kunde: Blindern Studenterhjem",
    },
    {
      printers: ["ffhost"],
      account: "6820",
      text: "Avdeling/prosjekt: Festforening høst",
    },
    {
      printers: ["ffvaar"],
      account: "6820",
      text: "Avdeling/prosjekt: Festforening vår",
    },
    {
      printers: ["fs"],
      account: "6820",
      text: "Avdeling/prosjekt: Foreningsstyret",
    },
    {
      printers: ["velferden"],
      account: "6820",
      text: "Avdeling/prosjekt: Foreningsstyret/Velferden",
    },
    {
      printers: ["hyttestyret"],
      account: "6820",
      text: "Avdeling/prosjekt: Hyttestyret",
    },
    { printers: ["uka"], account: "6820", text: "Avdeling/prosjekt: UKA" },
  ],
}
