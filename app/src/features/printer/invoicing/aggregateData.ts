import type {
  AggregatedData,
  PrinterInvoiceResponse,
  PrinterUser,
} from "./types.js"
import { Summer } from "./Summer.js"

export function aggregateData(
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
