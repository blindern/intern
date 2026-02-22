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
    SELECT j.jobsize, j.jobdate, LOWER(u.username) as username, p.printername
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
           COUNT(j.id)::int as count_jobs,
           SUM(j.jobsize)::int as sum_jobsize,
           MAX(j.jobdate) as last_jobdate,
           LOWER(u.username) as username,
           p.printername
    FROM jobhistory j
      JOIN users u ON j.userid = u.id
      JOIN printers p ON j.printerid = p.id
    WHERE j.jobdate::date >= ${from}::date
      AND j.jobdate::date <= ${to}::date
    GROUP BY LOWER(u.username), p.printername, jobyear, jobmonth
    ORDER BY jobyear, jobmonth, p.printername, LOWER(u.username)
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
           COUNT(j.id)::int as count_jobs,
           SUM(j.jobsize)::int as sum_jobsize
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
    SELECT COUNT(j.id)::int as total_jobs,
           COALESCE(SUM(j.jobsize), 0)::int as total_pages,
           COUNT(DISTINCT j.userid)::int as total_users,
           to_char(MIN(j.jobdate), 'YYYY-MM-DD') as first_job,
           to_char(MAX(j.jobdate), 'YYYY-MM-DD') as last_job
    FROM jobhistory j
  `
  return rows[0] as unknown as StatsOverview
}

export async function getYearlyStats(): Promise<YearlyStats[]> {
  const sql = getPrinterDb()
  const rows = await sql`
    SELECT to_char(j.jobdate, 'YYYY') as year,
           COUNT(j.id)::int as count_jobs,
           COALESCE(SUM(j.jobsize), 0)::int as sum_jobsize,
           COUNT(DISTINCT j.userid)::int as unique_users
    FROM jobhistory j
    GROUP BY year
    ORDER BY year
  `
  return rows as unknown as YearlyStats[]
}

export async function getMonthlyPattern(): Promise<MonthlyPattern[]> {
  const sql = getPrinterDb()
  const rows = await sql`
    SELECT EXTRACT(MONTH FROM j.jobdate)::int as month,
           (COUNT(j.id)::float / GREATEST(COUNT(DISTINCT to_char(j.jobdate, 'YYYY')), 1))::float as avg_jobs,
           (SUM(j.jobsize)::float / GREATEST(COUNT(DISTINCT to_char(j.jobdate, 'YYYY')), 1))::float as avg_pages
    FROM jobhistory j
    GROUP BY month
    ORDER BY month
  `
  return rows as unknown as MonthlyPattern[]
}

export async function getWeekdayPattern(): Promise<WeekdayPattern[]> {
  const sql = getPrinterDb()
  // PostgreSQL DOW: 0=Sunday, 1=Monday, ... 6=Saturday
  // Avg per active day: total pages on Mondays / number of distinct Monday dates with prints
  const rows = await sql`
    SELECT EXTRACT(DOW FROM j.jobdate)::int as weekday,
           COUNT(j.id)::float / COUNT(DISTINCT j.jobdate::date) as avg_jobs,
           SUM(j.jobsize)::float / COUNT(DISTINCT j.jobdate::date) as avg_pages
    FROM jobhistory j
    GROUP BY weekday
    ORDER BY weekday
  `
  return rows as unknown as WeekdayPattern[]
}

export async function getHourlyPattern(): Promise<HourlyPattern[]> {
  const sql = getPrinterDb()
  // Avg per active day: total pages at 10am / number of distinct dates with prints at 10am
  const rows = await sql`
    SELECT EXTRACT(HOUR FROM j.jobdate)::int as hour,
           COUNT(j.id)::float / COUNT(DISTINCT j.jobdate::date) as avg_jobs,
           SUM(j.jobsize)::float / COUNT(DISTINCT j.jobdate::date) as avg_pages
    FROM jobhistory j
    GROUP BY hour
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
           COALESCE(SUM(j.jobsize), 0)::int as sum_jobsize
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
