import { createFileRoute } from "@tanstack/react-router"
import { ErrorMessages } from "../../components/ErrorMessages.js"
import { Loading } from "../../components/Loading.js"
import { UserLink } from "../../components/UserLink.js"
import { usePrinterLastList } from "../../hooks/usePrinter.js"
import { PageTitle } from "../../hooks/useTitle.js"
import { formatDate } from "../../utils/dates.js"

export const Route = createFileRoute("/printer/siste")({
  component: LastPrintsPage,
})

function LastPrintsPage() {
  const { isPending, isError, error, data } = usePrinterLastList()

  if (isPending)
    return (
      <>
        <PageTitle title="Siste utskrifter" />
        <Loading />
      </>
    )
  if (isError && data == null)
    return (
      <>
        <PageTitle title="Siste utskrifter" />
        <ErrorMessages error={error} />
      </>
    )

  return (
    <>
      <PageTitle title="Siste utskrifter" />
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
