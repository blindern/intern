import {
  CreateBookPayload,
  useCreateBookMutation,
  useSearchIsbnMutation,
} from "modules/books/api.js"
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
import { useAuthorization } from "modules/core/auth/Authorization.js"
import { useFlashes } from "modules/core/flashes/FlashesProvider.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import React, { useMemo } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { bookUrl } from "utils/urls.js"

function RegisterBook() {
  const flashesService = useFlashes()
  const { mutateAsync } = useCreateBookMutation()
  const { mutateAsync: isbnMutateSync, isLoading: isbn_is_searching } =
    useSearchIsbnMutation()
  const navigate = useNavigate()

  const methods = useForm<CreateBookPayload>({
    defaultValues: {
      bib_room: sessionStorage.getItem("bookRoom") ?? "Biblioteket",
      bib_section: sessionStorage.getItem("bookSection"),
    },
  })

  const bibRoom = useWatch({
    control: methods.control,
    name: "bib_room",
  })

  const bibSection = useWatch({
    control: methods.control,
    name: "bib_section",
  })

  useMemo(() => {
    sessionStorage.setItem("bookRoom", bibRoom ?? "")
    sessionStorage.setItem("bookSection", bibSection ?? "")
  }, [bibRoom, bibSection])

  function onSubmit(values: CreateBookPayload) {
    void mutateAsync(values).then((book) => {
      navigate(bookUrl(book._id))
    })
  }

  function isbnSearch() {
    const isbn = methods.getValues("isbn")!.replace(/-/g, "")
    void isbnMutateSync(isbn).then((data) => {
      if (data.found) {
        methods.setFocus("title")
        methods.reset({
          isbn: data.isbn,
          bib_room: bibRoom,
          bib_section: bibSection,
          ...data.data,
        })
      } else {
        flashesService.addFlash({
          type: "danger",
          message: "ISBN ble ikke funnet",
        })
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
          <BibRoomField />
          <BibSectionField />
          <IsbnField autoFocus />

          <div className="form-group">
            <div className="col-sm-6 col-sm-offset-3">
              <button
                type="submit"
                className="btn btn-primary"
                onClick={() => isbnSearch()}
              >
                Søk etter bokinformasjon{isbn_is_searching && " ..."}
              </button>
            </div>
          </div>
        </form>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <TitleField />
          <SubtitleField />
          <AuthorsField />
          <PubdateField />
          <DescriptionField rows={4} />
          <BibCommentField rows={3} />
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

export function RegisterBookPage() {
  useTitle("Registrer bok")
  const { bookAdmin } = useAuthorization()

  if (!bookAdmin) {
    return <NoAuth />
  }

  return <RegisterBook />
}
