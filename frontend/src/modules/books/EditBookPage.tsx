import { ErrorPage } from "components/ErrorPage.js"
import { LoadingPage } from "components/LoadingPage.js"
import { Book, useBook, useUpdateBookMutation } from "modules/books/api.js"
import { BookNotFoundPage } from "modules/books/BookNotFoundPage.js"
import {
  AuthorsField,
  BibCommentField,
  BibRoomField,
  BibSectionField,
  DescriptionField,
  IsbnField,
  PubdateField,
  SubtitleField,
  TitleField,
} from "modules/books/fields.js"
import { NoAuth } from "modules/books/NoAuth.js"
import { NotFoundError } from "modules/core/api/errors.js"
import { useAuthorization } from "modules/core/auth/Authorization.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { bookUrl } from "utils/urls.js"

function EditBook({ id }: { id: string }) {
  const { isLoading, isError, error, data: book } = useBook(id)

  if (error instanceof NotFoundError) {
    return <BookNotFoundPage />
  }

  if (isLoading) {
    return <LoadingPage title="Laster bok ..." />
  }

  if (isError && book == null) {
    return <ErrorPage error={error} title="Feil ved lasting av bok" />
  }

  return <EditBookForm book={book} />
}

function EditBookForm({ book }: { book: Book }) {
  const { mutateAsync } = useUpdateBookMutation()
  const navigate = useNavigate()

  useTitle(`Rediger bok: ${book.title}`)

  const methods = useForm<Book>({
    defaultValues: book,
  })

  function onSubmit(values: Book) {
    void mutateAsync(values).then(() => {
      navigate(bookUrl(book._id))
    })
  }

  return (
    <FormProvider {...methods}>
      <div className="form-horizontal">
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <TitleField autoFocus />
          <SubtitleField />
          <AuthorsField />
          <PubdateField />
          <DescriptionField rows={8} />
          <BibRoomField />
          <BibSectionField />
          <IsbnField />
          <BibCommentField rows={5} />

          <div className="form-group">
            <div className="col-sm-8 col-sm-offset-3">
              <input
                className="btn btn-primary"
                type="submit"
                value="Lagre endringer"
              />
              <Link className="btn btn-default" to={bookUrl(book._id)}>
                Avbryt
              </Link>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}

export function EditBookPage() {
  const { id } = useParams()
  const { bookAdmin } = useAuthorization()

  if (!bookAdmin) {
    return <NoAuth />
  }

  return <EditBook id={id!} />
}
