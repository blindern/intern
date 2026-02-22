import { useMemo } from "react"
import type { AggregatedData, PrinterInvoiceResponse } from "./types.js"
import { CostColumns, RightTd } from "./CostColumns.js"
import { FormatNumber } from "../FormatNumber.js"

export function ListSummed({
  data,
  rawdata,
}: {
  data: AggregatedData
  rawdata: PrinterInvoiceResponse
}) {
  return (
    <div className="row">
      {data.sections.map((section, sectionidx) => {
        const groups = section.isBeboer
          ? section.printers
              .flatMap((it) => it.users)
              .sort((a, b) => a.realname.localeCompare(b.realname))
              .map((it) => ({
                name: it.realname,
                summer: it.summer,
                utflyttet: it.utflyttet,
                comment: undefined,
              }))
          : [...section.printers]
              .sort((a, b) => a.printername.localeCompare(b.printername))
              .map((it) => ({
                name: it.printername,
                summer: it.summer,
                utflyttet: undefined as boolean | undefined,
                comment: it.comment,
              }))

        return (
          <div key={sectionidx} className="col-md-6 printergroup">
            <h2>{section.title}</h2>

            {section.isBeboer &&
              section.printers
                .filter((it) => it.comment != null && it.comment !== "")
                .map((group, groupidx) => (
                  <p key={groupidx}>{group.comment}</p>
                ))}

            {section.description && <p>{section.description}</p>}

            <table
              className="table table-striped table-condensed"
              style={{ width: "auto" }}
            >
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Per side</th>
                  <th>Sider</th>
                  <th>Å betale</th>
                  {!section.isBeboer && <th>Kommentar</th>}
                </tr>
              </thead>
              <tfoot>
                <tr style={{ fontStyle: "italic", fontWeight: "bold" }}>
                  <td>Sum ({groups.length} stk)</td>
                  <td />
                  <RightTd>
                    <FormatNumber
                      value={section.summer.numPages}
                      decimals={0}
                    />
                  </RightTd>
                  <RightTd>
                    <FormatNumber value={section.summer.amountReal} />
                  </RightTd>
                  {!section.isBeboer && <td />}
                </tr>
              </tfoot>
              <tbody>
                {groups.map((row) => {
                  const hasComment = row.comment != null && row.comment !== ""

                  return (
                    <tr key={row.name}>
                      <td>
                        {row.name}
                        {section.isBeboer && row.utflyttet && (
                          <b> Utflyttet?</b>
                        )}
                      </td>
                      <CostColumns countByCost={row.summer.countByCost} />
                      <RightTd>
                        <FormatNumber value={row.summer.amountReal} />
                      </RightTd>
                      {!section.isBeboer && (
                        <td>
                          {(hasComment || row.summer.amountAlt > 0) && (
                            <>
                              {row.comment}
                              <br />
                              {row.summer.amountAlt > 0 && (
                                <>
                                  (ikke dekket: kr{" "}
                                  <FormatNumber value={row.summer.amountAlt} />)
                                </>
                              )}
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}

      <AccountsList data={data} rawdata={rawdata} />
    </div>
  )
}

function AccountsList({
  data,
  rawdata,
}: {
  data: AggregatedData
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
          result[account_key].sum += printerSummer.amountReal
        }
        result[sumAccountIdx].sum -= printerSummer.amountReal
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
