import { ErrorMessages } from "components/ErrorMessages"
import { Loading } from "components/Loading"
import { useTitle } from "modules/core/title/PageTitle"
import { UserLink } from "modules/users/UserLink"
import React from "react"
import { formatDate } from "utils/dates"
import { usePrinterLastList } from "./api"

export const LastPrintsPage = () => {
  useTitle("Siste utskrifter")

  const { isLoading, isError, error, data } = usePrinterLastList()

  if (isLoading) {
    return <Loading />
  }

  if (isError && data == null) {
    return <ErrorMessages error={error} />
  }

  return (
    <>
      {data.length === 0 ? (
        <p>Ingen utskrifter ble funnet.</p>
      ) : (
        <table className="table table-striped nowrap">
          <thead>
            <tr>
              <th>Tid</th>
              <th>Bruker</th>
              <th>Navn</th>
              <th>Printer</th>
              <th style={{ textAlign: "right" }}>Antall sider</th>
            </tr>
          </thead>
          <tbody>
            {data.map((print, idx) => (
              <tr key={idx}>
                <td>{formatDate(print.jobdate, "dddd D. MMMM YYYY HH:mm")}</td>
                <td>
                  <UserLink username={print.username} />
                </td>
                <td>{print.realname}</td>
                <td>{print.printername}</td>
                <td style={{ textAlign: "right" }}>{print.jobsize}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
