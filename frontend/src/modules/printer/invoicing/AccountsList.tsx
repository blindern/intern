import { FormatNumber } from "components/FormatNumber.js"
import { PrinterInvoiceResponse } from "modules/printer/api.js"
import { RightTd } from "modules/printer/invoicing/Helpers.js"
import { Data } from "modules/printer/invoicing/types.js"
import React, { useMemo } from "react"

export function AccountsList({
  data,
  rawdata,
}: {
  data: Data
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
          result[account_key]!.sum += printerSummer.amountReal
        }
        result[sumAccountIdx]!.sum -= printerSummer.amountReal
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
