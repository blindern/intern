import { Book, useBook, useDeleteBookMutation } from 'modules/books/api'
import { SetBarcode } from 'modules/books/SetBarcode'
import { bookTitle } from 'modules/books/utils'
import { useAuthorization } from 'modules/core/auth/Authorization'
import { useTitle } from 'modules/core/title/PageTitle'
import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { booksUrl, editBookUrl, registerBookUrl } from 'urls'

function DeleteButton({ book }: { book: Book }) {
  const navigate = useNavigate()
  const { mutateAsync } = useDeleteBookMutation()

  function deleteBook() {
    if (confirm('Er du sikker på at du vil slette boka fra databasen?')) {
      void mutateAsync(book).then(() => {
        navigate(booksUrl())
      })
    }
  }

  return (
    <button className='btn btn-danger' onClick={() => deleteBook()}>
      Slett
    </button>
  )
}

export function BookPage() {
  const { id } = useParams()
  const { isFetching, data: book } = useBook(id!)
  const { bookAdmin } = useAuthorization()

  useTitle(
    book
      ? bookTitle(book)
      : isFetching
      ? 'Laster bok ...'
      : 'Feil ved lasting av bok',
  )

  if (!book && isFetching) {
    return <p>Laster bok ...</p>
  }

  if (!book) {
    return <p>Feil ved henting av data</p>
  }

  return (
    <>
      <p className='pull-right'>
        <Link className='btn btn-success' to={registerBookUrl()}>
          Registrer ny bok
        </Link>{' '}
        <Link className='btn btn-primary' to={editBookUrl(book._id)}>
          Rediger
        </Link>{' '}
        <DeleteButton book={book} />
      </p>

      {bookAdmin && !book?.bib_barcode && <SetBarcode book={book} />}

      <div className='row'>
        <div className='col-sm-9'>
          {book.bib_room && (
            <p className='text-muted'>
              Denne boka finner du i rommet{' '}
              <i>{book.bib_room || '(ikke registrert)'}</i>
              {book.bib_section && (
                <>
                  {' '}
                  under seksjonen <i>{book.bib_section}</i>
                </>
              )}
              .
            </p>
          )}

          <dl className='dl-horizontal'>
            {book.pubdate && (
              <>
                <dt>Utgitt</dt>
                <dd>{book.pubdate}</dd>
              </>
            )}

            {book.authors && (
              <>
                <dt>Forfattere</dt>
                <dd>{book.authors.join(', ')}</dd>
              </>
            )}

            {book.description && (
              <>
                <dt>Beskrivelse</dt>
                <dd>{book.description}</dd>
              </>
            )}

            {book.isbn && (
              <>
                <dt>ISBN</dt>
                <dd>{book.isbn}</dd>
              </>
            )}

            <dt>Registrert</dt>
            <dd>{book.created_at}</dd>

            {book.bib_barcode && (
              <>
                <dt>Nummer i databasen</dt>
                <dd>{book.bib_barcode}</dd>
              </>
            )}
          </dl>
        </div>
        <div className='col-sm-3'>
          {book.thumbnail && (
            <p>
              <img src={book.thumbnail} alt='' />
            </p>
          )}
        </div>
      </div>

      <p>
        <Link to={booksUrl()}>&laquo; Bokliste</Link>
      </p>
    </>
  )
}
