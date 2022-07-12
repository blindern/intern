import { FormatNumber } from "components/FormatNumber"
import { PrinterInvoiceResponse } from "modules/printer/api"
import { Summer } from "modules/printer/invoicing/utils"
import React, { useMemo } from "react"

export function Summary({
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
