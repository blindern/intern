import { useApiFetcher } from 'api'
import classNames from 'classnames'
import React from 'react'
import { Link } from 'react-router-dom'
import { arrplanService } from './ArrplanService'

const ArrplanHomeBox = () => {
  const arrplan = useApiFetcher(arrplanService.getNext, [])

  return (
    <Link to='/arrplan' className='index-arrplan'>
      <h4>Neste på arrangementplanen</h4>
      {arrplan == null ? (
        <div>Laster...</div>
      ) : (
        arrplan.map((event, idx) =>
          event.type === 'event' || event.type === 'event_recurring' ? (
            <p
              key={idx}
              className={classNames({
                oldHappening: event.expired,
                lowPriority: event.priority === 'low',
                highPriority: event.priority === 'high',
              })}
            >
              <span className='text-muted'>{event.duration}:</span>{' '}
              {event.title}
            </p>
          ) : (
            <p>Ukjent</p>
          ),
        )
      )}
    </Link>
  )
}

export default ArrplanHomeBox
