import { ErrorMessages } from "components/ErrorMessages.js"
import { Loading } from "components/Loading.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import { useState } from "react"
import { styled } from "styled-components"
import { formatDate } from "utils/dates.js"
import { DugnadDay, useDugnadenList } from "./api.js"

const DugnadContainer = styled.div`
  page-break-before: always;
`

const DugnadPerson = styled.div`
  page-break-inside: avoid;
  margin-top: 40px;
`

const Header = styled.h2`
  line-height: 80%;
`

const HeaderName = styled.span`
  font-size: 70%;
`

const List = ({ list }: { list: DugnadDay[] }) => {
  const [dugnadId, setDugnadId] = useState<string | null>(null)

  const dugnad =
    dugnadId == null ? null : list.find((dugnad) => dugnad.id === dugnadId)

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
          {list.map((dugnad) => (
            <option key={dugnad.id} value={dugnad.id}>
              {formatDate(dugnad.date, "dddd D. MMMM YYYY")} (
              {dugnad.people.length})
            </option>
          ))}
        </select>
      </p>

      {dugnad && dugnad.people.length > 0 && (
        <DugnadContainer>
          {dugnad.people.map((person, idx) => (
            <DugnadPerson key={idx}>
              <Header>
                Påminnelse om dugnad
                <br />
                <HeaderName>
                  {person.name} (#{person.room})
                </HeaderName>
              </Header>
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
            </DugnadPerson>
          ))}
        </DugnadContainer>
      )}
    </>
  )
}

export const DugnadsinnkallingerPage = () => {
  useTitle("Dugnadsinnkallinger")
  const { isPending, isError, error, data } = useDugnadenList()

  if (isPending) {
    return <Loading />
  }

  if (isError && data == null) {
    return <ErrorMessages error={error} />
  }

  return (
    <>
      {data.length === 0 && <p>Ingen dugnader ble funnet.</p>}
      {data.length > 0 && <List list={data} />}
    </>
  )
}
