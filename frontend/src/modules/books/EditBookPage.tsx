import { ErrorPage } from "components/ErrorPage"
import { LoadingPage } from "components/LoadingPage"
import { Book, useBook, useUpdateBookMutation } from "modules/books/api"
import { BookNotFoundPage } from "modules/books/BookNotFoundPage"
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
} from "modules/books/fields"
import { NoAuth } from "modules/books/NoAuth"
import { NotFoundError } from "modules/core/api/errors"
import { useAuthorization } from "modules/core/auth/Authorization"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { bookUrl } from "urls"

function EditBook({ id }: { id: string }) {
  const { isLoading, isError, error, data: book } = useBook(id)

  const { mutateAsync } = useUpdateBookMutation()
  const navigate = useNavigate()

  const methods = useForm<Book>({
    defaultValues: book,
  })

  if (error instanceof NotFoundError) {
    return <BookNotFoundPage />
  }

  if (isLoading) {
    return <LoadingPage title="Laster bok ..." />
  }

  if (isError && book == null) {
    return <ErrorPage error={error} title="Feil ved lasting av bok" />
  }

  function onSubmit(values: Book) {
    void mutateAsync(values).then(() => {
      navigate(bookUrl(book!._id))
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
