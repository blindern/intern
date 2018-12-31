import moment from 'utils/moment'

export const formatDate = (date: string | Date, format: string) =>
  moment(date).format(format)
