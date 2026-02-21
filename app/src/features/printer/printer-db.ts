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
    url.password = env.printerDbPass
    dsn = url.toString()
  }

  printerDb = postgres(dsn)
  return printerDb
}

export async function getLastPrints(limit = 30) {
  const sql = getPrinterDb()
  const rows = await sql`
    SELECT j.jobsize, j.jobdate, LOWER(u.username) as username, p.printername
    FROM jobhistory j
      JOIN users u ON j.userid = u.id
      JOIN printers p ON j.printerid = p.id
    ORDER BY j.jobdate DESC
    LIMIT ${limit}
  `
  return rows
}

export async function getUsageData(from: string, to: string) {
  const sql = getPrinterDb()
  const rows = await sql`
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
  `

  // Restructure into nested format matching PHP output
  const byPrinter: Record<string, Record<string, any[]>> = {}
  for (const row of rows) {
    const costEach = getCost(`${row.jobyear}-${row.jobmonth}`)
    const entry = { ...row, cost_each: costEach }

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
