import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Loading } from "../../../components/Loading.js"
import { ErrorMessages } from "../../../components/ErrorMessages.js"
import {
  type Book,
  type BookInput,
  useBook,
  useUpdateBookMutation,
} from "../../../features/books/hooks.js"
import { useIsMemberOf } from "../../../features/auth/hooks.js"
import { useTitle } from "../../../hooks/useTitle.js"

import { FormProvider, useForm } from "react-hook-form"
import { BookFields } from "../../../features/books/BookFields.js"

export const Route = createFileRoute("/books/$id/edit")({
  component: EditBookPage,
})

function EditBookForm({ book }: { book: Book }) {
  const { mutateAsync } = useUpdateBookMutation()
  const navigate = useNavigate()
  useTitle(`Rediger bok: ${book.title}`)

  const methods = useForm<BookInput>({
    defaultValues: {
      title: book.title,
      subtitle: book.subtitle,
      authors: book.authors,
      pubdate: book.pubdate,
      description: book.description,
      isbn: book.isbn,
      bib_comment: book.bibComment,
      bib_room: book.bibRoom,
      bib_section: book.bibSection,
    },
  })

  function onSubmit(values: BookInput) {
    void mutateAsync({ id: book.id, ...values }).then(() =>
      navigate({ to: "/books/$id", params: { id: book.id } }),
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="form-horizontal">
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <BookFields.TitleField autoFocus />
          <BookFields.SubtitleField />
          <BookFields.AuthorsField />
          <BookFields.PubdateField />
          <BookFields.DescriptionField rows={8} />
          <BookFields.BibRoomField />
          <BookFields.BibSectionField />
          <BookFields.IsbnField />
          <BookFields.BibCommentField rows={5} />
          <div className="form-group">
            <div className="col-sm-8 col-sm-offset-3">
              <input
                className="btn btn-primary"
                type="submit"
                value="Lagre endringer"
              />
              <Link
                className="btn btn-default"
                to="/books/$id"
                params={{ id: book.id }}
              >
                Avbryt
              </Link>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}

function EditBookPage() {
  const { id } = Route.useParams()
  const bookAdmin = useIsMemberOf(["biblioteksutvalget"])
  const { isPending, isError, error, data: book } = useBook(id)

  if (!bookAdmin) {
    return (
      <p>
        Denne siden er kun tilgjengelig for{" "}
        <Link to="/group/$name" params={{ name: "biblioteksutvalget" }}>
          biblioteksutvalget
        </Link>
        .
      </p>
    )
  }

  if (isPending) return <Loading />
  if (isError && book == null) return <ErrorMessages error={error} />

  return <EditBookForm book={book} />
}
