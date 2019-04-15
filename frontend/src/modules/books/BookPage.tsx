import { useApiFetcher } from 'api'
import LoadingPage from 'components/LoadingPage'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import history from 'utils/history'
import { Book, booksService } from './BooksService'
import { PageTitle } from 'modules/core/title/PageTitle'

const Detail = ({ book, reload }: { book: Book; reload(): void }) => {
  // TODO: $scope.show_barcode_form = AuthService.inGroup('biblioteksutvalget');
  const showBarcodeForm = !book.bib_barcode && false

  const [barcode, setBarcode] = useState<string>('')

  const registerBarcode = async () => {
    if (barcode.substring(0, 3) !== 'BS-') {
      alert('Ugyldig strekkode for biblioteket.')
    } else {
      await booksService.setBarcode(book._id, barcode)
      reload()
    }
  }

  const deleteBook = async () => {
    if (confirm('Er du sikker på at du vil slette boka fra databasen?')) {
      await booksService.deleteBook(book._id)
      history.push('/books')
    }
  }

  return (
    <>
      <PageTitle
        title={book.title + (book.subtitle ? ': ' + book.subtitle : '')}
      />
      <p className='pull-right'>
        <Link to='books/register' className='btn btn-success'>
          Registrer ny bok
        </Link>
        <Link to={`books/${encodeURIComponent(book._id)}/edit`}>Rediger</Link>
        <a
          className='btn btn-danger'
          href='#'
          onClick={e => {
            e.preventDefault()
            deleteBook()
          }}
        >
          Slett
        </a>
      </p>

      {!book.bib_barcode && showBarcodeForm && (
        <div className='panel panel-default panel-warning'>
          <div className='panel-heading'>
            <h3 className='panel-title'>Mangler strekkode</h3>
          </div>
          <div className='panel-body'>
            <p>
              Denne boka er ikke tilknyttet noen strekkode. Alle bøkene bør
              påføres klistrelapp med strekkode som identifiserer denne
              oppføringen i bokdatabasen.
            </p>
            <form onSubmit={e => registerBarcode()}>
              <div className='row'>
                <div className='col-sm-10'>
                  <input
                    type='text'
                    className='form-control'
                    value={barcode}
                    onChange={e => {
                      setBarcode(e.target.value)
                    }}
                    placeholder='Scan bibliotekets strekkode som påføres boken'
                    autoFocus
                  />
                </div>
                <div className='col-sm-2'>
                  <input
                    type='submit'
                    className='form-control btn-primary'
                    value='Registrer'
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className='row'>
        <div className='col-sm-9'>
          {book.bib_room && (
            <p className='text-muted'>
              Denne boka finner du i rommet <i>{book.bib_room}</i>
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

            {book.authors.length > 0 && (
              <>
                <dt>Forfattere</dt>
                <dd>
                  {book.authors.map((name, idx) => (
                    <>
                      {name}
                      {idx + 1 < book.authors.length ? ', ' : ''}
                    </>
                  ))}
                </dd>
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
        <Link to='books'>&laquo; Bokliste</Link>
      </p>
    </>
  )
}

const BookPage = ({
  match: {
    params: { id },
  },
}: {
  match: {
    params: {
      id: string
    }
  }
}) => {
  const [counter, setCounter] = useState<number>(0)

  // TODO: getBookOrRedir
  const book = useApiFetcher(() => booksService.getBook(id), [id, counter])
  if (!book) {
    return <LoadingPage />
  }

  return (
    <Detail
      book={book}
      reload={() => {
        setCounter(counter + 1)
      }}
    />
  )
}

export default BookPage
