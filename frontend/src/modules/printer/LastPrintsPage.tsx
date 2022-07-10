import { useApiFetcher } from 'api'
import LoadingPage from 'components/LoadingPage'
import { PageTitle } from 'modules/core/title/PageTitle'
import UserLink from 'modules/users/UserLink'
import React from 'react'
import { formatDate } from 'utils/dates'
import { LastPrintItem, printerService } from './PrinterService'

const List = ({ list }: { list: LastPrintItem[] }) => {
  return (
    <>
      <PageTitle title='Siste utskrifter' />
      {list.length === 0 ? (
        <p>Ingen utskrifter ble funnet.</p>
      ) : (
        <table className='table table-striped nowrap'>
          <thead>
            <tr>
              <th>Tid</th>
              <th>Bruker</th>
              <th>Navn</th>
              <th>Printer</th>
              <th style={{ textAlign: 'right' }}>Antall sider</th>
            </tr>
          </thead>
          <tbody>
            {list.map((print, idx) => (
              <tr key={idx}>
                <td>{formatDate(print.jobdate, 'dddd D. MMMM YYYY HH:mm')}</td>
                <td>
                  <UserLink username={print.username} />
                </td>
                <td>{print.realname}</td>
                <td>{print.printername}</td>
                <td style={{ textAlign: 'right' }}>{print.jobsize}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

const LastPrintsPage = () => {
  const list = useApiFetcher(() => printerService.getLastList(), [])
  if (!list) {
    return <LoadingPage />
  }

  return <List list={list} />
}

export default LastPrintsPage
