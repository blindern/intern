import { PrinterInvoiceResponse } from "modules/printer/api.js"
import { Data, PrinterUser } from "modules/printer/invoicing/types.js"
import { useState } from "react"
import moment from "utils/moment.js"

export class Summer {
  prev?: Summer | undefined

  numJobs = 0
  numPages = 0
  numPagesReal = 0
  numPagesAlt = 0
  amount = 0
  amountReal = 0
  amountAlt = 0
  countByCost: Record<number, number> = {}

  constructor(prev?: Summer | undefined) {
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

    if (!this.countByCost[props.costEach]) this.countByCost[props.costEach] = 0
    this.countByCost[props.costEach] += props.totalJobSize

    if (this.prev) {
      this.prev.add(props)
    }
  }
}

export function aggregateData(data: PrinterInvoiceResponse): Data | undefined {
  const totalSummer = new Summer()
  const sections: Record<string | number, Data["sections"][0]> = {}
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
    const section = sections[sectionKey]!
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
        realname: data.realnames[user.username]!,
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

export function useDates() {
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

  return {
    setDateFrom,
    setDateTo,
    dateFrom,
    dateTo,
    changeMonth,
  }
}
