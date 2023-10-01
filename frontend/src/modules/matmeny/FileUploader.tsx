import { useConvertMatmenyDocMutation } from "modules/matmeny/api.js"
import { ModifiedDay } from "modules/matmeny/MatmenyPage.js"
import React, { ChangeEvent } from "react"
import moment from "utils/moment.js"

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
  const { mutateAsync, isLoading } = useConvertMatmenyDocMutation()

  function onFileChange(ev: ChangeEvent<HTMLInputElement>) {
    mutateAsync(ev.target.files![0]!)
      .then((parsed) => {
        for (const [dayNum, dishes] of Object.entries(parsed)) {
          const day = moment(firstDayInCurrentWeek)
            .add(parseInt(dayNum) - 1, "days")
            .format("YYYY-MM-DD")

          updateDay(day, () => ({
            dishes: dishes.join(","),
            text: "",
          }))
        }

        ev.target.value = ""
      })
      .catch(() => {
        alert("Ukjent feil ved opplasting og konvertering av dokument.")
      })
  }

  if (isLoading) {
    return <span className="form-control">Laster opp..</span>
  }

  return (
    <div>
      {<input type="file" className="form-control" onChange={onFileChange} />}
    </div>
  )
}
