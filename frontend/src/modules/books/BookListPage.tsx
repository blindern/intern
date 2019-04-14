import { useApiFetcher } from 'api'
import { PageTitle } from 'modules/core/title/PageTitle'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { booksService } from './BooksService'

const useDebounce = (value: string) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(
    () => {
      const timer = window.setTimeout(() => {
        setDebouncedValue(value)
      }, 250)

      return () => {
        window.clearTimeout(timer)
      }
    },
    [value],
  )

  return debouncedValue
}

const BookListPage = () => {
  const [query, setQuery] = useState<string>('')
  const debouncedQuery = useDebounce(query)
  const [page, setPage] = useState<number>(1)

  const results = useApiFetcher(
    () => booksService.getList(debouncedQuery, page),
    [debouncedQuery, page],
  )

  return (
    <>
      <PageTitle title='Biblioteket på Blindern Studenterhjem' />

      <p style={{ float: 'right' }}>
        <a href='books/register' className='btn btn-info'>
          Registrer ny bok
        </a>
      </p>

      <p>
        Den digitale bokdatabasen er fortsatt under utvikling, se{' '}
        <a href='https://github.com/blindern/intern/labels/bokdatabase'>
          GitHub
        </a>
        . Det er <a href='group/biblioteksutvalget'>biblioteksutvalget</a> som
        står for registrering av bøkene i biblioteket.{' '}
        {results ? results.total : '??'} bøker er registrert i databasen.
      </p>

      <div className='books_list'>
        <form>
          <div className='form-group'>
            <input
              value={query}
              onChange={e => {
                setQuery(e.target.value)
              }}
              type='text'
              className='form-control'
              placeholder='Søk etter tittel, år, forfatter, isbn eller BS-merkenr'
              autoFocus
            />
          </div>
        </form>

        {results === null ? (
          <p>Venter på søk...</p>
        ) : results.total === 0 ? (
          <p>Ingen treff ble funnet</p>
        ) : (
          <div className='books_list'>
            {results.data.map(book => (
              <div className='book' ng-repeat='book in books'>
                <Link to={`books/${book._id}`}>
                  <div className='thumb'>
                    {book.thumbnail && <img src={book.thumbnail} alt='' />}
                  </div>
                  <div className='bookdata'>
                    <div className='title'>
                      {book.title}
                      {book.subtitle && (
                        <span className='subtitle'>: {book.subtitle}</span>
                      )}
                    </div>
                    {book.pubdate && (
                      <div className='pubdate'>{book.pubdate}</div>
                    )}
                    {book.authors && (
                      <div className='authors'>
                        {(book.authors as string[]).map((name, idx) => (
                          <span>
                            {name}
                            {idx !== book.authors.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className='placeinfo'>
                    {book.bib_room && (
                      <div className='room'>{book.bib_room}</div>
                    )}
                    {book.bib_section && (
                      <div className='section'>{book.bib_section}</div>
                    )}
                  </div>
                </Link>
              </div>
            ))}

            {results !== null && (
              <Pagination
                page={page}
                totalPages={results.last_page}
                navigateTo={page => setPage(page)}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default BookListPage

const Pagination = ({
  page,
  totalPages,
  navigateTo,
}: {
  page: number
  totalPages: number
  navigateTo(page: number): void
}) => {
  function handleClick(page: number) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      if (page >= 1 && page <= totalPages) {
        navigateTo(page)
      }
    }
  }

  return (
    <nav className='text-center'>
      <ul className='pagination center'>
        <li>
          <a href='#' onClick={handleClick(1)}>
            &laquo;
          </a>
        </li>
        <li>
          <a href='#' onClick={handleClick(page - 1)}>
            &lsaquo;
          </a>
        </li>
        <li>
          <a>
            {page}/{totalPages}
          </a>
        </li>
        <li>
          <a href='#' onClick={handleClick(page + 1)}>
            &rsaquo;
          </a>
        </li>
        <li>
          <a href='#' onClick={handleClick(totalPages)}>
            &raquo;
          </a>
        </li>
      </ul>
    </nav>
  )
}
