import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Loading } from "../../../components/Loading.js"
import { ErrorMessages } from "../../../components/ErrorMessages.js"
import {
  type Book,
  useBook,
  useDeleteBookMutation,
  useSetBookBarcodeMutation,
} from "../../../features/books/hooks.js"
import { useIsMemberOf } from "../../../features/auth/hooks.js"
import { PageTitle } from "../../../hooks/useTitle.js"
import { formatDate } from "../../../utils/dates.js"
import {
  listBooksUrl,
  editBookUrl,
  registerBookUrl,
} from "../../../utils/urls.js"
import { useState } from "react"

export const Route = createFileRoute("/books/$id/")({
  component: BookPage,
})

function bookTitle(book: Book) {
  return (
    (book.title ?? "Ukjent tittel") +
    (book.subtitle ? `: ${book.subtitle}` : "")
  )
}

function SetBarcode({ book }: { book: Book }) {
  const [newBarcode, setNewBarcode] = useState("")
  const { mutate } = useSetBookBarcodeMutation()

  function registerBarcode() {
    if (!newBarcode.startsWith("BS-")) {
      alert("Ugyldig strekkode for biblioteket.")
    } else {
      mutate({ bookId: book.id, barcode: newBarcode })
    }
  }

  return (
    <div className="panel panel-default panel-warning">
      <div className="panel-heading">
        <h3 className="panel-title">Mangler strekkode</h3>
      </div>
      <div className="panel-body">
        <p>
          Denne boka er ikke tilknyttet noen strekkode. Alle bøkene bør påføres
          klistrelapp med strekkode som identifiserer denne oppføringen i
          bokdatabasen.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            registerBarcode()
          }}
        >
          <div className="row">
            <div className="col-sm-10">
              <input
                type="text"
                className="form-control"
                value={newBarcode}
                onChange={(ev) => setNewBarcode(ev.target.value)}
                placeholder="Scan bibliotekets strekkode som påføres boken"
                autoFocus
              />
            </div>
            <div className="col-sm-2">
              <input
                type="submit"
                className="form-control btn-primary"
                value="Registrer"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteButton({ book }: { book: Book }) {
  const navigate = useNavigate()
  const { mutateAsync } = useDeleteBookMutation()

  function doDelete() {
    if (confirm("Er du sikker på at du vil slette boka fra databasen?")) {
      void mutateAsync(book.id).then(() => navigate({ to: listBooksUrl() }))
    }
  }

  return (
    <button className="btn btn-danger" onClick={doDelete}>
      Slett
    </button>
  )
}

function BookPage() {
  const { id } = Route.useParams()
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
            <Link to={listBooksUrl()}>Til oversikten</Link>
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
        <Link className="btn btn-success" to={registerBookUrl()}>
          Registrer ny bok
        </Link>{" "}
        <Link className="btn btn-primary" to={editBookUrl(book.id)}>
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
        <Link to={listBooksUrl()}>&laquo; Bokliste</Link>
      </p>
    </>
  )
}
