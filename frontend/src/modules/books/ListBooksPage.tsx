import { useDebounceCallback } from '@react-hook/debounce'
import { Book, useBookList } from 'modules/books/api'
import { Pagination } from 'modules/books/Pagination'
import { useTitle } from 'modules/core/title/PageTitle'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { bookUrl } from 'urls'

function BookItem({ book }: { book: Book }) {
  return (
    <div key={book._id} className='book'>
      <Link to={bookUrl(book._id)}>
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
            <>
              {' '}
              <div className='pubdate'>{book.pubdate}</div>
            </>
          )}
          {book.authors && (
            <>
              {' '}
              <div className='authors'>{book.authors.join(', ')}</div>
            </>
          )}
        </div>
        <div className='placeinfo'>
          {book.bib_room && <div className='room'>{book.bib_room}</div>}
          {book.bib_room && book.bib_section && ' '}
          {book.bib_section && (
            <div className='section'>{book.bib_section}</div>
          )}
        </div>
      </Link>
    </div>
  )
}

export function ListBooksPage() {
  useTitle('Biblioteket på Blindern Studenterhjem')

  const [currentPage, setCurrentPage] = useState(1)
  const [searchFormValue, setSearchFormValue] = useState('')
  const [search, setSearch] = useState('')

  const changeSearch = useDebounceCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }, 250)

  const { isFetching, data } = useBookList({
    q: search,
    page: currentPage,
  })

  const totalPages = data?.last_page ?? 0

  function nextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  function firstPage() {
    setCurrentPage(1)
  }

  function lastPage() {
    setCurrentPage(totalPages)
  }

  return (
    <>
      <p style={{ float: 'right' }}>
        <Link to='books/register' className='btn btn-info'>
          Registrer ny bok
        </Link>
      </p>

      <p>
        Den digitale bokdatabasen er fortsatt under utvikling, se{' '}
        <a href='https://github.com/blindern/intern/labels/bokdatabase'>
          GitHub
        </a>
        . Det er <Link to='group/biblioteksutvalget'>biblioteksutvalget</Link>{' '}
        som står for registrering av bøkene i biblioteket. {data?.total} bøker
        er registrert i databasen.
      </p>

      <div className='books_list'>
        <form>
          <div className='form-group'>
            <input
              type='text'
              className='form-control'
              value={searchFormValue}
              onChange={(ev) => {
                setSearchFormValue(ev.target.value)
                changeSearch(ev.target.value)
              }}
              placeholder='Søk etter tittel, år, forfatter, isbn eller BS-merkenr'
              autoFocus
            />
          </div>
        </form>

        {!isFetching && !data && <p>Feil ved henting av data</p>}

        {data?.total === 0 && search !== '' && <p>Ingen treff ble funnet</p>}

        {(data?.data ?? []).length > 0 && (
          <>
            <div className='books_list'>
              {data?.data.map((book) => (
                <BookItem key={book._id} book={book} />
              ))}
            </div>

            <Pagination
              firstPage={firstPage}
              prevPage={prevPage}
              nextPage={nextPage}
              lastPage={lastPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </>
        )}
      </div>
    </>
  )
}
