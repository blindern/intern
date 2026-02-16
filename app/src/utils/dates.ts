import moment from "moment"
import "moment/locale/nb"

moment.locale("nb")

export const formatDate = (
  date: string | Date | moment.Moment,
  format: string,
) => moment(date).format(format)

export { moment }
