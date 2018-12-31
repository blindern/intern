import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from 'utils/dates'

interface MatmenyDay {
  day: string // YYYY-MM-DD
  dishes: string[]
  text: string | null
}

const matmenydate = {
  today: '2018-12-31',
  tomorrow: '2019-01-01',
}

interface MatmenyProp {
  today?: MatmenyDay
  tomorrow?: MatmenyDay
}

const matmeny: MatmenyProp = {}

const MatmenyDay = ({ data }: { data?: MatmenyDay }) => {
  if (!data) return <>Ukjent</>

  return (
    <>
      {data.dishes.join(', ')}
      {data.text && <span style={{ color: '#FF0000' }}>({data.text})</span>}
    </>
  )
}

const MatmenyHomeBox = () => {
  if (!matmeny) {
    return null
  }

  return (
    <Link to='/matmeny' className='index-matmeny'>
      <h4>Matmeny</h4>
      <p className='day'>
        <b>Dagens matrett</b> ({formatDate(matmenydate.today, 'dddd')}):
        <br />
        <MatmenyDay data={matmeny.today} />
      </p>
      <p>
        I morgen, {formatDate(matmenydate.tomorrow, 'dddd')}:<br />
        <MatmenyDay data={matmeny.tomorrow} />
      </p>
      <p className='text-muted'>
        <i>(Oppdateres ukentlig av kjøkkensjefen.)</i>
      </p>
    </Link>
  )
}

export default MatmenyHomeBox
