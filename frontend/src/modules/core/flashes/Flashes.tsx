import classNames from 'classnames'
import React, { useContext } from 'react'
import { formatDate } from 'utils/dates'
import './Flashes.scss'
import { FlashesContext } from './FlashesProvider'

const Flashes = () => {
  const { flashes } = useContext(FlashesContext)

  return (
    <>
      {flashes.map((flash, idx) => (
        <div key={idx} className='message-box-wrap'>
          <div
            className={classNames(
              'message-box',
              flash.type ? 'bg-' + flash.type : null,
            )}
          >
            <b>{formatDate(flash.date, 'HH:mm:ss')}:</b> {flash.message}
          </div>
        </div>
      ))}
    </>
  )
}

export default Flashes
