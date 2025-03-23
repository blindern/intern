import classNames from "classnames"
import { ErrorMessages } from "components/ErrorMessages.js"
import { Loading } from "components/Loading.js"
import { isEqual, keyBy } from "lodash"
import { useAuthInfo } from "modules/core/auth/AuthInfoProvider.js"
import { useIsMemberOf } from "modules/core/auth/hooks.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import {
  buildMatmenyDataKey,
  MatmenyDay,
  useMatmenyData,
  useUpdateMatmenyDaysMutation,
} from "modules/matmeny/api.js"
import { FileUploader } from "modules/matmeny/FileUploader.js"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { formatDate } from "utils/dates.js"
import moment from "utils/moment.js"

interface Week {
  year: string
  week: string
  relnum: number
  start: moment.Moment
  days: Record<string, MatmenyDay>
  datacount: number
}

export interface ModifiedDay {
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
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      text: dataByDate[date]?.text || "",
    }

    setModifiedDays((prev) => {
      const updated = updater(prev[date] ?? persisted)
      const obj = { ...prev }

      if (isEqual(persisted, updated)) {
        delete obj[date]
      } else {
        obj[date] = updated
      }

      return obj
    })
  }

  function updateDishes(date: string, value: string) {
    updateDay(date, (prev) => ({
      ...prev,
      dishes: value,
    }))
  }

  function updateText(date: string, value: string) {
    updateDay(date, (prev) => ({
      ...prev,
      text: value,
    }))
  }

  const weeksWithChanges = new Set(
    Object.keys(modifiedDays).map((it) => moment(it).format("GGGG-WW")),
  )

  return {
    updateDishes,
    updateText,
    updateDay,
    weeksWithChanges,
    setModifiedDays,
    modifiedDays,
  }
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
    weeks[d.format("GGGG-WW")]!.days[elm.day] = elm
    weeks[d.format("GGGG-WW")]!.datacount++
  }

  return { weeks }
}

function MatmenyAdmin() {
  const queryClient = useQueryClient()

  const prevWeeksToShow = 4
  const nextWeeksToShow = 4

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

  const currentWeekHasChanges = weeksWithChanges.has(currentWeek)

  function saveChanges() {
    if (!currentWeekHasChanges) return

    const days = Object.values(weeks[currentWeek]!.days).map((day) => {
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
      // Note that days that is emptied will not be part
      // of the list reponse (the day is deleted).

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

  if (isPending) {
    return <Loading />
  }

  if (isError && data == null) {
    return <ErrorMessages error={error} />
  }

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
                  {Object.values(weeks).map((week, idx) => (
                    <option key={idx} value={`${week.year}-${week.week}`}>
                      <>
                        Uke {week.week} {week.year} (fra{" "}
                        {formatDate(week.start, "DD.MM")}){" "}
                        {week.relnum == 1
                          ? "(neste uke)"
                          : week.relnum == 0
                            ? "(inneværende uke)"
                            : ""}{" "}
                        {week.datacount ? " (har data)" : ""}
                      </>
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
                  firstDayInCurrentWeek={weeks[currentWeek]!.start}
                  updateDay={updateDay}
                />
                <span className="help-block">
                  OBS! Dokumentet må benytte kjøkkenets matmeny-mal lagret i
                  .doc for å la seg lese automatisk.
                </span>
              </div>
            </div>

            <form
              name="inputform"
              autoComplete="off"
              className={classNames({
                "has-warning": currentWeekHasChanges,
              })}
              onSubmit={(ev) => {
                ev.preventDefault()
                saveChanges()
              }}
            >
              {Object.entries(weeks[currentWeek]!.days).map(([date, day]) => (
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

export function MatmenyPage() {
  useTitle("Matmeny")

  const groupAccess = useIsMemberOf(["kollegiet", "ansatt"])
  const authInfo = useAuthInfo()

  const access = authInfo.data.isOffice || groupAccess

  return (
    <>
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
