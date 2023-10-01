import moment from "utils/moment.js"

export const formatDate = (
  date: string | Date | moment.Moment,
  format: string,
) => moment(date).format(format)
