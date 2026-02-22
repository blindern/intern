import { useDebounceCallback } from "@react-hook/debounce"
import { Link } from "@tanstack/react-router"
import { ErrorMessages } from "../../components/ErrorMessages.js"
import { Loading } from "../../components/Loading.js"
import { type Book, type BookListResponse, useBookList } from "./hooks.js"
import { Pagination } from "./Pagination.js"
import { PageTitle } from "../../hooks/useTitle.js"
import { useState } from "react"

function BookItem({ book }: { book: Book }) {
  return (
    <div className="book">
      <Link to="/books/$id" params={{ id: book.id }}>
        <div className="thumb">
          {book.thumbnail && <img src={book.thumbnail} alt="" />}
        </div>
        <div className="bookdata">
          <div className="title">
            {book.title}
            {book.subtitle && (
              <span className="subtitle">: {book.subtitle}</span>
            )}
          </div>
          {book.pubdate && <div className="pubdate">{book.pubdate}</div>}
          {book.authors && (
            <div className="authors">{book.authors.join(", ")}</div>
          )}
        </div>
        <div className="placeinfo">
          {book.bibRoom && <div className="room">{book.bibRoom}</div>}
          {book.bibRoom && book.bibSection && " "}
          {book.bibSection && <div className="section">{book.bibSection}</div>}
        </div>
      </Link>
    </div>
  )
}

function BookListContent({
  isPending,
  isError,
  error,
  data,
  search,
  currentPage,
  totalPages,
  firstPage,
  prevPage,
  nextPage,
  lastPage,
}: {
  isPending: boolean
  isError: boolean
  error: Error | null
  data: BookListResponse | undefined
  search: string
  currentPage: number
  totalPages: number
  firstPage: () => void
  prevPage: () => void
  nextPage: () => void
  lastPage: () => void
}) {
  if (isPending) return <Loading />
  if (isError && data == null) return <ErrorMessages error={error} />
  if (data!.total === 0 && search !== "") return <p>Ingen treff ble funnet</p>
  if (data!.total === 0) return <p>Ingen bøker er registrert</p>

  return (
    <>
      <div className="books_list">
        {data!.data.map((book) => (
          <BookItem key={book.id} book={book} />
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
  )
}

export function ListBooksPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFormValue, setSearchFormValue] = useState("")
  const [search, setSearch] = useState("")

  const changeSearch = useDebounceCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }, 250)

  const { isPending, isError, data, error } = useBookList({
    q: search,
    page: currentPage,
  })

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0

  function nextPage() {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }
  function prevPage() {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }
  function firstPage() {
    setCurrentPage(1)
  }
  function lastPage() {
    setCurrentPage(totalPages)
  }

  return (
    <>
      <PageTitle title="Biblioteket på Blindern Studenterhjem" />
      <p style={{ float: "right" }}>
        <Link to="/books/register" className="btn btn-info">
          Registrer ny bok
        </Link>
      </p>

      <p>
        Den digitale bokdatabasen er fortsatt under utvikling, se{" "}
        <a href="https://github.com/blindern/intern/labels/bokdatabase">
          GitHub
        </a>
        . Det er{" "}
        <Link to="/group/$name" params={{ name: "biblioteksutvalget" }}>
          biblioteksutvalget
        </Link>{" "}
        som står for registrering av bøkene i biblioteket. {data?.total} bøker
        er registrert i databasen.
      </p>

      <div className="books_list">
        <form>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              value={searchFormValue}
              onChange={(ev) => {
                setSearchFormValue(ev.target.value)
                changeSearch(ev.target.value)
              }}
              placeholder="Søk etter tittel, år, forfatter, isbn eller BS-merkenr"
              autoFocus
            />
          </div>
        </form>

        <BookListContent
          isPending={isPending}
          isError={isError}
          error={error}
          data={data}
          search={search}
          currentPage={currentPage}
          totalPages={totalPages}
          firstPage={firstPage}
          prevPage={prevPage}
          nextPage={nextPage}
          lastPage={lastPage}
        />
      </div>
    </>
  )
}
