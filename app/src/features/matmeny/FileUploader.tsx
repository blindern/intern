import { useConvertMatmenyDocMutation } from "./hooks.js"
import { type ModifiedDay } from "./MatmenyPage.js"
import { moment } from "../../utils/dates.js"
import { ChangeEvent } from "react"

export function FileUploader({
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
