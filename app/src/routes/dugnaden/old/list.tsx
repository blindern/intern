import { createFileRoute } from "@tanstack/react-router"
import { ErrorMessages } from "../../../components/ErrorMessages.js"
import { Loading } from "../../../components/Loading.js"
import {
  type DugnadDay,
  useDugnadenList,
} from "../../../features/dugnaden/hooks.js"
import { PageTitle } from "../../../hooks/useTitle.js"
import { formatDate } from "../../../utils/dates.js"
import { useState } from "react"

export const Route = createFileRoute("/dugnaden/old/list")({
  component: DugnadsinnkallingerPage,
})

function List({ list }: { list: DugnadDay[] }) {
  const [dugnadId, setDugnadId] = useState<string | null>(null)
  const dugnad = dugnadId == null ? null : list.find((d) => d.id === dugnadId)

  return (
    <>
      <p>
        Dugnad:{" "}
        <select
          name="dugnad"
          value={dugnadId ?? ""}
          onChange={(e) => setDugnadId(e.target.value)}
        >
          <option value="">Velg dugnad</option>
          {list.map((d) => (
            <option key={d.id} value={d.id}>
              {formatDate(d.date, "dddd D. MMMM YYYY")} ({d.people.length})
            </option>
          ))}
        </select>
      </p>
      {dugnad && dugnad.people.length > 0 && (
        <div className="dugnad-container">
          {dugnad.people.map((person, idx) => (
            <div className="dugnad-person" key={idx}>
              <h2 className="dugnad-header">
                Påminnelse om dugnad
                <br />
                <span className="dugnad-header-name">
                  {person.name} (#{person.room})
                </span>
              </h2>
              <p>Du har dugnad på lørdag!</p>
              <p>
                Hei, du er satt opp på dugnad{" "}
                {formatDate(dugnad.date, "dddd D. MMMM YYYY")}. Møt opp i
                peisestua klokken 10:00 iført arbeidsantrekk.
              </p>
              <p>
                Dersom du ikke møter vil du bli tildelt ny dugnad og en bot på
                kroner 500,-
              </p>
              <p>
                Dersom du ikke har mulighet til å møte på lørdag er det ditt
                eget ansvar å sørge for at noen andre stiller for deg.
              </p>
              <p>
                Med vennlig hilsen
                <br />
                Dugnadsledelsen
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function DugnadsinnkallingerPage() {
  const { isPending, isError, error, data } = useDugnadenList()

  if (isPending)
    return (
      <>
        <PageTitle title="Dugnadsinnkallinger" />
        <Loading />
      </>
    )
  if (isError && data == null)
    return (
      <>
        <PageTitle title="Dugnadsinnkallinger" />
        <ErrorMessages error={error} />
      </>
    )

  return (
    <>
      <PageTitle title="Dugnadsinnkallinger" />
      {data.length === 0 && <p>Ingen dugnader ble funnet.</p>}
      {data.length > 0 && <List list={data} />}
    </>
  )
}
