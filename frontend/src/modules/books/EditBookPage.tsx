import { Book, useBook, useUpdateBookMutation } from "modules/books/api"
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
import { bookTitle } from "modules/books/utils"
import { useAuthorization } from "modules/core/auth/Authorization"
import { useTitle } from "modules/core/title/PageTitle"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { bookUrl } from "urls"

function EditBook({ book }: { book: Book }) {
  const { mutateAsync } = useUpdateBookMutation()
  const navigate = useNavigate()

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
  const { isFetching, data: book } = useBook(id!)
  const { bookAdmin } = useAuthorization()

  useTitle(
    book
      ? bookTitle(book)
      : isFetching
      ? "Laster bok ..."
      : "Feil ved lasting av bok",
  )

  if (!bookAdmin) {
    return <NoAuth />
  }

  if (!book && isFetching) {
    return <p>Laster bok ...</p>
  }

  if (!book) {
    return <p>Feil ved henting av data</p>
  }

  return <EditBook book={book} />
}
