import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from 'utils/dates'
import { MatmenyDay, useMatmenyHomeData } from './api'

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
  const { isFetching, isSuccess, data: matmeny } = useMatmenyHomeData()

  if (isFetching || !isSuccess) {
    return null
  }

  const { today, tomorrow } = matmeny

  return (
    <Link to='/matmeny' className='index-matmeny'>
      <h4>Matmeny</h4>
      <p className='day'>
        <b>Dagens matrett</b> ({formatDate(today.date, 'dddd')}):
        <br />
        <MatmenyDay data={today.data} />
      </p>
      <p>
        I morgen, {formatDate(tomorrow.date, 'dddd')}:<br />
        <MatmenyDay data={tomorrow.data} />
      </p>
      <p className='text-muted'>
        <i>(Oppdateres ukentlig av kjøkkensjefen.)</i>
      </p>
    </Link>
  )
}

export default MatmenyHomeBox
