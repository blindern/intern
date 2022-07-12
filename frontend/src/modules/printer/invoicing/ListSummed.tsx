import { FormatNumber } from "components/FormatNumber"
import { PrinterInvoiceResponse } from "modules/printer/api"
import { AccountsList } from "modules/printer/invoicing/AccountsList"
import { CostColumns } from "modules/printer/invoicing/CostColumns"
import { RightTd } from "modules/printer/invoicing/Helpers"
import { Data } from "modules/printer/invoicing/types"
import React from "react"

export function ListSummed({
  data,
  rawdata,
}: {
  data: Data
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
                utflyttet: undefined,
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
