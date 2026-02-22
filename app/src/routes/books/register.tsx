import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  type BookInput,
  useCreateBookMutation,
  useSearchIsbnMutation,
} from "../../features/books/hooks.js"
import { useIsMemberOf } from "../../features/auth/hooks.js"
import { useFlashes } from "../../hooks/useFlashes.js"
import { PageTitle } from "../../hooks/useTitle.js"

import { useEffect } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { BookFields } from "../../features/books/BookFields.js"

export const Route = createFileRoute("/books/register")({
  component: RegisterBookPage,
})

function RegisterBook() {
  const { addFlash } = useFlashes()
  const { mutateAsync } = useCreateBookMutation()
  const { mutateAsync: isbnMutateAsync, isPending: isbn_is_searching } =
    useSearchIsbnMutation()
  const navigate = useNavigate()

  const methods = useForm<BookInput>({
    defaultValues: {
      bib_room:
        typeof sessionStorage !== "undefined"
          ? (sessionStorage.getItem("bookRoom") ?? "Biblioteket")
          : "Biblioteket",
      bib_section:
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem("bookSection")
          : undefined,
    },
  })

  const bibRoom = useWatch({ control: methods.control, name: "bib_room" })
  const bibSection = useWatch({ control: methods.control, name: "bib_section" })

  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("bookRoom", bibRoom ?? "")
      sessionStorage.setItem("bookSection", bibSection ?? "")
    }
  }, [bibRoom, bibSection])

  function onSubmit(values: BookInput) {
    void mutateAsync(values).then((book) =>
      navigate({ to: "/books/$id", params: { id: book.id } }),
    )
  }

  function isbnSearch() {
    const isbn = methods.getValues("isbn")!.replace(/-/g, "")
    void isbnMutateAsync(isbn).then((data) => {
      if (data.found) {
        methods.setFocus("title")
        methods.reset({
          isbn: data.isbn,
          bib_room: bibRoom,
          bib_section: bibSection,
          ...data.data,
        })
      } else {
        addFlash({ type: "danger", message: "ISBN ble ikke funnet" })
      }
    })
  }

  return (
    <FormProvider {...methods}>
      <div className="form-horizontal">
        <p>
          Dette skjemaet benyttes til å registrere bøker i biblioteket.
          ISBN-søket benytter Google Books til å søke etter bokinformasjon, og
          vil fylle inn feltene automatisk hvis boka blir funnet.
        </p>

        <form onSubmit={(ev) => ev.preventDefault()}>
          <BookFields.BibRoomField />
          <BookFields.BibSectionField />
          <BookFields.IsbnField autoFocus />
          <div className="form-group">
            <div className="col-sm-6 col-sm-offset-3">
              <button
                type="submit"
                className="btn btn-primary"
                onClick={isbnSearch}
              >
                Søk etter bokinformasjon{isbn_is_searching && " ..."}
              </button>
            </div>
          </div>
        </form>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <BookFields.TitleField />
          <BookFields.SubtitleField />
          <BookFields.AuthorsField />
          <BookFields.PubdateField />
          <BookFields.DescriptionField rows={4} />
          <BookFields.BibCommentField rows={3} />
          <div className="form-group">
            <div className="col-sm-8 col-sm-offset-3">
              <input
                type="submit"
                className="btn btn-primary"
                value="Registrer bok i databasen"
              />
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}

function RegisterBookPage() {
  const bookAdmin = useIsMemberOf(["biblioteksutvalget"])

  if (!bookAdmin) {
    return (
      <>
        <PageTitle title="Registrer bok" />
        <p>
          Denne siden er kun tilgjengelig for{" "}
          <Link to="/group/$name" params={{ name: "biblioteksutvalget" }}>
            biblioteksutvalget
          </Link>
          .
        </p>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Registrer bok" />
      <RegisterBook />
    </>
  )
}
