import classNames from "classnames"
import { createFileRoute } from "@tanstack/react-router"
import { ErrorMessages } from "../components/ErrorMessages.js"
import { Loading } from "../components/Loading.js"
import { useIsMemberOf } from "../features/auth/hooks.js"
import {
  type MatmenyDay,
  buildMatmenyDataKey,
  useMatmenyData,
  useUpdateMatmenyDaysMutation,
  useConvertMatmenyDocMutation,
} from "../features/matmeny/hooks.js"
import { PageTitle } from "../hooks/useTitle.js"
import { formatDate } from "../utils/dates.js"
import moment from "../utils/moment.js"
import { isEqual, keyBy } from "lodash"
import { ChangeEvent, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

export const Route = createFileRoute("/matmeny")({
  component: MatmenyPage,
})

interface ModifiedDay {
  dishes: string
  text: string
}

function useModifiedData(data: MatmenyDay[]) {
  const dataByDate = keyBy(data ?? [], (it) => it.day)
  const [modifiedDays, setModifiedDays] = useState<Record<string, ModifiedDay>>(
    {},
  )

  function updateDay(
    date: string,
    updater: (current: ModifiedDay) => ModifiedDay,
  ) {
    const persisted = {
      dishes: dataByDate[date]?.dishes?.join(",") ?? "",
      text: dataByDate[date]?.text ?? "",
    }
    setModifiedDays((prev) => {
      const updated = updater(prev[date] ?? persisted)
      const obj = { ...prev }
      if (isEqual(persisted, updated)) delete obj[date]
      else obj[date] = updated
      return obj
    })
  }

  const weeksWithChanges = new Set(
    Object.keys(modifiedDays).map((it) => moment(it).format("GGGG-WW")),
  )

  return {
    updateDay,
    weeksWithChanges,
    setModifiedDays,
    modifiedDays,
    updateDishes: (date: string, value: string) =>
      updateDay(date, (prev) => ({ ...prev, dishes: value })),
    updateText: (date: string, value: string) =>
      updateDay(date, (prev) => ({ ...prev, text: value })),
  }
}

interface Week {
  year: string
  week: string
  relnum: number
  start: moment.Moment
  days: Record<string, MatmenyDay>
  datacount: number
}

function useWeeks(
  data: MatmenyDay[],
  prevWeeksToShow: number,
  nextWeeksToShow: number,
) {
  const weeks: Record<string, Week> = {}
  const d = moment().startOf("week")
  d.subtract(prevWeeksToShow, "weeks")
  for (let i = 0; i < prevWeeksToShow + nextWeeksToShow + 1; i++) {
    const week: Week = {
      year: d.format("GGGG"),
      week: d.format("WW"),
      relnum: i - prevWeeksToShow,
      start: moment(d),
      days: {},
      datacount: 0,
    }
    weeks[d.format("GGGG-WW")] = week
    for (let j = 0; j < 7; j++) {
      week.days[d.format("YYYY-MM-DD")] = {
        day: d.format("YYYY-MM-DD"),
        text: null,
        dishes: [],
      }
      d.add(1, "days")
    }
  }
  for (const elm of data) {
    const d = moment(elm.day)
    weeks[d.format("GGGG-WW")].days[elm.day] = elm
    weeks[d.format("GGGG-WW")].datacount++
  }
  return { weeks }
}

function FileUploader({
  firstDayInCurrentWeek,
  updateDay,
}: {
  firstDayInCurrentWeek: moment.Moment
  updateDay: (
    date: string,
    updater: (current: ModifiedDay) => ModifiedDay,
  ) => void
}) {
  const { mutateAsync, isPending } = useConvertMatmenyDocMutation()
  function onFileChange(ev: ChangeEvent<HTMLInputElement>) {
    mutateAsync(ev.target.files![0])
      .then((parsed: Record<number, string[]>) => {
        for (const [dayNum, dishes] of Object.entries(parsed)) {
          const day = moment(firstDayInCurrentWeek)
            .add(parseInt(dayNum) - 1, "days")
            .format("YYYY-MM-DD")
          updateDay(day, () => ({ dishes: dishes.join(","), text: "" }))
        }
        ev.target.value = ""
      })
      .catch(() =>
        alert("Ukjent feil ved opplasting og konvertering av dokument."),
      )
  }
  if (isPending) return <span className="form-control">Laster opp..</span>
  return (
    <div>
      <input type="file" className="form-control" onChange={onFileChange} />
    </div>
  )
}

function MatmenyAdmin() {
  const queryClient = useQueryClient()
  const prevWeeksToShow = 4,
    nextWeeksToShow = 4
  const { mutateAsync, isPending: isSubmitting } =
    useUpdateMatmenyDaysMutation()
  const firstDate = moment()
    .startOf("week")
    .subtract(prevWeeksToShow, "weeks")
    .format("YYYY-MM-DD")
  const lastDate = moment()
    .endOf("week")
    .add(nextWeeksToShow, "weeks")
    .format("YYYY-MM-DD")
  const { isPending, isError, error, data } = useMatmenyData(
    firstDate,
    lastDate,
  )
  const { weeks } = useWeeks(data ?? [], prevWeeksToShow, nextWeeksToShow)
  const [currentWeek, setCurrentWeek] = useState(() => {
    const d = moment()
    if (parseInt(d.format("E")) > 3) d.add(1, "week")
    return d.format("GGGG-WW")
  })
  const {
    updateDishes,
    updateText,
    updateDay,
    weeksWithChanges,
    modifiedDays,
    setModifiedDays,
  } = useModifiedData(data ?? [])

  function saveChanges() {
    if (!weeksWithChanges.has(currentWeek)) return
    const days = Object.values(weeks[currentWeek].days).map((day) => {
      const result = { ...day }
      const modified = modifiedDays[day.day]
      if (modified) {
        result.dishes = modified.dishes
          .split(",")
          .map((it) => it.trim())
          .filter((it) => it !== "")
        result.text = modified.text
      }
      return result
    })
    void mutateAsync(days).then((response) => {
      const savedDays = days.map((it) => it.day)
      queryClient.setQueryData(buildMatmenyDataKey(firstDate, lastDate), [
        ...(data ?? []).filter((it) => !savedDays.includes(it.day)),
        ...response,
      ])
      setModifiedDays(
        Object.fromEntries(
          Object.entries(modifiedDays).filter(
            ([date]) => !savedDays.includes(date),
          ),
        ),
      )
    })
  }

  if (isPending) return <Loading />
  if (isError && data == null) return <ErrorMessages error={error} />

  return (
    <div>
      <div className="panel panel-warning">
        <div className="panel-heading">
          <h2 className="panel-title">Redigering av matmenyen</h2>
        </div>
        <div className="panel-body">
          <div className="form-horizontal">
            <div className="form-group">
              <label className="col-md-3 control-label">Velg uke</label>
              <div className="col-md-9">
                <select
                  className="form-control"
                  value={currentWeek}
                  onChange={(ev) => setCurrentWeek(ev.target.value)}
                >
                  {Object.values(weeks).map((week) => (
                    <option
                      key={`${week.year}-${week.week}`}
                      value={`${week.year}-${week.week}`}
                    >
                      Uke {week.week} {week.year} (fra{" "}
                      {formatDate(week.start, "DD.MM")}){" "}
                      {week.relnum === 1
                        ? "(neste uke)"
                        : week.relnum === 0
                          ? "(inneværende uke)"
                          : ""}{" "}
                      {week.datacount ? " (har data)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="col-md-3 control-label">
                Importer fra menydokument
              </label>
              <div className="col-md-9">
                <FileUploader
                  firstDayInCurrentWeek={weeks[currentWeek].start}
                  updateDay={updateDay}
                />
                <span className="help-block">
                  OBS! Dokumentet må benytte kjøkkenets matmeny-mal lagret i
                  .doc for å la seg lese automatisk.
                </span>
              </div>
            </div>
            <form
              autoComplete="off"
              className={classNames({
                "has-warning": weeksWithChanges.has(currentWeek),
              })}
              onSubmit={(ev) => {
                ev.preventDefault()
                saveChanges()
              }}
            >
              {Object.entries(weeks[currentWeek].days).map(([date, day]) => (
                <div key={date} className="form-group">
                  <label className="col-md-3 control-label">
                    {formatDate(date, "dddd D. MMM")}
                  </label>
                  <div className="col-md-4">
                    <input
                      type="text"
                      value={
                        modifiedDays[date]?.dishes ??
                        day.dishes?.join(",") ??
                        ""
                      }
                      onChange={(ev) => updateDishes(date, ev.target.value)}
                      className="form-control"
                      placeholder="Matretter, separer med komma"
                    />
                  </div>
                  <div className="col-md-5">
                    <input
                      type="text"
                      value={modifiedDays[date]?.text ?? day.text ?? ""}
                      onChange={(ev) => updateText(date, ev.target.value)}
                      className="form-control"
                      placeholder="Evt. kommentar for dagen"
                    />
                  </div>
                </div>
              ))}
              {weeksWithChanges.has(currentWeek) && (
                <div className="form-group">
                  <div className="col-md-9 col-md-offset-3">
                    <input
                      type="submit"
                      value={
                        isSubmitting
                          ? "Lagre endringer (...)"
                          : "Lagre endringer"
                      }
                      className="btn btn-primary"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
        <div className="panel-footer">
          Denne tjenesten er tilgjengelig for administrasjonen (på deres
          nettverk), kollegiet og IT-gruppa.
        </div>
      </div>
    </div>
  )
}

function MatmenyPage() {
  const groupAccess = useIsMemberOf(["kollegiet", "ansatt"])
  const access = groupAccess

  return (
    <>
      <PageTitle title="Matmeny" />
      <p>
        Ukemenyen finner du her:{" "}
        <a href="matmeny/plain" target="_self">
          matmeny/plain
        </a>
      </p>
      <p>
        Du kan også bruke følgende adresse og legge inn i kalenderen din:{" "}
        <a href="matmeny.ics" target="_self">
          https://foreningenbs.no/intern/matmeny.ics
        </a>
      </p>
      <p>Denne siden brukes for øyeblikket kun for oppdatering av matmeny.</p>
      {!access ? (
        <p>
          <b>
            Du har ikke tilgang til å redigere matmenyen. Administrasjonen,
            kollegiet og IT-gruppa kan gjøre endringer.
          </b>
        </p>
      ) : (
        <MatmenyAdmin />
      )}
    </>
  )
}
