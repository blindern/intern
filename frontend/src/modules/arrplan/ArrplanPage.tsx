import { useApiFetcher } from 'api'
import classNames from 'classnames'
import LoadingPage from 'components/LoadingPage'
import { PageTitle } from 'modules/core/title/PageTitle'
import React from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import moment from 'utils/moment'
import {
  arrplanService,
  getSemesterListFromEvent,
  Semester,
} from './ArrplanService'
import { Comment, EventItem, NormalEvent } from './types'

const getSemesterList = (list: EventItem[]) => {
  const hashedSemesters = list.reduce<{ [id: string]: Semester }>(
    (acc, event) => {
      getSemesterListFromEvent(event).forEach((s) => {
        acc[s.id] = s
      })
      return acc
    },
    {},
  )

  const semesters = Object.values(hashedSemesters)
    .map(({ id, semester, year }) => ({
      id,
      text: `${semester === 'h' ? 'Høst' : 'Vår'} ${year}`,
      sortKey: `${year}-${semester === 'v' ? '0' : '1'}`,
    }))
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))

  return semesters
}

const filterEventsBySemester = (list: EventItem[], semesterId: string) =>
  list.filter((event) =>
    getSemesterListFromEvent(event).find((item) => item.id === semesterId),
  )

const getRecurringEventSortKey = (event: NormalEvent) => {
  const start = moment(event.start)
  return ((start.day() + 6) % 7) * 10000 + start.hours() * 100 + start.minutes()
}

const sortRecurringEvents = (a: NormalEvent, b: NormalEvent) =>
  getRecurringEventSortKey(a) - getRecurringEventSortKey(b)

const ArrplanContainer = styled.div`
  .lowPriority {
    color: #4d4d4d;
    &:hover {
      color: #000;
    }
  }
  .highPriority {
    color: #990000;
    &:hover {
      color: #000;
    }
  }
  .oldHappening {
    color: #4d4d4d;
    &:hover {
      color: #000;
    }
  }
`

const EventDate = styled.div`
  @media (min-width: 768px) {
    text-align: right;
  }
`

const EventTitle = ({ event }: { event: NormalEvent }) => (
  <>
    {event.title}
    {event.by && (
      <>
        {' '}
        <span style={{ color: '#AAA' }}>[{event.by}]</span>
      </>
    )}
  </>
)

const List = ({
  semesterId,
  list,
}: {
  semesterId: string
  list: EventItem[]
}) => {
  const semesters = getSemesterList(list)
  const activeSemester = semesters.find((item) => item.id === semesterId)

  const eventsCurrentSemester =
    activeSemester != null ? filterEventsBySemester(list, semesterId) : []

  const eventsNormal = eventsCurrentSemester.filter(
    (item) => item.type === 'event',
  ) as NormalEvent[]

  const eventsRecurring = eventsCurrentSemester
    .filter((item) => item.type === 'event_recurring')
    .sort(sortRecurringEvents) as NormalEvent[]
  const comments = eventsCurrentSemester.filter(
    (item) => item.type === 'comment',
  ) as Comment[]

  return (
    <>
      <PageTitle title='Arrangementplan på Blindern Studenterhjem' />

      <ArrplanContainer>
        <ul className='nav nav-tabs' role='tablist'>
          {semesters.map((semester) => (
            <li
              key={semester.id}
              className={semester === activeSemester ? 'active' : ''}
            >
              <Link to={`/arrplan/${semester.id}`}>{semester.text}</Link>
            </li>
          ))}
        </ul>

        <div className='alert alert-info' style={{ marginTop: '1em' }}>
          <b>Redigering:</b> Alle beboere kan logge inn på wikien og{' '}
          <a href='https://foreningenbs.no/confluence/display/BS/Arrangementplan'>
            redigere arrangementplanen
          </a>
          !
        </div>

        {eventsNormal.length > 0 && (
          <>
            <h3>Arrangementer</h3>
            {eventsNormal.map((event, idx) => (
              <div
                key={idx}
                className={classNames('row', {
                  oldHappening: event.expired,
                  lowPriority: event.priority === 'low',
                  highPriority: event.priority === 'high',
                })}
              >
                <EventDate className='col-sm-3'>{event.duration}</EventDate>
                <div className='col-sm-9'>
                  <EventTitle event={event} />
                </div>
              </div>
            ))}
          </>
        )}

        {eventsRecurring.length > 0 && (
          <>
            <h3>Øvrige aktiviteter</h3>
            <div className='alert alert-warning'>
              <strong>OBS!</strong> Denne oversikten inneholder arrangementer
              som har vært avholdt også tidligere i semesteret og som ikke
              lenger avholdes. Se{' '}
              <a href='https://foreningenbs.no/confluence/display/BS/Arrangementplan'>
                kalenderen på wiki
              </a>{' '}
              for en mer nøyaktig oversikt.
            </div>

            {eventsRecurring.map((event, idx) => (
              <div key={idx} className='row'>
                <EventDate className='col-sm-3'>{event.duration}</EventDate>
                <div className='col-sm-9'>
                  <EventTitle event={event} />
                </div>
              </div>
            ))}
          </>
        )}

        {comments.length > 0 && (
          <>
            <h3>Kommentarer</h3>
            <dl>
              {comments.map(({ date, comment }, idx) => (
                <React.Fragment key={idx}>
                  <dt>{date}</dt>
                  <dd>{comment}</dd>
                </React.Fragment>
              ))}
            </dl>
          </>
        )}

        <h2>Google Calendar, kalender på mobil, o.l.</h2>
        <p>
          Du kan få kalenderen automatisk inn i Google Calender eller en annen
          kalender du måtte ha. For dette trenger du å legge inn denne adressen
          i kalenderen din:
          <br />
          <a href='/intern/arrplan.ics'>
            {'https://foreningenbs.no/intern/arrplan.ics'}
          </a>{' '}
          <i>(kopier lenken, ikke last ned)</i>
        </p>
        <p>Slik gjør du det for Google Calendar:</p>
        <p style={{ textAlign: 'center' }}>
          <img
            src='/intern/assets/images/arrplan/googlecal.png'
            className='img-responsive img-thumbnail'
            alt='Eksempel med Google Calendar'
          />
        </p>
      </ArrplanContainer>
    </>
  )
}

const ArrplanPage = () => {
  const { semester } = useParams()

  const list = useApiFetcher(arrplanService.getList, [])
  if (!list) {
    return <LoadingPage />
  }

  return <List semesterId={semester!} list={list} />
}

export default ArrplanPage
