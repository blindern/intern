import { FormatNumber } from 'components/FormatNumber'
import { CostColumns } from 'modules/printer/invoicing/CostColumns'
import { RightTd } from 'modules/printer/invoicing/Helpers'
import { Data } from 'modules/printer/invoicing/types'
import React from 'react'

export function ListDetailed({ data }: { data: Data }) {
  return (
    <>
      {data.sections.map((section, sectionidx) => (
        <React.Fragment key={sectionidx}>
          {[...section.printers]
            .sort((a, b) => a.printername.localeCompare(b.printername))
            .map((group) => (
              <div key={group.printername} className='printergroup'>
                <h2>
                  {section.isBeboer
                    ? 'Enkeltbeboere'
                    : 'Gruppe: ' + group.printername}
                </h2>
                {group.comment != null && group.comment !== '' && (
                  <p>{group.comment}</p>
                )}

                <table
                  className='table table-striped table-condensed'
                  style={{ width: 'auto' }}
                >
                  <thead>
                    <tr>
                      <th>Navn</th>
                      <th>Måned</th>
                      <th>Jobber</th>
                      <th>Per side</th>
                      <th>Sider</th>
                      <th>Å betale</th>
                    </tr>
                  </thead>
                  <tfoot>
                    <tr style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                      <td colSpan={2}>Sum</td>
                      <td style={{ textAlign: 'right' }}>
                        <FormatNumber
                          value={group.summer.numJobs}
                          decimals={0}
                        />
                      </td>
                      <td />
                      <RightTd>
                        <FormatNumber
                          value={group.summer.numPages}
                          decimals={0}
                        />
                      </RightTd>
                      <RightTd>
                        <FormatNumber value={group.summer.amountReal} />
                      </RightTd>
                    </tr>
                  </tfoot>
                  {[...group.users]
                    .sort((a, b) => a.realname.localeCompare(b.realname))
                    .map((row) => {
                      const showSum = row.months.length > 1
                      const numRows = row.months.length + (showSum ? 1 : 0)

                      return (
                        <tbody key={row.username}>
                          {row.months.map((month, monthidx) => (
                            <tr key={monthidx}>
                              {monthidx === 0 && (
                                <td rowSpan={numRows}>
                                  {row.realname || row.username}
                                  {section.isBeboer && row.utflyttet && (
                                    <b> Utflyttet?</b>
                                  )}
                                </td>
                              )}
                              <td>{month.name}</td>
                              <RightTd>{month.summer.numJobs}</RightTd>
                              <CostColumns
                                countByCost={month.summer.countByCost}
                              />
                              <RightTd>
                                <FormatNumber value={month.summer.amountReal} />
                              </RightTd>
                            </tr>
                          ))}
                          {showSum && (
                            <tr style={{ fontStyle: 'italic' }}>
                              <td>Sum</td>
                              <RightTd>{row.summer.numJobs}</RightTd>
                              <td />
                              <RightTd>
                                <FormatNumber
                                  value={row.summer.numPages}
                                  decimals={0}
                                />
                              </RightTd>
                              <RightTd>
                                <FormatNumber value={row.summer.amountReal} />
                              </RightTd>
                            </tr>
                          )}
                        </tbody>
                      )
                    })}
                </table>
              </div>
            ))}
        </React.Fragment>
      ))}
    </>
  )
}
