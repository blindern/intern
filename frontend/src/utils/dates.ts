import moment from "utils/moment"

export const formatDate = (
  date: string | Date | moment.Moment,
  format: string,
) => moment(date).format(format)
