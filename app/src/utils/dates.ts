import moment from "moment/min/moment-with-locales"

moment.locale("nb")

export const formatDate = (
  date: string | Date | moment.Moment,
  format: string,
) => moment(date).format(format)

export { moment }
