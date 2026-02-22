import { Link, useNavigate } from "@tanstack/react-router"
import { Loading } from "../../components/Loading.js"
import { ErrorMessages } from "../../components/ErrorMessages.js"
import { type Book, useBook, useDeleteBookMutation } from "./hooks.js"
import { SetBarcode } from "./SetBarcode.js"
import { useIsMemberOf } from "../auth/hooks.js"
import { PageTitle } from "../../hooks/useTitle.js"
import { formatDate } from "../../utils/dates.js"

function bookTitle(book: Book) {
  return (
    (book.title ?? "Ukjent tittel") +
    (book.subtitle ? `: ${book.subtitle}` : "")
  )
}

function DeleteButton({ book }: { book: Book }) {
  const navigate = useNavigate()
  const { mutateAsync } = useDeleteBookMutation()

  function doDelete() {
    if (confirm("Er du sikker på at du vil slette boka fra databasen?")) {
      void mutateAsync(book.id).then(() => navigate({ to: "/books" }))
    }
  }

  return (
    <button className="btn btn-danger" onClick={doDelete}>
      Slett
    </button>
  )
}

export function BookPage({ id }: { id: string }) {
  const { isPending, isError, error, data: book } = useBook(id)
  const bookAdmin = useIsMemberOf(["biblioteksutvalget"])

  if (isPending)
    return (
      <>
        <PageTitle title="Laster bok ..." />
        <Loading />
      </>
    )
  if ((isError || book == null) && !isPending) {
    if (book == null && !isError) {
      return (
        <>
          <PageTitle title="Ukjent bok" />
          <p>Boken er ikke registrert</p>
          <p>
            <Link to="/books">Til oversikten</Link>
          </p>
        </>
      )
    }
    return (
      <>
        <PageTitle title="Feil" />
        <ErrorMessages error={error} />
      </>
    )
  }

  return (
    <>
      <PageTitle title={bookTitle(book)} />
      <p className="pull-right">
        <Link className="btn btn-success" to="/books/register">
          Registrer ny bok
        </Link>{" "}
        <Link
          className="btn btn-primary"
          to="/books/$id/edit"
          params={{ id: book.id }}
        >
          Rediger
        </Link>{" "}
        <DeleteButton book={book} />
      </p>

      {bookAdmin && !book?.bibBarcode && <SetBarcode book={book} />}

      <div className="row">
        <div className="col-sm-9">
          {book.bibRoom && (
            <p className="text-muted">
              Denne boka finner du i rommet{" "}
              <i>{book.bibRoom || "(ikke registrert)"}</i>
              {book.bibSection && (
                <>
                  {" "}
                  under seksjonen <i>{book.bibSection}</i>
                </>
              )}
              .
            </p>
          )}

          <dl className="dl-horizontal">
            {book.pubdate && (
              <>
                <dt>Utgitt</dt>
                <dd>{book.pubdate}</dd>
              </>
            )}
            {book.authors && (
              <>
                <dt>Forfattere</dt>
                <dd>{book.authors.join(", ")}</dd>
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
            <dd>
              {book.createdAt
                ? formatDate(book.createdAt, "YYYY-MM-DD HH:mm")
                : "Ukjent"}
            </dd>
            {book.bibBarcode && (
              <>
                <dt>Nummer i databasen</dt>
                <dd>{book.bibBarcode}</dd>
              </>
            )}
          </dl>
        </div>
        <div className="col-sm-3">
          {book.thumbnail && (
            <p>
              <img src={book.thumbnail} alt="" />
            </p>
          )}
        </div>
      </div>

      <p>
        <Link to="/books">&laquo; Bokliste</Link>
      </p>
    </>
  )
}
