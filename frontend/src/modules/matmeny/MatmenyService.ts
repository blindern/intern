import { get } from 'api'
import moment from 'utils/moment'

export interface MatmenyDay {
  day: string // YYYY-MM-DD
  dishes: string[]
  text: string | null
}

class MatmenyService {
  async getHomeData() {
    const today = moment().format('YYYY-MM-DD')
    const tomorrow = moment()
      .add(1, 'days')
      .format('YYYY-MM-DD')

    const response = await get(`matmeny?from=${today}&to=${tomorrow}`)
    const data = (await response.json()) as MatmenyDay[]

    return {
      today: {
        date: today,
        data: data.find(item => item.day === today),
      },
      tomorrow: {
        date: tomorrow,
        data: data.find(item => item.day === tomorrow),
      },
    }
  }
}

export const matmenyService = new MatmenyService()
